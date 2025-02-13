package database

import (
	"fmt"
	"context"
	"github.com/joho/godotenv"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/credentials"
    "github.com/aws/aws-sdk-go-v2/service/s3"
	"log"
	"os"
)

var DB *pgxpool.Pool
var RDB *redis.Client
var R2 *s3.Client

func init() {
    err := godotenv.Load(".env")
    if err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }
}

func Connect() {
	err := InitR2Client(os.Getenv("ACCOUNT_ID"), os.Getenv("ACCESSKEYID"), os.Getenv("ACCESSKEYSECRET"))
	if err != nil {
		log.Fatalf("Failed to initialize R2 client: %v", err)
	}
	ConnectPostgres()
	ConnectRedis()
}

func InitR2Client(accountId, accessKeyId, accessKeySecret string) error {
    r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
        return aws.Endpoint{
            URL: fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountId),
        }, nil
    })

    cfg, err := config.LoadDefaultConfig(context.TODO(),
        config.WithEndpointResolverWithOptions(r2Resolver),
        config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
            accessKeyId,
            accessKeySecret,
            "",
        )),
        config.WithRegion("auto"),
    )
    if err != nil {
        return fmt.Errorf("failed to load R2 configuration: %w", err)
    }

    // Initialize the global R2 client
    R2 = s3.NewFromConfig(cfg)
    fmt.Println("R2 connected")
    return nil
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
