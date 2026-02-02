
import { Etcd3 } from "etcd3"
export const etcd = new Etcd3({
    hosts: process.env.ETCD_ENDPOINT ?? "http://127.0.0.1:2379"
})

const cachedConfig = new Map<string, HttpConfig>()
const BASE_KEY = "/platform/service-taragets"

export interface HttpConfig {
    serviceName: string,
    operations: Record<string, HttpTargetConfig>
}

export interface HttpTargetConfig {
    method: "GET" | "POST"
    baseUrl: string
    headers?: Record<string, string>
}

export async function getServiceConfig(
    serviceName: string
): Promise<HttpConfig> {
    const cached = cachedConfig.get(serviceName)
    if (cached) return cached
    const value = await etcd
        .get(`${BASE_KEY}/${serviceName}`)
        .string()
    if (!value) {
        throw new Error(`HTTP config not found for ${serviceName}`)
    }
    const parsed = JSON.parse(value) as HttpConfig
    cachedConfig.set(serviceName, parsed)
    return parsed
}

export async function startHttpConfigWatcher() {
    const watcher = await etcd
        .watch()
        .prefix(BASE_KEY)
        .create()

    watcher.on("put", res => {
        const serviceName = res.key
            .toString()
            .replace(`${BASE_KEY}/`, "")

        const value = JSON.parse(
            res.value.toString()
        ) as HttpConfig

        cachedConfig.set(serviceName, value)
        console.log(`[etcd] HTTP config updated: ${serviceName}`)
    })

    watcher.on("delete", res => {
        const serviceName = res.key
            .toString()
            .replace(`${BASE_KEY}/`, "")

        cachedConfig.delete(serviceName)
        console.log(`[etcd] HTTP config deleted: ${serviceName}`)
    })
}
