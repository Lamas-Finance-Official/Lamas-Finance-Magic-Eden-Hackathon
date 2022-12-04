
CREATE TABLE vrf (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	program_id VARCHAR(128) CHARACTER SET UTF8MB4 NOT NULL,
    `transaction` VARCHAR(128) CHARACTER SET UTF8MB4 NOT NULL,
    `status` ENUM('new', 'processing', 'processed', 'fatal_error', 'retryable_error') NOT NULL,
    vrf_seeds BLOB,
    vrf_proof BLOB,
    response_transaction VARCHAR(128) CHARACTER SET UTF8MB4,
    log_messages TEXT CHARACTER SET UTF8MB4,
    errors TEXT CHARACTER SET UTF8MB4,
	time_create TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
	time_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
	UNIQUE KEY index_program_tx(program_id, `transaction`),
	INDEX index_status(status)
);
