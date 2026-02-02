import { consumer } from "../index"
import {
    forward
} from "core"
/**
 * Scenario - 1
 * Service A call Service B over MQ, 
 * 1. In core lib (forward call), we should connect to producer to send message, 
 * 2. Cosumer logic is part of MQ broker service which pick up the message.
 * 3. In our MQ broker service code we pick up HTTP config from ETCD and invoke as HTTP request.
 */

export async function startSubscriptionOnSpecificTopic(topic: string) {
    await consumer.subscribe({
        topic,
        fromBeginning: false
    })
}

export async function startSubscription(topics: string[]) {
    await consumer.subscribe({
        topics,
        fromBeginning: false
    })
}

export async function startResponseListener() {
    await consumer.run({
        eachMessage: processMessage
    })
}

async function processMessage(notification: any) {
    console.log("Incoming message notification, onStart");
    const {
        message,
        topic
    } = notification
    if (!message.value) return
    const request = JSON.parse(message.value.toString())
    const {
        requestId,
        action,
        payload,
        authToken
    } = request
    console.log(`$Process Message topic = ${topic}, request id = ${requestId}, action = ${action}`);
    const serviceName = topic.split(".")[2]
    if (serviceName) {
        const response = await forward({
            action,
            payload,
            targetService: serviceName,
            authToken,
            requestId,
            mode: "WEB"
        })
        console.log("Request processed successfully, ", response);
    }
    console.log("Failed to get service name from topic.");

}

