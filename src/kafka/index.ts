import { Kafka } from "kafkajs"
import {
    loadConfig,
    HttpConfig,
    startHttpConfigWatcher,
    addTestConfig
} from "core"
import { startResponseListener, startSubscription, startSubscriptionOnSpecificTopic } from "./listener"

const kafka = new Kafka({
    clientId: "platform",
    brokers: ["localhost:9092"]
})

const topics = []

export const consumer = kafka.consumer({ groupId: "platform-group" })

export async function init() {
    await consumer.connect()
    // const topics = await loadConfig()
    const topics = ['platform.requests.updates']
    await startSubscription(
        topics
    )
    // await startHttpConfigWatcher(
    //     on
    // )
    await startResponseListener()
    addTestConfig()
}

function on(
    operation: "PUT" | "DELETE", config: HttpConfig
) {
    switch (operation) {
        case 'PUT': {
            const topic = `platform.requests.${config.serviceName}`
            startSubscriptionOnSpecificTopic(topic)
            topics.push(
                topic
            )
        }
            break
    }
}

