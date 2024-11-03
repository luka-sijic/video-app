CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    username VARCHAR(255) NOT NULL,
    visibility INT NOT NULL,
    uploadDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    thumbnail VARCHAR(255),
    duration VARCHAR(255),
    views INT DEFAULT 0
);