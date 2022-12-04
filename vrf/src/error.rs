pub struct ProcessError {
    pub is_fatal: bool,
    pub error: anyhow::Error,
}

impl<T> From<T> for ProcessError
where
    T: std::error::Error + Send + Sync + 'static,
{
    fn from(err: T) -> Self {
        Self {
            is_fatal: false,
            error: anyhow::Error::from(err),
        }
    }
}

pub trait FatalProcessError<T> {
    fn fatal_error(self) -> Result<T, ProcessError>;

    fn fatal_error_with_context<S>(self, context: S) -> Result<T, ProcessError>
    where
        S: std::fmt::Display + Send + Sync + 'static;
}

impl<T, E> FatalProcessError<T> for Result<T, E>
where
    E: std::error::Error + Send + Sync + 'static,
{
    fn fatal_error(self) -> Result<T, ProcessError> {
        self.map_err(|err| ProcessError {
            is_fatal: true,
            error: anyhow::Error::new(err),
        })
    }

    fn fatal_error_with_context<S>(self, context: S) -> Result<T, ProcessError>
    where
        S: std::fmt::Display + Send + Sync + 'static,
    {
        self.map_err(|err| ProcessError {
            is_fatal: true,
            error: anyhow::Error::new(err).context(context),
        })
    }
}
