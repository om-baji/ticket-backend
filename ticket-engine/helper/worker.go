package helper

import (
	"context"
	"fmt"
	"sync"

	pb "github.com/om-baji/ticket-backend/proto"
	"github.com/om-baji/ticket-backend/ticket-engine/db"
	"github.com/redis/go-redis/v9"
)

var (
	redisClient = db.GetClient()
	ctx         = context.Background()

	coachMap = map[string]string{
		"SL":      "SL",
		"FIRSTA":  "1A",
		"SECONDA": "2A",
		"THIRDA":  "3A",
	}

	berthOptions = []string{"LB", "MB", "UB", "SL", "SU", "NONE"}

	luaScript = redis.NewScript(`
		local seat = redis.call("ZRANGE", KEYS[2], 0, 0)[1]
		if not seat then return nil end
		local index = tonumber(string.match(seat, "-(%d+)$"))
		if not index or index < 1 then return nil end
		index = index - 1
		if redis.call("GETBIT", KEYS[1], index) == 1 then return nil end
		redis.call("SETBIT", KEYS[1], index, 1)
		redis.call("ZREM", KEYS[2], seat)
		return seat
	`)
)

func ConcurrentSeat(passenger *pb.Passenger, trainId, class string, wg *sync.WaitGroup, resultChan chan<- *pb.Seats) {
	defer wg.Done()

	mappedClass := coachMap[class]
	berth := passenger.Berth

	tryAllocate := func(berth string) (interface{}, error) {
		bitmapKey := "redis:BITMAP:" + trainId + ":" + mappedClass + ":" + berth
		zsetKey := "redis:ZSET:" + trainId + ":" + mappedClass + ":" + berth
		return luaScript.Run(ctx, redisClient, []string{bitmapKey, zsetKey}).Result()
	}

	val, err := tryAllocate(berth)
	if err != nil {
		fmt.Println("Lua script error:", err)
	}

	for i := 0; val == nil && i < len(berthOptions); i++ {
		if berthOptions[i] == berth {
			continue
		}
		val, err = tryAllocate(berthOptions[i])
		if err != nil {
			fmt.Println("Lua script error:", err)
		}
		if val != nil {
			berth = berthOptions[i]
			break
		}
	}

	if valStr, ok := val.(string); ok {
		resultChan <- &pb.Seats{
			SeatNo: valStr,
			Berth:  berth,
			Status: "CONFIRMED",
			Info:   passenger,
		}
	} else {
		resultChan <- &pb.Seats{
			SeatNo: "NA",
			Berth:  "NONE",
			Status: "WL",
			Info:   passenger,
		}
	}
}
