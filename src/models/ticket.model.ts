import { model, ObjectId, Schema, Types, Document } from "mongoose";
import { Models } from "../common";


export interface ITicket extends Document {
    userId: ObjectId,
    matchId: ObjectId,
    seatX: number,
    seatY: number,
}

const TicketSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        required: true,
        ref: Models.User
    },
    matchId: {
        type: Types.ObjectId,
        required: true,
        ref: Models.Match
    },
    seatX: {
        type: Number,
        required: true,
    },
    seatY: {
        type: Number,
        required: true,
    }
});

export const Ticket = model(Models.Ticket, TicketSchema);