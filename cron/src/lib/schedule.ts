import { cronQueue } from "../queues/cron"

export const scheduleCron = async() => {
    cronQueue.add("populate-redis", {}, {
        repeat : {
            pattern : ""
        },
        removeOnComplete : true,
        removeOnFail : true
    })
}