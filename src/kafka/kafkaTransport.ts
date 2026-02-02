import { Kafka } from "kafkajs"

const kafka = new Kafka({
    clientId: "platform",
    brokers: ["localhost:9092"]
})

export const producer = kafka.producer()

export async function initKafka() {
    await producer.connect()
}
