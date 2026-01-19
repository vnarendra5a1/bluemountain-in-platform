type Resolver = {
    resolve: (value: any) => void
    reject: (reason?: any) => void
    timer: NodeJS.Timeout
}

const store = new Map<string, Resolver>()

export function addRequest(
    requestId: string,
    timeoutMs: number
): Promise<any> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            store.delete(requestId)
            reject(new Error("Forward call timeout"))
        }, timeoutMs)

        store.set(requestId, { resolve, reject, timer })
    })
}

export function resolveRequest(requestId: string, payload: any) {
    const entry = store.get(requestId)
    if (!entry) return

    clearTimeout(entry.timer)
    entry.resolve(payload)
    store.delete(requestId)
}