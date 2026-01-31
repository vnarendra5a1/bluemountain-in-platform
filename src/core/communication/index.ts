import { randomUUID } from "crypto"
import { mqForward, mqNotify } from "./transport/kafka"
import { addRequest } from "store/correlationStore"
import { webForward } from "./transport/http"


export interface ForwardCallOptions<T> {
    targetService: string
    action: string
    payload: T,
    mode: "WEB" | "MQ",
    authToken: string
}

export async function forward<TReq, TRes>(
    opts: ForwardCallOptions<TReq>
): Promise<TRes> {
    const requestId = randomUUID()
    const promise = addRequest(requestId, 5000)

    switch (opts.mode) {
        case "MQ":
            await mqForward(
                opts,
                requestId
            )
        case "WEB":
            await webForward(
                opts,
                requestId
            )
            break
        default:
            throw new Error(`Unsupported mode.`)
    }
    return promise
}

export async function notify<TReq, TRes>(
    opts: ForwardCallOptions<TReq>
) {
    await mqNotify(
        opts
    )
}