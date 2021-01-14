import { Request, Response } from 'express';
import { createErrorMessage, createSuccessMessage } from '../common';
import { ITeam, Team } from '../models/team.model';

export async function GetTeams(req: Request, res: Response): Promise<void> {
    try {
        const teams: ITeam[] = await Team.find();
        
        res.send(createSuccessMessage({
            teams: teams.map(({id, teamName}) => ({
                id,
                teamName,
            }))
        }));

    } catch (error) {
        console.error(error);
        res.status(500);
        res.send(createErrorMessage("Unknown error..."));
    }
}