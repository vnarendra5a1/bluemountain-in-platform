
import axios from "axios"
import { ForwardCallOptions } from ".."
import { ServiceConfig } from "../config"
import { Log } from "@core/utils/Log"

/**
 * 
 * @param opts - Forward call options.
 * @param requestId - Unique request id.
 * 
 * This method will call specific API and deligate the response back to invoking system.
 */
export async function webForward<TReq, TRes>(
    opts: ForwardCallOptions<TReq>,
    requestId: string,
): Promise<TRes> {
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
    const req = {
        ...payload,
        requestId
    }
    if (method === "GET") {
        response = await axios.get(baseUrl, {
            params: req,
            headers,
            timeout: 30000
        })
    } else if (method === "POST") {
        response = await axios.post(
            baseUrl,
            req,
            {
                headers,
                timeout: 30000
            },
        )
    } else {
        throw new Error(`Unsupported HTTP method`)
    }

    return response.data
}