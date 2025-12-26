// TODO import all workflows here and export the same, just like routes.
// In each wf, we are expecting with type name and wf generator functions.
import WfUpdatePrimaryMobile from '@workflows/updateMobileNumber'

const registery = {
    [WfUpdatePrimaryMobile.name]: {
        name: WfUpdatePrimaryMobile.name,
        nodes: {
            ...WfUpdatePrimaryMobile.nodes
        },
        edges: WfUpdatePrimaryMobile.edges
    }
}

export {
    registery
}