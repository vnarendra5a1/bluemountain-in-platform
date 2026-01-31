


// TODO read form ETCD.
export const ServiceConfig: Record<string, HttpConfig> = {

}

export interface HttpConfig {
    serviceName: string,
    operations: Record<string, HttpTargetConfig>
}



export interface HttpTargetConfig {
    method: "GET" | "POST"
    baseUrl: string
    headers?: Record<string, string>
}
