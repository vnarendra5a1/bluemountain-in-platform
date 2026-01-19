import { Kafka } from "kafkajs"

const kafka = new Kafka({
    clientId: "platform",
    brokers: ["localhost:9092"]
})

export const producer = kafka.producer()
export const consumer = kafka.consumer({ groupId: "platform-group" })

export async function initKafka() {
    await producer.connect()
    await consumer.connect()
}
