import DbLayer from "@dataLayer/dataBaseLayer";
import {
    registery,
} from "@workflows/index";
import {
    v4
} from 'uuid'
import { WorkflowDefinition } from '@schema/workflowDef'

export class WorkflowExecutor {
    #dataLayer: DbLayer
    constructor() {
        this.#dataLayer = new DbLayer()
    }

    async executeWorkflow(workflowId: string, input = {}, nodeId: string) {
        console.log('executeWorkflow', workflowId, input, nodeId);
        const wf = await this.#dataLayer.getWorkflowDetails(workflowId);
        console.log('executeWorkflow work flow details ', wf);
        if (!wf || wf.status !== "IN_PROGRESS") return; // throw
        const locked = await this.#dataLayer.acquireLock(workflowId, nodeId);
        console.log('executeWorkflow locked ', locked);
        if (!locked) return; // throw error.

        try {
            const iterator = registery[wf.workflow_type].edges();
            let current;
            do {
                current = iterator.next();
            } while (!current.done && current.value.step !== wf.current_step);
            console.log('executeWorkflow current leg of exec ', current);
            const stepFn = registery[wf.workflow_type].nodes[wf.current_step as any];
            const newContext = await stepFn(wf.context, input);
            const next = iterator.next();
            await this.#dataLayer.updateWorkflow({
                workflowId,
                context: {
                    ...wf.context,
                    [wf.current_step]: { ...newContext },
                },
                currentStep: next.done ? null : next.value.step,
                status: next.done ? "COMPLETED" : "IN_PROGRESS"
            });
            return {
                ...newContext,
                workflowId,
                wfStatus: next.done ? "COMPLETED" : "IN_PROGRESS"
            }
        } finally {
            await this.#dataLayer.releaseLock(workflowId);
        }
    }

    async startWorkflow(payload: { workflowName: string, input: Record<string, any>, nodeId: string }) {
        const {
            workflowName,
            input,
            nodeId
        } = payload
        const definition: WorkflowDefinition = this.getWorkflowDefinition(workflowName);
        const firstStep = this.getFirstStep(definition);
        const workflowId = v4().replaceAll('-', '')
        await this.#dataLayer.createWorkflowRecord({
            workflowId,
            workflowName,
            firstStep,
            input
        });
        return workflowId;
    }

    async invoke(
        payload: {
            request: Record<string, any>,
            operationName: string,
            nodeId: string
        }
    ) {
        const {
            request,
            nodeId,
            operationName
        } = payload
        // @ts-ignore
        const wfDetails = registery[operationName]
        if (!wfDetails)
            throw 'Workflow details are not present.'
        const {
            wfId,
        } = request
        let workFlowId = wfId
        if (!workFlowId) {
            workFlowId = await this.startWorkflow(
                {
                    workflowName: wfDetails.name,
                    input: {
                        ...payload.request
                    },
                    nodeId
                }
            )
        }
        return await this.executeWorkflow(
            workFlowId,
            payload.request,
            nodeId
        )
    }

    getWorkflowDefinition(workflowName: string) {
        const def = registery[workflowName];
        if (!def) {
            throw new Error(`Unknown workflow: ${workflowName}`);
        }
        return {
            ...def,
            apiPath: ''
        };
    }

    getFirstStep(definition: WorkflowDefinition) {
        const iterator = definition.edges();
        const first = iterator.next();
        if (first.done) {
            throw new Error("Workflow no edges are defined.");
        }
        return first.value.step;
    }

}

