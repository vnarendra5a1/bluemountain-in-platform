import { WorkflowDefinition } from "@schema/workflowDef";


function* updatePrimaryMobileEdges() {
    yield { step: "INIT_UPDATE" };
    yield { step: "VERIFY_OTP_AND_UPDATE" };
}

const updatePrimaryMobileNodes: Record<string, any> = {
    'INIT_UPDATE': async (ctx: Record<string, any>, input: Record<string, any>) => {


        // TODO perfrom operation and return the result.
        return {
            'message': "Success"
        }
    },
    'VERIFY_OTP_AND_UPDATE': async (ctx: Record<string, any>, input: Record<string, any>) => {

        // TODO perfrom operation and return the result.
        return {
            'message': "Success"
        }
    }
}

const WfUpdatePrimaryMobile: WorkflowDefinition = {
    name: "wf_UpdatePrimaryMobileNumber",
    edges: updatePrimaryMobileEdges,
    nodes: updatePrimaryMobileNodes,
}


export default WfUpdatePrimaryMobile