import { resolveRequest } from "store/correlationStore"
import { consumer } from "./kafkaTransport"

export async function startResponseListener() {
    await consumer.subscribe({
        topic: "platform.responses",
        fromBeginning: false
    })

    await consumer.run({
        eachMessage: async ({ message }) => {
            if (!message.value) return

            const response = JSON.parse(message.value.toString())
            resolveRequest(response.requestId, response)
        }
    })
}
