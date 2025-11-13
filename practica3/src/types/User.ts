import {ObjectId} from "mongodb";

/*
 *  User
 * _id: ObjectId (auto‑generado)
 * username: String, único, requerido
 * email: String, único, requerido, formato email válido
 * passwordHash: String (hash bcrypt)
 * createdAt: Date (default)
 */
/**
 * Represnta un usuario en la base de datos.
 * @param {ObjectId} [_id] id del usuario
 * @param {String} username nombre de usuario
 * @param {String} email email del usuario
 * @param {String} passwordHash hash de la contraseña del usuario
 * @param {Date} [createdAt] fecha de creacion del usuario
 */
export type User = {
    _id?: ObjectId,
    username: string,
    email: string,
    passwordHash: string,
    createdAt?: Date
}
