package models

import (
    "github.com/google/uuid"
)

type User struct {
	ID uuid.UUID `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Credits int `json:"credits"`
    Role int `json:"role"`
    Status int `json:"status"`
    Country string `json:"country"`
    Rating int `json:"rating"`
    Avatar string `json:"avatar"`
    CreationDate string `json:"creationdate"`
}

/*

CREATE TABLE users (
	-- Account Info
	id SERIAL PRIMARY KEY,
	username VARCHAR(255) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL,
    credits INT NOT NULL,
	balance INT NOT NULL,
	status INT NOT NULL,
	createdAt TIMESTAMP,
	role VARCHAR(255) NOT NULL,
	country VARCHAR(255) NOT NULL,
	avatar VARCHAR(255) NOT NULL,
);
*/
