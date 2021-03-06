import { Request, Response } from 'express';
import User, { IUser, Roles } from "../models/user.model";
import { createErrorMessage, createSuccessMessage } from '../common';
import { IStadium, Stadium } from '../models/stadium.model';
import { Match, IMatch, ISeat } from '../models/match.model';
import { Team } from '../models/team.model';
import { Ticket, ITicket } from '../models/ticket.model';
import { ObjectId } from 'mongodb';

function areAllNumbers(str: string): boolean {
    return str.split("").reduce((prev: boolean, curr: string) => prev && Number.isInteger(parseInt(curr)), true);
}

function validPin(pin: string): boolean {
    return pin.length === 4 && areAllNumbers(pin);
}
function validCreditCard(creditCard: string): boolean {
    
    if(!areAllNumbers(creditCard)) return false;
    
    return creditCard.length === 16;
}
let xQ: number[] = [];
let yQ: number[] = [];

export async function buyTicket(req: Request, res: Response): Promise<void> {
    try {
        const {x, y, creditCard, pin} = req.body;
        if(xQ.includes(x) && yQ.includes(y)) {
            setTimeout(() => buyTicket(req, res), 1000);
            return;
        }
        xQ.push(x);
        yQ.push(y);
        const user: IUser = await User.findById(req.header("user-id")) as IUser;
        
        if(user.role !== Roles.Fan) {
            res.status(403);
            res.send(createErrorMessage("Access Denied!"));
            return;
        }

        const match: IMatch = await Match.findById(req.params.id) as IMatch;
        if(!match) {
            res.status(404);
            res.send(createErrorMessage("Match not found!"));
            return;
        };

        const stadium: IStadium = await Stadium.findById(match.stadium) as IStadium;
        
        if (!Number.isInteger(x) 
            || !Number.isInteger(y) 
            || stadium.width < y 
            || stadium.length < x
            || !validPin(pin)
            || !validCreditCard(creditCard)) {
            res.status(400);
            res.send(createErrorMessage("Invalid data!"));
            return;
        }
        //Everything is sync from here on..
        const isTaken = match.seats.find(seat => seat.x === x && seat.y === y && seat.isReserved);
        if(isTaken) {
            res.status(400);
            res.send(createErrorMessage("Already taken!"));
            return;
        }

        const seats: ISeat[] = [];
        
        for(let i = 0; i < stadium.length; i++) {
            for(let j = 0; j < stadium.width; j++) {
                seats.push({
                    x: i,
                    y: j,
                    isReserved: match.seats.find(({x,y}) => x === i && y === j)?.isReserved || i === x && j === y
                });
            }   
        }

        match.seats = seats;

        await match.save();
        const data: Record<string, any> = {
            userId: new ObjectId(user.id),
            matchId: new ObjectId(match.id),
            seatX: x,
            seatY: y,
        }

        const ticket = new Ticket({...data});

        await ticket.save();

        xQ = xQ.filter((X) => X !== x);
        yQ = yQ.filter((Y) => Y !== y);

        res.send(createSuccessMessage({
            ...data,
            id: ticket.id
        }));

    } catch (error) {
        console.log(error);
        res.status(500);
        res.send(createErrorMessage("Unknown error..."));
    }
}

export async function cancelTicket(req: Request, res: Response): Promise<void> {
    try {
        const user: IUser = await User.findById(req.header("user-id")) as IUser;
 

        const ticket: ITicket = await Ticket.findById(req.params.id) as ITicket;
        if(!ticket) {
            res.status(404);
            res.send(createErrorMessage("Ticket not found!"));
            return;
        };

        if(ticket.userId.toString() !== user.id && user.role !== Roles.Manager) {
            res.status(403);
            res.send(createErrorMessage("Access Denied!"));
            return;
        }

        const match: IMatch = await Match.findById(ticket.matchId.toString()) as IMatch;
        const stadium: IStadium = await Stadium.findById(match.stadium) as IStadium;

        const seats: ISeat[] = [];

        for(let i = 0; i < stadium.length; i++) {
            for(let j = 0; j < stadium.width; j++) {
                seats.push({
                    x: i,
                    y: j,
                    isReserved: ticket.seatX === i && ticket.seatY === j ? false : match.seats.find(({x,y}) => x === i && y === j)?.isReserved  
                });
            }   
        }

        match.seats = seats;

        await match.save();
        await ticket.delete();

        res.send(createSuccessMessage({}));

    } catch (error) {
        res.status(500);
        res.send(createErrorMessage("Unknown error..."));
    }
}

export async function getTickets(req: Request, res: Response): Promise<void> {
    try {
        const tickets: ITicket[] = await Ticket.find({
            matchId: new ObjectId(req.params.id)
        }) as ITicket[];


        res.send(createSuccessMessage({tickets}))

    } catch (error) {
        console.error(error);
        res.status(500);
        res.send(createErrorMessage("Unknown error..."));
    }
}export async function getMyTickets(req: Request, res: Response): Promise<void> {
    try {
        const tickets: ITicket[] = await Ticket.find({
            userId: new ObjectId(req.header("user-id"))
        }) as ITicket[];


        res.send(createSuccessMessage({tickets}))

    } catch (error) {
        console.error(error);
        res.status(500);
        res.send(createErrorMessage("Unknown error..."));
    }
}