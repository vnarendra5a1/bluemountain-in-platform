import { WorkFlow } from "@core/workflow.engine";
import { Log } from "decorator";

class UpdateCustomerContacts {
    @WorkFlow()
    async updateMobile(payload: any) {
        const {
            state, request, wfId
        } = payload

        if (!request.otp) {
            return {
                response: { message: "OTP sent" },
                state: {
                    mobile: request.mobile,
                    otpTxnId: "txn_" + Date.now(),
                    ...state
                },
                status: "IN_PROGRESS"
            }
        }

        if (request.otp === "123456") {
            return {
                response: { message: "Mobile updated" },
                state: {
                    ...state,
                    completedTimeStamp: Date.now(),
                },
                status: "COMPLETED"
            }
        }

        return {
            response: { message: "Invalid OTP" },
            status: 'IN_PROGRESS',
            state: {
                ...state
            }
        }
    }
}

export default UpdateCustomerContacts
