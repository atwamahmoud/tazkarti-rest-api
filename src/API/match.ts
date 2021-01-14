import { Request, Response } from 'express';
import User, { IUser, Roles } from "../models/user.model";
import { createErrorMessage, createSuccessMessage } from '../common';
import { IStadium, Stadium } from '../models/stadium.model';
import { Match, IMatch, ISeat } from '../models/match.model';
import { Team } from '../models/team.model';
import { ObjectId } from 'mongodb';

export async function CreateMatch(req: Request, res: Response): Promise<void> {
    try {
        const user: IUser = await User.findById(req.header("user-id")) as IUser;
        
        if(user.role !== Roles.Manager) {
            res.status(403);
            res.send(createErrorMessage("Access Denied!"));
            return;
        }
        const stadium: IStadium = await Stadium.findById(req.body.stadium) as IStadium;
        if(!stadium) throw new Error("incorrect stadium id...");
        const seats: ISeat[] = [];
        for(let x = 0; x < stadium.length; x++) {
            for(let y = 0; y < stadium.width; y++) {
                seats.push({
                    x,
                    y,
                    isReserved: false
                });
            }   
        }

        const data: Record<string, any> = {
            time: new Date(req.body.time),
            homeTeam: new ObjectId(req.body.homeTeam),
            awayTeam: new ObjectId(req.body.awayTeam),
            stadium: new ObjectId(req.body.stadium),
            referee: req.body.stadium,
            seats,
            linesmen: req.body.linesmen,
            ticketPrice: req.body.ticketPrice,
        }

        const match = new Match({...data});
        
        const matchDoc = await match.save();

        res.send(createSuccessMessage({
            ...data,
            id: matchDoc.id
        }));

    } catch (error) {
        console.log(error);
        if(error?._message === "Match validation failed") {
            res.status(400);
            res.send(createErrorMessage("Invalid data!"));
            return;
        }
        res.status(500);
        res.send(createErrorMessage("Unknown error..."));
    }
}

export async function updateMatch(req: Request, res: Response): Promise<void> {
    try {
        const user: IUser = await User.findById(req.header("user-id")) as IUser;

        if(user.role !== Roles.Manager) {
            res.status(403);
            res.send(createErrorMessage("Access Denied!"));
            return;
        }
        
        let match: IMatch = await Match.findById(req.params.id) as IMatch;

        if(!match) {
            res.status(404);
            res.send(createErrorMessage("Cannot find such match"));
            return;
        }

        if(req.body.stadium) {
            const stadium: IStadium = await Stadium.findById(req.body.stadium) as IStadium;
            if(!stadium) throw new Error("incorrect stadium id...");
            const seats: ISeat[] = [];
            for(let x = 0; x < stadium.length; x++) {
                for(let y = 0; y < stadium.width; y++) {
                    seats.push({
                        x,
                        y,
                        isReserved: false
                    });
                }   
            }
            match.seats = seats;
            match.stadium = stadium.id
        }

        match.time = req.body.time || match.time;
        match.ticketPrice = req.body.ticketPrice || match.ticketPrice;
        match.homeTeam = req.body.homeTeam || match.homeTeam;
        match.awayTeam = req.body.awayTeam || match.awayTeam;
        match.referee = req.body.stadium || match.referee;
        match.linesmen = req.body.linesmen || match.linesmen;

        await match.save();

        res.send(createSuccessMessage({}));

    } catch (error) {
        res.status(500);
        res.send(createErrorMessage("Unknown error..."));
    }
}

export async function GetMatches(req: Request, res: Response): Promise<void> {
    try {
        const matches: IMatch[] = await Match.find();
        const populated = await Promise.all(matches.map(async (match) => ({
            time: new Date(match.time),
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            stadium: match.stadium,
            referee: match.referee,
            seats: match.seats,
            ticketPrice: match.ticketPrice,
            linesmen: match.linesmen,
            id: match.id
        })))
        res.send(createSuccessMessage({
            matches: populated
        }))

    } catch (error) {
        console.error(error);
        res.status(500);
        res.send(createErrorMessage("Unknown error..."));
    }
}