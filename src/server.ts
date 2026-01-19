import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from "cors"
import { WorkflowExecutor } from '@core/workflow/workflowExecutor';
import UpdateCustomerContacts from 'routes/updateMobile';
import { initKafka } from 'kafka/kafkaTransport';
import { startResponseListener } from 'kafka/listener';

dotenv.config();
const app: Express = express();
const port = process.env.PORT;
const environment = process.env.ENV
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const updateContacts = new UpdateCustomerContacts()


app.listen(port, async () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}, pointing to ${environment}`);
    await initKafka()
    await startResponseListener()
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

app.post("/update/mobile", updateContacts.updateMobile.bind(updateContacts))
