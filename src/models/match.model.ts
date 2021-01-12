import { model, ObjectId, Schema, Types, Document } from "mongoose";
import { Models } from "../common";

export interface ISeat {
    x: number;
    y: number;
    isReserverd: boolean;
    ticketId?: ObjectId;
}

export interface IMatch extends Document {
    time: Date,
    homeTeam: ObjectId,
    awayTeam: ObjectId,
    stadium: ObjectId,
    referee: string,
    seats: ISeat[],
    linesmen: string[]
}

const MatchSchema = new Schema({
    ticketPrice: {
        type: Number,
        required: true,
    },
    time: {
        type: Date,
        required: true,
    },
    homeTeam: {
        type: Types.ObjectId,
        required: true,
        ref: Models.Team
    },
    awayTeam: {
        type: Types.ObjectId,
        required: true,
        ref: Models.Team
    },
    stadium: {
        type: Types.ObjectId,
        required: true,
        ref: Models.Stadium
    },
    referee: {
        type: String,
        required: true
    },
    linesmen: {
        type: [String],
        required: true
    },
    seats: [{
        type: {
            x: {
                type: Number,
                required: true
            },
            y: {
                type: Number,
                required: true
            },
            isReserved: {
                type: Boolean,
                required: true
            },
            TicketId: {
                type: Types.ObjectId,
                ref: Models.Ticket
            },
        },
        required: true
    }]
});

export const Match = model(Models.Match, MatchSchema);