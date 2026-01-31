import { randomUUID } from "crypto"
import { producer } from "kafka/kafkaTransport"
import { ForwardCallOptions } from ".."


export async function mqForward<TReq>(
    opts: ForwardCallOptions<TReq>,
    requestId: string
) {
    await producer.send({
        topic: `platform.requests.${opts.targetService}`,
        messages: [
            {
                key: requestId,
                value: JSON.stringify({
                    requestId,
                    action: opts.action,
                    payload: opts.payload,
                    replyTo: "platform.responses"
                })
            }
        ]
    })
}


export async function mqNotify<TReq>(
    opts: ForwardCallOptions<TReq>
) {
    const requestId = randomUUID()
    await producer.send({
        topic: `platform.requests.${opts.targetService}`,
        messages: [
            {
                key: requestId,
                value: JSON.stringify({
                    requestId,
                    action: opts.action,
                    payload: opts.payload,
                })
            }
        ]
    })
}