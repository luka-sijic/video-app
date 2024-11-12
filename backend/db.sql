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
CREATE TABLE comments (                                                                       
    id SERIAL PRIMARY KEY NOT NULL,
    content text NOT NULL,
    username character varying(255) NOT NULL,
    video_id integer NOT NULL,
    likes integer DEFAULT 0,
    commented_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
