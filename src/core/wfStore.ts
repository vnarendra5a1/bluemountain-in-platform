import DbLayer from "@dataLayer/dataBaseLayer"
import { WorkflowSession } from "@schema/workFlowSession"
import { randomUUID } from "crypto"

class WorkFlowStore {
    #dataLayer: DbLayer
    constructor() {
        this.#dataLayer = new DbLayer()
    }
    async createWorkflow(api: string): Promise<WorkflowSession> {
        const wf: WorkflowSession = {
            wfId: randomUUID(),
            api,
            state: {},
            status: "STARTED"
        }
        await this.#dataLayer.createWorkflowSession(wf);
        return wf
    }

    async getWorkflow(wfId: string): Promise<WorkflowSession | null> {
        const wf = await this.#dataLayer.getWorkflowDetails(wfId);
        if (!wf) return null
        return wf
    }

    async saveWorkflow(wf: WorkflowSession) {
        await this.#dataLayer.updateWorkflowSession(wf)
    }

}

export default WorkFlowStore