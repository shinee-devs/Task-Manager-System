CREATE TABLE IF NOT EXISTS php_sessions (
  session_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
  payload MEDIUMBLOB NOT NULL,
  expires_at BIGINT UNSIGNED NOT NULL,
  KEY index_php_sessions_expiry (expires_at)
) ENGINE=InnoDB;CREATE TABLE IF NOT EXISTS php_sessions (
  session_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
  payload MEDIUMBLOB NOT NULL,
  expires_at BIGINT UNSIGNED NOT NULL,
  KEY index_php_sessions_expiry (expires_at)
) ENGINE=InnoDB;