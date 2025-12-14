import dotenv from "dotenv";
import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";

dotenv.config();

const SECRET = process.env.SECRET;

/**
 * Extiende la interfaz Request para incluir la propiedad user.
 * @interface AuthRequest
 * @extends {Request}
 * @property {string | jwt.JwtPayload} [user] - (opcional) Información del usuario decodificada del token JWT.
 */
export interface AuthRequest extends Request
{
    user?: string | jwt.JwtPayload;
}

/**
 * Middleware encargado de verificar el token JWT de las solicitudes.
 * @param {AuthRequest} req Solicitud entrante con posible token JWT.
 * @param {e.Response} res Respuesta.
 * @param {e.NextFunction} next
 */
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void =>
{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token)
    {
        res.status(401).json({message: "Access token is missing"});
        return;
    }

    jwt.verify(token, SECRET as string, (err, decoded) =>
    {
        if (err)
        {
            res.status(401).json({message: "Invalid/expired access token, please try logging in again"});
            return;
        }

        req.user = decoded;
        next();
    });

};