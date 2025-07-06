package helper

import (
	"context"
	"fmt"
	"sync"

	pb "github.com/om-baji/ticket-backend/proto"
	"github.com/om-baji/ticket-backend/ticket-engine/db"
	"github.com/redis/go-redis/v9"
)

var redisClient *redis.Client = db.GetClient()
var ctx = context.Background()

var coachMap = map[string]string{
	"SL":      "SL",
	"FIRSTA":  "1A",
	"SECONDA": "2A",
	"THIRDA":  "3A",
}

func ConcurrentSeat(passenger *pb.Passenger, trainId string, class string, wg *sync.WaitGroup, resultChan chan<- *pb.Seats) {
	defer wg.Done()

	berth := passenger.Berth
	mappedClass := coachMap[class]

	bitmapKey := "redis:BITMAP:" + trainId + ":" + mappedClass + ":" + berth
	zsetKey := "redis:ZSET:" + trainId + ":" + mappedClass + ":" + berth

	lua := redis.NewScript(`
	local seat = redis.call("ZRANGE", KEYS[2], 0, 0)[1]
	if not seat then return nil end
	local index = tonumber(string.match(seat, "-(%d+)$"))
	if not index or index < 1 then return nil end
	index = index - 1
	local bit = redis.call("GETBIT", KEYS[1], index)
	if bit == 1 then return nil end
	redis.call("SETBIT", KEYS[1], index, 1)
	redis.call("ZREM", KEYS[2], seat)
	return seat
`)

	val, err := lua.Run(ctx, redisClient, []string{bitmapKey, zsetKey}).Result()
	if err != nil {
		fmt.Println("Lua script error:", err)
	}

	if val == nil {
		resultChan <- &pb.Seats{
			SeatNo: "NA",
			Berth:  "NONE",
			Status: "WAITLISTED",
			Info:   passenger,
		}
		return
	}

	seatStr := val.(string)
	resultChan <- &pb.Seats{
		SeatNo: seatStr,
		Berth:  berth,
		Status: "CONFIRMED",
		Info:   passenger,
	}

}
