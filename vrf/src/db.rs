use std::time::Duration;

use anyhow::Result;
use diesel::{
    prelude::*,
    r2d2::{self, ConnectionManager},
    result::DatabaseErrorKind,
    serialize::ToSql,
    sql_types::Integer,
    AsExpression, MysqlConnection,
};
use once_cell::sync::OnceCell;

#[repr(i32)]
#[derive(AsExpression, Debug, Clone, Copy)]
#[diesel(sql_type = Integer)]
enum Status {
    #[allow(dead_code)]
    Unknown = 0,
    New = 1,
    Processing = 2,
    Processed = 3,
    FatalError = 4,
    RetryableError = 5,
}

impl ToSql<Integer, diesel::mysql::Mysql> for Status
where
    i32: ToSql<Integer, diesel::mysql::Mysql>,
{
    fn to_sql<'b>(&'b self, out: &mut diesel::serialize::Output<'b, '_, diesel::mysql::Mysql>) -> diesel::serialize::Result {
        let v = *self as i32;
        <i32 as ToSql<Integer, diesel::mysql::Mysql>>::to_sql(&v, &mut out.reborrow())
    }
}

mod schema {
    diesel::table! {
        vrf (id) {
            id -> Integer,
            program_id -> Varchar,
            transaction -> Varchar,
            status -> Integer,
            vrf_seeds -> Nullable<Blob>,
            vrf_proof -> Nullable<Blob>,
            response_transaction -> Nullable<Varchar>,
            log_messages -> Text,
            errors -> Nullable<Text>,
            time_create -> Timestamp,
            time_update -> Timestamp,
        }
    }
}

type DbConnection = r2d2::PooledConnection<ConnectionManager<MysqlConnection>>;
type Pool = r2d2::Pool<ConnectionManager<MysqlConnection>>;

static DB: OnceCell<Pool> = OnceCell::new();

pub fn init(database_url: &str) {
    DB.get_or_init(|| {
        let manager = ConnectionManager::<MysqlConnection>::new(database_url);
        Pool::builder()
            .connection_timeout(Duration::from_secs(5))
            .test_on_check_out(true)
            .build(manager)
            .unwrap()
    });
}

fn connection() -> Result<DbConnection> {
    Ok(DB.get().expect("db::init() already be called").get()?)
}

pub fn run_migration() -> Result<()> {
    use diesel_migrations::MigrationHarness;

    let mut conn = connection()?;
    let migration_source = diesel_migrations::FileBasedMigrations::find_migrations_directory()?;
    conn.run_pending_migrations(migration_source).expect("run_pending_migrations");
    Ok(())
}

#[allow(non_snake_case)]
#[derive(Insertable)]
#[diesel(table_name = schema::vrf)]
struct NewTrans<'a> {
    program_id: &'a str,
    transaction: &'a str,
    status: Status,
    log_messages: &'a str,
}

pub fn new_transaction(program_id: &str, transaction: &str, log_messages: &str) -> Result<bool> {
    let mut conn = connection()?;
    let result = diesel::insert_into(schema::vrf::table)
        .values(&NewTrans {
            program_id,
            transaction,
            status: Status::New,
            log_messages,
        })
        .execute(&mut conn);

    match result {
        Ok(1) => Ok(true),
        Ok(_) => Err(anyhow::anyhow!("No row affected")),
        Err(diesel::result::Error::DatabaseError(DatabaseErrorKind::CheckViolation | DatabaseErrorKind::UniqueViolation, _)) => Ok(false),
        Err(err) => Err(err.into()),
    }
}

pub fn process_transaction(program_id: &str, transaction: &str) -> Result<bool> {
    use schema::vrf::dsl;

    let mut conn = connection()?;
    let result = diesel::update(
        dsl::vrf.filter(
            dsl::program_id
                .eq(program_id)
                .and(dsl::transaction.eq(transaction))
                .and(dsl::status.ne(Status::Processed)),
        ),
    )
    .set(dsl::status.eq(Status::Processing))
    .execute(&mut conn);

    match result {
        Ok(1) => Ok(true),
        Ok(_) => Err(anyhow::anyhow!("No row affected")),
        Err(diesel::result::Error::DatabaseError(DatabaseErrorKind::CheckViolation | DatabaseErrorKind::UniqueViolation, _)) => Ok(false),
        Err(err) => Err(err.into()),
    }
}

pub fn complete_none_vrf_processing(program_id: &str, transaction: &str) -> Result<()> {
    use schema::vrf::dsl;

    let mut conn = connection()?;
    let row_affected = diesel::update(
        dsl::vrf.filter(
            dsl::program_id
                .eq(program_id)
                .and(dsl::transaction.eq(transaction))
                .and(dsl::status.eq(Status::Processing)),
        ),
    )
    .set((dsl::status.eq(Status::Processed),))
    .execute(&mut conn)?;

    if row_affected == 1 {
        Ok(())
    } else {
        Err(anyhow::anyhow!("No row affected"))
    }
}

pub fn complete_processing(
    program_id: &str,
    transaction: &str,
    response_transaction: String,
    vrf_seeds: Vec<u8>,
    vrf_proof: Vec<u8>,
) -> Result<()> {
    use schema::vrf::dsl;

    let mut conn = connection()?;
    let row_affected = diesel::update(
        dsl::vrf.filter(
            dsl::program_id
                .eq(program_id)
                .and(dsl::transaction.eq(transaction))
                .and(dsl::status.eq(Status::Processing)),
        ),
    )
    .set((
        dsl::status.eq(Status::Processed),
        dsl::vrf_seeds.eq(vrf_seeds),
        dsl::vrf_proof.eq(vrf_proof),
        dsl::response_transaction.eq(response_transaction),
    ))
    .execute(&mut conn)?;

    if row_affected == 1 {
        Ok(())
    } else {
        Err(anyhow::anyhow!("No row affected"))
    }
}

pub fn error_processing(program_id: &str, transaction: &str, is_fatal: bool, errors: String) -> Result<()> {
    use schema::vrf::dsl;

    let mut conn = connection()?;
    let row_affected = diesel::update(
        dsl::vrf.filter(
            dsl::program_id
                .eq(program_id)
                .and(dsl::transaction.eq(transaction))
                .and(dsl::status.eq(Status::Processing)),
        ),
    )
    .set((
        dsl::status.eq(if is_fatal { Status::FatalError } else { Status::RetryableError }),
        dsl::errors.eq(errors),
    ))
    .execute(&mut conn)?;

    if row_affected == 1 {
        Ok(())
    } else {
        Err(anyhow::anyhow!("No row affected"))
    }
}

#[derive(Queryable)]
pub struct RetryableTransaction {
    pub program_id: String,
    pub transaction: String,
    pub log_messages: String,
}

pub fn get_retryable_transaction(min_last_update: std::time::Duration) -> Result<Vec<RetryableTransaction>> {
    use schema::vrf::dsl;

    let timestamp = chrono::Utc::now() - chrono::Duration::from_std(min_last_update).unwrap();
    let timestamp = timestamp.naive_utc();

    let mut conn = connection()?;
    Ok(schema::vrf::table
        .select((dsl::program_id, dsl::transaction, dsl::log_messages))
        .filter(dsl::status.eq(Status::RetryableError).and(dsl::time_update.lt(timestamp)))
        .limit(20)
        .load::<RetryableTransaction>(&mut conn)?)
}

pub fn get_transactions(program_id: &str, limit: usize) -> Result<Vec<String>> {
    use schema::vrf::dsl;

    let mut conn = connection()?;
    Ok(schema::vrf::table
        .select(dsl::transaction)
        .filter(dsl::program_id.eq(program_id))
        .order(dsl::time_create.desc())
        .limit(limit as i64)
        .load::<String>(&mut conn)?)
}
