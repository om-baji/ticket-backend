package db

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

var Redis *redis.Client

func init() {
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatal(".env load failed ", err.Error())
	}
}

func GetClient() *redis.Client {

	url := os.Getenv("REDIS_URI")
	opt, err := redis.ParseURL(url)

	if err != nil {
		log.Fatal("Redis error ", err.Error())
	}

	Redis = redis.NewClient(opt)
	return Redis
}
