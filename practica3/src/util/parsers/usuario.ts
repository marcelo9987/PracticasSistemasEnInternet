import {ObjectId} from "mongodb";
import jwt from "jsonwebtoken";
import {User} from "../../types/User";

/**
 * Obtiene el ID de usuario a partir de un token JWT.
 * @param {string} cadena cadena con el token JWT
 * @returns {string} id del usuario o mensaje de error
 */
export const obtenerIdUsuario = (cadena: string): ObjectId | string =>
{
    if (!cadena?.startsWith("Bearer "))
    {
        // console.log("Aviso desde obtenerIdUsuario: token faltante o mal formado");
        return "Missing or invalid token";
    }
    const token = jwt.decode(cadena.substring(7));
    if (token && typeof token !== "string")
    {
        // console.log("INTERMEDIO --> DESDE obtenerIdUsuario ----> token decodificado:", token);
        return token["id"];
    }
    return "ERROR: token invalido o corrupto";
};

/**
 * Extrae un usuario
 * @param datos Datos de entrada
 * @returns {User} Usuario extraído
 */
export const extraerUsuario = (datos: any): User =>
{

    const username: string = datos.username;

    const email: string = datos.email;

    const passwordHash: string = datos.passwordHash ?? datos.password;

    const createdAt: Date = (datos.createdAt === null) ? datos.createdAt : new Date();

    return {
        username: username,
        email: email,
        passwordHash: passwordHash,
        createdAt: createdAt
    };
};
