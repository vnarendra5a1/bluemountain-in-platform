import WorkFlowStore from "./wfStore"

type WorkflowResult<Tout> = {
    response: Tout
    state: Record<string, any>
    status: "IN_PROGRESS" | "COMPLETED"
}


type handlerFunc<Tin, TState, Tout> = (
    payload: Tin & { wfId?: string },
    state: TState,
) => Promise<WorkflowResult<Tout>>

export function workFlowRoute<
    Tin extends Record<string, any>,
    TState extends Record<string, any>,
    Tout
>(func: handlerFunc<Tin, TState, Tout>) {
    return async function wrappedHandler(
        req: any,
        res: any
    ) {
        const store: WorkFlowStore = new WorkFlowStore()
        let wf

        const wfId = req.body?.wfId
        const api = req.path

        if (wfId) {
            wf = await store.getWorkflow(wfId)
            if (!wf || wf.status !== "IN_PROGRESS") {
                return res.status(400).json({ error: "Invalid or expired wfId" })
            }
        } else {
            wf = await store.createWorkflow(api)
        }

        const hydratedState = {
            ...wf.state,
            wfId: wf.wfId
        } as any

        let result: WorkflowResult<Tout>
        try {
            result = await func(req, hydratedState)
        } catch (err) {
            return res.status(500).json({ error: "Handler error" })
        }
        wf.state = {
            ...result.state
        }
        wf.status = result.status
        store.saveWorkflow(wf)

        res.json({
            ...result.response,
            wfId: wf.wfId,
            status: wf.status
        })
    }
}
