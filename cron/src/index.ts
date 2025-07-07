import "./workers/notification"
import "./workers/cron"
import { scheduleCron } from "./lib/schedule"

scheduleCron()
    .catch(err => console.error("CRON INIT FAILED :", err))

console.log("Bull MQ workers started!")