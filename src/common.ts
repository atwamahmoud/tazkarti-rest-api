import mongoose from "mongoose";

export async function ConnectDB() {
    await mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    });
}


export type ResponseMessage = {
    success: Boolean,
    result: any
}

export enum Models {
    Match = "Match",
    Stadium = "Stadium",
    Team = "Team",
    User = "User",
    Ticket = "Ticket"
}

/**
 * Returns an object with the required json format for the success response.
 * 
 * @param results the actual response for the request
 */
export function createSuccessMessage(results: any): ResponseMessage {
    return {
        success: true,
        result: results
    };
}

/**
 * Returns an object with the required json format for the error response.
 * 
 * @param message error message to be sent
 */
export function createErrorMessage(message: string): ResponseMessage {
    return {
        success: false,
        result: {
            message
        }
    };
}
