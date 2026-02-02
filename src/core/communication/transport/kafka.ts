import { producer } from "kafka/kafkaTransport"
import { ForwardCallOptions } from ".."


/**
 * 
 * @param opts - Forward call options.
 * @param requestId - Request ID.
 * 
 * This we need to enhance to achive native time out to call and await on KAFKA.
 */
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
                    replyTo: "platform.responses" // TODO check here.
                })
            }
        ]
    })
}


/**
 * 
 * @param opts - Forward call notify, just to publish the details.
 * 
 * This method will publish the message on required channel, and down stream will take 
 * care of the request.
 */
export async function mqNotify<TReq, TRes>(
    opts: ForwardCallOptions<TReq>,
    requestId: string
): Promise<TRes> {
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
    return { "success": true } as TRes
}