const pg = require('pg');
import { WorkflowSession } from '@schema/workFlowSession';
import moment from 'moment'

export default class DbLayer {

    #pool: any;
    constructor() {
        this.#createPool().then(() => {
            console.log("Pool Success");
        }).catch(err => {
            console.log("Pool failure");
        })
    }

    async #createPool() {
        const pgConfig = {
            host: process.env.HOST,
            user: process.env.USER_NAME,
            database: process.env.DB_NAME,
            password: process.env.PASSWORD,
            port: process.env.PORT,
            max: 10, // Maximum number of clients in the pool
            idleTimeoutMillis: 60000, // Idle client timeout
            connectionTimeoutMillis: 120000, // Connection timeout
            dialect: 'postgres',
            schema: 'services',
            ssl: true
        };
        console.log("createPool ", pgConfig);

        this.#pool = new pg.Pool(pgConfig);
    }

    async closePool() {
        if (this.#pool) {
            try {
                await this.#pool.end();
                console.log("closePool completed.");
            }
            catch (error) {
                console.log("Error while closing pool", error)
            }
        }
    }

    async getWorkflowDetails(
        wfId: string
    ) {
        const selectQuery = `select * from ${process.env.DATALAKE_SCHEMA}."workflows" where workflow_id='${wfId}'`
        try {
            const result = await this.#pool.query(selectQuery)
            const rows = result.rows ?? result.rowsAffected
            console.log("getWorkflowDetails ", rows.length);
            if (rows.length > 0)
                return rows[0] as any
        } catch (err) {
            console.error(err)
        }
        return undefined
    }

    async acquireLock(workflowId: string, nodeId: string) {
        const expiry = moment().add('seconds', 30).toISOString()
        const updateQuery = `update ${process.env.DATALAKE_SCHEMA}.workflows set locked_by='${nodeId}', lock_expires_at='${expiry}' WHERE workflow_id='${workflowId}' AND (locked_by IS NULL OR lock_expires_at < '${expiry}')`
        console.log('acquireLock ', updateQuery);

        try {
            const res = await this.#pool.query(
                updateQuery
            );
            console.log('acquireLock ', res);

            return res.rowCount === 1;
        } catch (err) {
            console.error(err)
        }
        return false
    }

    async updateWorkflow(payload: {
        workflowId: string,
        context: Record<string, any>,
        currentStep: string | null,
        status: string
    }) {
        const updateQuery = `update ${process.env.DATALAKE_SCHEMA}."workflows" set context = '${JSON.stringify(payload.context)}', current_step ='${payload.currentStep}', status = '${payload.status}' where workflow_id='${payload.workflowId}'`
        try {
            const res = await this.#pool.query(
                updateQuery
            );
        } catch (err) {
            console.error(err)
        }
    }

    async releaseLock(workflowId: string) {
        const updateQuery = `update ${process.env.DATALAKE_SCHEMA}.workflows set locked_by=NULL, lock_expires_at=NULL WHERE workflow_id = '${workflowId}'`
        try {
            const res = await this.#pool.query(
                updateQuery
            );
        } catch (err) {
            console.error(err)
        }
    }

    async createWorkflowRecord(
        payload: {
            workflowId: string,
            workflowName: string,
            firstStep: string,
            input: Record<string, any>
        }
    ) {
        const insertQuery = `insert into ${process.env.DATALAKE_SCHEMA}.workflows (workflow_id, workflow_type, current_step, status, context, created_at, updated_at) VALUES('${payload.workflowId}', '${payload.workflowName}', '${payload.firstStep}', 'IN_PROGRESS', '${JSON.stringify(payload.input)}', 'now()', 'now()')`
        try {
            const res = await this.#pool.query(
                insertQuery
            );
        } catch (err) {
            console.error(err)
            throw 'Failed to create workflow.'
        }
    }

    async createWorkflowSession(
        payload: WorkflowSession
    ) {
        const insertQuery = `insert into ${process.env.DATALAKE_SCHEMA}.workflows (workflow_id, workflow_type, current_step, status, context, created_at, updated_at) VALUES('${payload.wfId}', '${payload.wfId}', '', '${payload.status}', '${JSON.stringify(payload.state)}', 'now()', 'now()')`
        try {
            const res = await this.#pool.query(
                insertQuery
            );
        } catch (err) {
            console.error(err)
            throw 'Failed to create workflow.'
        }
    }

    async updateWorkflowSession(
        payload: WorkflowSession
    ) {
        const updateQuery = `update ${process.env.DATALAKE_SCHEMA}."workflows" set context = '${JSON.stringify(payload.state)}', current_step ='', status = '${payload.status}' where workflow_id='${payload.wfId}'`
        try {
            const res = await this.#pool.query(
                updateQuery
            );
        } catch (err) {
            console.error(err)
        }
    }
}