import { Kafka } from "kafkajs"

const producers = new Map();

export const createProducer = async ({ clientId, brokers }: {
    clientId: string,
    brokers: string[]
}) => {
    if (!clientId) throw new Error("clientId is required");
    if (producers.has(clientId)) {
        return producers.get(clientId);
    }
    const kafka = new Kafka({
        clientId,
        brokers,
    });
    const producer = kafka.producer();
    await producer.connect();
    producers.set(clientId, producer);
    return producer;
};