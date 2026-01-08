import { workFlowRoute } from "@core/workflow.engine"

export const updateMobile = workFlowRoute<
    any,
    any
>(async (payload) => {
    const {
        state, request, wfId
    } = payload
    console.log("Inside Handler func ", wfId);

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
})
