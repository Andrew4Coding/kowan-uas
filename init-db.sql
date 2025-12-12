CREATE TABLE IF NOT EXISTS users(
    id       VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS credentials(
    id            SERIAL PRIMARY KEY,
    user_id       VARCHAR(255) NOT NULL,
    credential_id VARCHAR(255) NOT NULL,
    public_key    TEXT         NOT NULL,
    counter       INT          NOT NULL,
    transports    VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users (id)
);
