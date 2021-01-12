import { Request, Response, NextFunction } from 'express';
import User, { IUser, IToken } from '../models/user.model';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { createErrorMessage, createSuccessMessage } from '../common';

export async function Login(req: Request, res: Response): Promise<void> {

    const {username, password} = req.body;
    
    const query = User.findOne({username});

    const result: IUser = await query.exec() as IUser;

    if (!result) {
        res.send(createErrorMessage("Invalid Username or Password."));
        return;
    }

    const isSamePassword = await bcrypt.compare(password, result.password);


    if (!isSamePassword) {
        res.send(createErrorMessage("Invalid Username or Password."));
        return;
    }

    const token: Token = await createToken();

    result.tokens.push(token);

    await result.save();

    res.send(createSuccessMessage({
        userId: result._id,
        fName: result.firstName,
        lName: result.lastName,
        role: result.role,
        token
    }));

    return;
}

export type Token = {
    value: string,
    expiry: number
}

export async function createToken(): Promise<Token> {
    const value = await new Promise<string>((resolve) => {
        crypto.randomBytes(48, (err: any, buff: Buffer) => {
            if (err) {
                resolve(null);
            }
            resolve(buff.toString('hex'));
        });
    });

    const token: Token = {
        value,
        expiry: Date.now() + 2 * 24 * 60 * 60 * 1000
    };
    return token;
}

export async function RenewToken(req: Request, res: Response) {

    try {

        const newToken = await createToken();

        const currentToken = req.header('token');
        const user = await User.findById(req.header('user-id')) as IUser;

        user.tokens = user.tokens.filter((token: IToken) => {
            return token.expiry > Date.now() && token.value !== currentToken;
        });

        user.tokens.push(newToken);

        await user.save();
        res.send(createSuccessMessage({
            userId: user._id,
            fName: user.firstName,
            lName: user.lastName,
            role: user.role,
            token: newToken
        }));

    } catch (_) {
        res.send(createErrorMessage('Unknown error!'));
    }
}

export async function checkAuth(id: string, tokenValue: string): Promise<boolean> {

    try {

        const user: IUser = await User.findById(id) as IUser;

        const idxToken: number = user.tokens.findIndex((token: IToken): boolean => {
            if (token.value === tokenValue
                && token.expiry > Date.now()) {
                return true;
            }
            return false;
        });

        return idxToken > -1;

    } catch (_) {
        return false;
    }

}


export async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {


    if ((req.method === "POST" && (req.path === "/user" || req.path === "/login"))) {
        next();
        return;
    }

    const id: string = req.header("user-id");
    const token: string = req.header("token");

    if (!await checkAuth(id, token)) {
        res.send(createErrorMessage("Invalid token!"));
        return;
    }

    next();
}