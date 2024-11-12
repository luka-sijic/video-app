package database

import (
	"fmt"
	"context"
//	"github.com/joho/godotenv"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/redis/go-redis/v9"
	"log"
	"os"
)

var DB *pgxpool.Pool
var RDB *redis.Client

//func init() {
//    err := godotenv.Load(".env")
//    if err != nil {
//        log.Fatalf("Error loading .env file: %v", err)
//    }
//}

func Connect() {
	ConnectPostgres()
	ConnectRedis()
}

func ConnectRedis() {
	redisAddr := os.Getenv("REDIS_ADDR")
	redisPassword := os.Getenv("REDIS_PASS")

	RDB = redis.NewClient(&redis.Options{
        Addr:     redisAddr,
        Password: redisPassword, // no password if empty
        DB:       0,             // default DB
    })

    // Test Redis connection
    _, err := RDB.Ping(context.Background()).Result()
    if err != nil {
        log.Fatalf("Unable to connect to Redis: %v\n", err)
    }
    fmt.Println("Redis connected")
}

func ConnectPostgres() {
	dbURL := os.Getenv("DATABASE_URL")
	var err error
	DB, err = pgxpool.Connect(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	fmt.Println("Postgres connected")
}

func Close() {
	if DB != nil {
		DB.Close()
	}
	if RDB != nil {
		if err := RDB.Close(); err != nil {
			log.Printf("Error closing redis connection: %v\n", err)
		}
	}
}
