
interface WorkflowDefinition {
    name: string;
    edges: () => Generator<{ step: string }>;
    nodes: Record<string, StepHandler>;
    apiPath: string
}

type StepHandler = (context: any, input?: any) => Promise<any>;

export {
    WorkflowDefinition,
    StepHandler
}