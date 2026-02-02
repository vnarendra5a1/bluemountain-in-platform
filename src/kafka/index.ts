import { Kafka } from "kafkajs"
import {
    loadConfig,
    HttpConfig,
    startHttpConfigWatcher
} from "core"
import { startSubscription, startSubscriptionOnSpecificTopic } from "./listener"

const kafka = new Kafka({
    clientId: "platform",
    brokers: ["localhost:9092"]
})

const topics = []

export const consumer = kafka.consumer({ groupId: "platform-group" })

export async function init() {
    await consumer.connect()
    const topics = await loadConfig()
    await startSubscription(
        topics
    )
    await startHttpConfigWatcher(
        on
    )
}

function on(
    operation: "PUT" | "DELETE", config: HttpConfig
) {
    switch (operation) {
        case 'PUT':
            startSubscriptionOnSpecificTopic(config.mqTopic)
            break
    }
}

