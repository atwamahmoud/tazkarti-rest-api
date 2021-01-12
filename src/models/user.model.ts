import { Schema, model, Document } from "mongoose";
import { Models } from "../common";

export interface IToken {
    value: string,
    expiry: number
}

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
function validateEmail(email: string): boolean {
    return emailRegex.test(email);
}

export const enum Roles {
    Admin = "Admin",
    Fan = "Fan",
    Manager = "Manager",
}
export const enum Gender {
    Male = "Male",
    Female = "Female",
}
export function validateRole(role: string): boolean {
    return role === Roles.Fan
        || role === Roles.Manager
        || role === Roles.Admin;
}
export function validateGender(gender: string): boolean {
    return gender === Gender.Female
        || gender === Gender.Male
}

export interface IUser extends Document {
    email: string,//
    firstName: string,//
    lastName: string,//
    password: string,//
    address?: string,//
    username: string,//
    gender: Gender,
    city: string,//
    birthDate: Date,//
    role: Roles,//
    tokens: IToken[],
    isValid: boolean,
}

export const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validateEmail,
        }
    },
    role: {
        type: String,
        required: true,
        validate: {
            validator: validateRole
        }
    },
    address: { type: String, required: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    password: { type: String, required: true },
    tokens: {
        type: [{
            value: { type: String, required: true },
            expiry: { type: Date, required: true },
        }],
        required: true
    },
    birthDate: {
        type: Date,
        required: true,
    },
    isValid: {
        type: Boolean,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        validate: {
            validator: validateGender 
        }
    }
});

const User = model(Models.User, UserSchema);
export default User;