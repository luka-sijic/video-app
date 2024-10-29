package database

import (
	"fmt"
	"context"
	"github.com/joho/godotenv"
	"github.com/jackc/pgx/v4/pgxpool"
	"log"
	"os"
)

var DB *pgxpool.Pool

func init() {
    err := godotenv.Load(".env")
    if err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }
}


func Connect() {
	dbURL := os.Getenv("DATABASE_URL")
	var err error
	DB, err = pgxpool.Connect(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	fmt.Println("Database connected")
}

func Close() {
	DB.Close()
}