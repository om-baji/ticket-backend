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

	lua = redis.NewScript(`
		local bitmapKey = KEYS[1]
		local zsetKey = KEYS[2]
		local berthHashKey = KEYS[3]
		local preferredBerth = ARGV[1]

		local seats = redis.call("ZRANGE", zsetKey, 0, 9)
		for _, seat in ipairs(seats) do
			local seatNum = tonumber(string.match(seat, "-(%d+)$"))
			if seatNum then
				local index = seatNum - 1
				local bit = redis.call("GETBIT", bitmapKey, index)
				if bit == 0 then
					local berth = redis.call("HGET", berthHashKey, tostring(seatNum))
					if berth == preferredBerth then
						redis.call("SETBIT", bitmapKey, index, 1)
						redis.call("ZREM", zsetKey, seat)
						return seat
					end
				end
			end
		end
		return nil
	`)
)

func ConcurrentSeat(passenger *pb.Passenger, trainId, class string, wg *sync.WaitGroup, resultChan chan<- *pb.Seats) {
	defer wg.Done()

	mappedClass := coachMap[class]
	preferredBerth := passenger.Berth

	bitmapKey := "redis:BITMAP:" + trainId + ":" + mappedClass
	zsetKey := "redis:ZSET:" + trainId + ":" + mappedClass
	berthMapKey := "redis:HASH:BERTH:" + trainId + ":" + mappedClass

	val, err := lua.Run(ctx, redisClient, []string{bitmapKey, zsetKey, berthMapKey}, preferredBerth).Result()
	if err != nil {
		fmt.Println("Lua script error:", err)
	}

	for _, fallbackBerth := range berthOptions {
		if val != nil {
			break
		}
		if fallbackBerth == preferredBerth {
			continue
		}
		val, err = lua.Run(ctx, redisClient, []string{bitmapKey, zsetKey, berthMapKey}, fallbackBerth).Result()
		if err != nil {
			fmt.Println("Lua fallback error:", err)
		}
		preferredBerth = fallbackBerth
	}

	if valStr, ok := val.(string); ok {
		resultChan <- &pb.Seats{
			SeatNo: valStr,
			Berth:  preferredBerth,
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
