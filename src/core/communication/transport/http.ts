
import axios from "axios"
import { ForwardCallOptions } from ".."
import { ServiceConfig } from "../config"
import { resolveRequest } from "store/correlationStore"

export async function webForward<TReq>(
    opts: ForwardCallOptions<TReq>,
    requestId: string,
) {
    const {
        action,
        payload,
        targetService,
        authToken
    } = opts
    const serviceConfig = ServiceConfig[targetService]
    if (!serviceConfig) {
        throw new Error(`No config found for service: ${targetService}`)
    }
    const httpConfig = serviceConfig.operations[action]
    if (!httpConfig) {
        throw new Error(`No end poing config found in the service: ${targetService} for the action ${action}`)
    }
    const {
        baseUrl,
        method,
        headers = {}
    } = httpConfig
    headers['Authorization'] = authToken
    let response

    if (method === "GET") {
        response = await axios.get(baseUrl, {
            params: payload,
            headers
        })
    } else if (method === "POST") {
        response = await axios.post(
            baseUrl,
            payload,
            {
                headers
            }
        )
    } else {
        throw new Error(`Unsupported HTTP method`)
    }

    resolveRequest(requestId, {
        status: response.status,
        statusText: response.statusText,
        data: response.data
    })
}