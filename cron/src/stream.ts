import { redis } from "./utils"

const listner = async () => {
    while(true) {

        const data = await redis.xread("STREAMS")

    }
}