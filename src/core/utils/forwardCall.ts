import { randomUUID } from "crypto"
import { producer } from "kafka/kafkaTransport"
import { addRequest } from "store/correlationStore"


interface ForwardCallOptions<T> {
    targetService: string
    action: string
    payload: T
}

export async function forward<TReq, TRes>(
    opts: ForwardCallOptions<TReq>
): Promise<TRes> {
    const requestId = randomUUID()
    const promise = addRequest(requestId, 5000)
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

    return promise
}


export async function notify<TReq, TRes>(
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