import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from "cors"
import { WorkflowExecutor } from '@core/workflowExecutor';

dotenv.config();
const app: Express = express();
const port = process.env.PORT;
const environment = process.env.ENV
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.listen(port, async () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}, pointing to ${environment}`);
});

// TODO this is sample route to check sanity.
app.post("/user/contactUpdate/mobile", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // TODO 
    const wfExecutor = new WorkflowExecutor()
    const response = await wfExecutor.invoke({
        request: req.body,
        operationName: 'wf_UpdatePrimaryMobileNumber',
        nodeId: 'node1'
    })
    res.status(200).send(response)
})