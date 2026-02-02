import { randomUUID } from "crypto"
import { mqForward, mqNotify } from "./transport/kafka"
import { addRequest } from "store/correlationStore"
import { webForward } from "./transport/http"


export interface ForwardCallOptions<T> {
    targetService: string
    action: string
    payload: T,
    mode: "WEB",
    authToken: string,
    requestId?: string,
    sourceService: string
}

export async function forward<TReq, TRes>(
    opts: ForwardCallOptions<TReq>
): Promise<TRes> {
    const requestId = randomUUID()
    return webForward(
        opts,
        requestId
    )
}

export async function notify<TReq, TRes>(
    opts: ForwardCallOptions<TReq>
) {
    const requestId = randomUUID()
    return mqNotify(
        opts,
        requestId
    )
}