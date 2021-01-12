import { Schema, model, Document } from "mongoose";
import { Models } from "../common";

export interface IStadium extends Document {
    length: number;
    width: number;
}

const StadiumSchema  = new Schema({
    width: {
        type: Number,
        required: true,
    },
    length: {
        type: Number,
        required: true,
    }
});

export const Stadium = model(Models.Stadium, StadiumSchema);