import {ObjectId} from "mongodb";
import jwt from "jsonwebtoken";
import {User} from "../../types/User";

export const obtenerIdUsuario = (cadena:string):ObjectId | string =>
{
    if (!cadena?.startsWith("Bearer ")) {
        return "Missing or invalid token";
    }
    const token = jwt.decode(cadena.substring(7));
    if ( token && typeof token!=="string")
    {
        return new ObjectId(token["id"] as string);
    }
    return "ERROR: token invalido o corrupto";
}


export const extraerUsuario = (datos: any): User =>
{

    const username: string = datos.name;

    const email:string=datos.email;

    const passwordHash: string = datos.passwordHash;

    const createdAt: Date = (datos.createdAt===null)?datos.createdAt:new Date();

    return {
        username:username,
        email:email,
        passwordHash: passwordHash,
        createdAt: createdAt
    };
};