import express, { Express, Request, Response, ErrorRequestHandler, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import { init } from './kafka';
import { addConfig } from 'core';

dotenv.config();

init().then(() => {
    addConfig({
        serviceName: 'serviceA',
        details: {
            operations: {
                'onProposalApproved': {
                    baseUrl: 'http://localhost:4010/proposal/submit',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            },
            serviceName: 'Service-A'
        }
    })
    addConfig({
        serviceName: 'serviceB',
        details: {
            operations: {
                'onProposalSubmitted': {
                    baseUrl: 'http://localhost:4011/proposal/submitted',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            },
            serviceName: 'Service-B'
        }
    })
    const app: Express = express();
    const port = process.env.PORT;
    const environment = process.env.ENV
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    app.listen(port, async () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${port}, pointing to ${environment}`);

    });
}).catch(err => {
    console.error("Kafka init failed.");
})