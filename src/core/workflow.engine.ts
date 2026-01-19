import WorkFlowStore from "./wfStore"

type WorkflowResult<Tout> = {
    response: Tout
    state: Record<string, any>
    status: "IN_PROGRESS" | "COMPLETED"
}


type handlerFunc<Tin, Tout> = (
    payload: Tin & { wfId?: string }
) => Promise<WorkflowResult<Tout>>

export function WorkFlow<
    Tin extends Record<string, any>,
    Tout
>() {
    console.log("WorkFlow Invoked");

    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value
        console.log("Inside decorator dec func", target, propertyKey);

        descriptor.value = async function (req: any, res: any) {
            const store = new WorkFlowStore()
            let wf

            const wfId = req.body?.wfId
            const api = req.path

            if (wfId) {
                wf = await store.getWorkflow(wfId)
                if (!wf || wf.status !== "IN_PROGRESS") {
                    return res.status(400).json({
                        error: "Invalid or expired wfId",
                    })
                }
            } else {
                wf = await store.createWorkflow(api)
            }

            const workflowRequest = {
                wfId: wf.wfId,
                request: req.body,
                state: {
                    ...wf.state,
                    wfId: wf.wfId,
                },
            }

            let result: WorkflowResult<Tout>
            console.log("Inside decorator wrapper func ", this);

            try {
                result = await originalMethod.call(
                    this,
                    workflowRequest
                )
            } catch (err) {
                return res.status(500).json({
                    error: "Handler error",
                })
            }

            wf.state = { ...result.state }
            wf.status = result.status

            await store.saveWorkflow(wf)

            return res.json({
                ...result.response,
                wfId: wf.wfId,
                status: wf.status,
            })
        }

        return descriptor
    }
}