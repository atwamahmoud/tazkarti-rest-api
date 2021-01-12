import { Request, Response } from 'express';
import User, { IUser, Roles } from "../models/user.model";
import { createErrorMessage, createSuccessMessage } from '../common';
import bcrypt from 'bcrypt';
import { createToken, Token } from './auth';
import { readFile, writeFile } from 'fs';

export async function SignUp(req: Request, res: Response): Promise<void> {


    const token: Token = await createToken();

    if ((req.body.password || '').length <= 6) {
        res.send(createErrorMessage("Password is too weak!"));
        return;
    }

    const password = await bcrypt.hash(req.body.password, Number(process.env.NUM_ROUNDS));

    const data: Record<string, any> = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password,
        address: req.body.address,
        username: req.body.username,
        gender: req.body.gender,
        city: req.body.city,
        birthDate: new Date(req.body.birthDate),
        role: req.body.role,
        isValid: true,
    }

    switch (data.role) {
        case Roles.Manager:
            data.isValid = false;
            break;
        case Roles.Admin:
            res.status(400);
            res.send(createErrorMessage("Admins cannot be registered!!"));
            break;
        default:
            break;
    }

    const user = new User({
        ...data,
        tokens: [token]
    });

    const userDoc: IUser = await user.save()
        .catch((e) => {
            res.status(400);
            if (e && e.code === 11000) {
                res.send(createErrorMessage("User already exists, duplicate E-Mail or Username"))
            } else {
                res.send(createErrorMessage("Invalid data!"))
            }
            return null;
        });

    if (!userDoc) return;

    res.send(createSuccessMessage({
        ...data,
        id: userDoc.id,
        token,
    }));

    return;
}

export async function UpdateUser(req: Request, res: Response) {
    try {
        const user: IUser = await User.findById(req.header("id")) as IUser;

        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.address = req.body.address || user.address;
        user.gender = req.body.gender || user.gender;
        user.city = req.body.city || user.city;
        user.birthDate = new Date(req.body.birthDate) || user.birthDate;
        user.role = req.body.role || user.role;


        if (req.body.password) {

            const isSamePassword = await bcrypt.compare(req.body.currentPassword, user.password);

            if (!isSamePassword) {
                res.send(createErrorMessage("Invalid Password."));
                return;
            }

            const password = await bcrypt.hash(req.body.password, Number(process.env.NUM_ROUNDS));
            user.password = password;
        }

        await user.save();

        res.send(createSuccessMessage({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            address: user.address,
            username: user.username,
            gender: user.gender,
            city: user.city,
            birthDate: user.birthDate,
            role: user.role,
            isValid: user.isValid,
        }));

    } catch (error) {
        console.error(error);
        res.status(500);
        res.send(createErrorMessage("Unknown Error!, check your data..."))
    }
    return;
}


export async function GetUserPublicData(req: Request, res: Response) {
    try {
        const user = await User.findById(req.params.id) as IUser;

        if (!user) {
            res.status(404);
            res.send(createErrorMessage("Couldn't find such user!"));
            return;
        }

        res.send(createSuccessMessage({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            gender: user.gender,
            city: user.city,
            role: user.role,
            isValid: user.isValid,
        }));

    } catch (error) {
        console.error(error);
        res.status(500);
        res.send(createErrorMessage("Uknown error have occured!"));
    }
}

export async function updateUserValidationStatus(req: Request, res: Response) {
    try {
        const user = await User.findById(req.header("id")) as IUser;
        const userToBeUpdated = await User.findById(req.body.userId) as IUser;

        if (user.role !== Roles.Admin) {
            res.status(403);
            res.send(createErrorMessage("Should be an admin!"));
            return;
        }

        if(!userToBeUpdated) {
            res.status(404);
            res.send(createErrorMessage("Cannot find such user!"));
        }

        user.isValid = req.body.isValid;
        
        await user.save();

        res.send(createSuccessMessage({
            id: userToBeUpdated.id,
            firstName: userToBeUpdated.firstName,
            lastName: userToBeUpdated.lastName,
            email: userToBeUpdated.email,
            username: userToBeUpdated.username,
            gender: userToBeUpdated.gender,
            city: userToBeUpdated.city,
            role: userToBeUpdated.role,
            isValid: userToBeUpdated.isValid,
        }));
    } catch (error) {
        console.error(error);
        res.status(500);
        res.send(createErrorMessage("Uknown error have occured!"));
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        const user = await User.findById(req.header("id")) as IUser;
        const userToDelete = await User.findById(req.body.userId) as IUser;

        if (user.role !== Roles.Admin) {
            res.status(403);
            res.send(createErrorMessage("Should be an admin!"));
            return;
        }

        if(!userToDelete) {
            res.status(404);
            res.send(createErrorMessage("Cannot find such user!"));
        }

        await user.delete();

        res.send(createSuccessMessage({
            deletedId: req.body.userId,
        }));

    } catch (error) {
        console.error(error);
        res.status(500);
        res.send(createErrorMessage("Uknown error have occured!"));
    }
}