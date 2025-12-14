import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import {getDB} from './db/mongo';
import {ObjectId} from 'mongodb';

dotenv.config();


const SECRETO = process.env.SECRETO;

type TokenPayload = {
    userId: string;
}


export const signToken = (userId: string) => jwt.sign({userId}, SECRETO!, {expiresIn: "1h"});


export const verifyToken = (token: string): TokenPayload | null =>
{
    try
    {
        return jwt.verify(token, SECRETO!) as TokenPayload;
    }
    catch (err)
    {
        return null;
    }
};

export const getUserFromToken = async (token: string) =>
{
    const payload = verifyToken(token);
    if (!payload)
    {
        return null;
    }
    const db = getDB();
    return await db.collection("users").findOne({
        _id: new ObjectId(payload.userId)
    })
}
