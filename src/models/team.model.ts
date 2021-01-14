import { Document, model, ObjectId, Schema, Types } from "mongoose";
import { Models } from "../common";


export interface ITeam extends Document {
    teamName: string,
}

const TeamSchema = new Schema({
    teamName: {
        type: String,
        required: true,
    },
});

export const Team = model(Models.Team, TeamSchema, "teams");