import { Request, Response } from 'express';
import User, { IUser, Roles } from "../models/user.model";
import { createErrorMessage, createSuccessMessage } from '../common';
import { IStadium, Stadium } from '../models/stadium.model';

export async function CreateStadium(req: Request, res: Response): Promise<void> {
    try {
        const user: IUser = await User.findById(req.header("user-id")) as IUser;
        
        if(user.role !== Roles.Manager) {
            res.status(403);
            res.send(createErrorMessage("Access Denied!"));
            return;
        }
        const {length, width, name} = req.body;
        
        if(!Number.isInteger(length) || !Number.isInteger(width)) {
            res.status(400);
            res.send(createErrorMessage("Invalid Data!"));
            return;
        }

        const data: Record<string, number> = {
            length,
            width,
            name
        }

        const stadium = new Stadium({...data});
        
        const stadiumDoc = await stadium.save();

        res.send(createSuccessMessage({
            ...data,
            id: stadiumDoc.id
        }));

    } catch (error) {
        console.error(error);
        res.status(500);
        res.send(createErrorMessage("Unknown error..."));
    }
}

export async function UpdateStadium(req: Request, res: Response): Promise<void> {
    try {
        const user: IUser = await User.findById(req.header("user-id")) as IUser;
        
        if(user.role !== Roles.Manager) {
            res.status(403);
            res.send(createErrorMessage("Access Denied!"));
            return;
        }
        const stadium: IStadium = await Stadium.findById(req.params.id) as IStadium;
        const {length, width} = req.body;
        
        stadium.length = length || stadium.length;
        stadium.width = width || stadium.width;

        await stadium.save();

        res.send(createSuccessMessage({}));

    } catch (error) {
        console.error(error);
        res.status(500);
        res.send(createErrorMessage("Unknown error..."));
    }
}

export async function GetStadiums(req: Request, res: Response): Promise<void> {
    try {
        const stadiums: IStadium[] = await Stadium.find();
        
        res.send(createSuccessMessage({
            stadiums: stadiums.map(stadium => ({
                id: stadium.id,
                length: stadium.length,
                width: stadium.width,
                name: stadium.name
            }))
        }))

    } catch (error) {
        console.error(error);
        res.status(500);
        res.send(createErrorMessage("Unknown error..."));
    }
}