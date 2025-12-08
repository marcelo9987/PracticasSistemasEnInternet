import {getDB} from "../db/mongo";
import bcrypt from "bcryptjs";
import {ObjectId} from "mongodb";
import {User} from "../types/User";

const COLLECTION = "users";

/**
 * Valida el formato de un email
 * @param {string} email email a validar
 * @returns {boolean} true si es válido, false si no lo es
 */
const validarEmail: (email: string) => boolean = (email: string): boolean =>
{
    const regex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
    return regex.test(email);
};

const usuarioEnColeccion: (email: string) => Promise<boolean> = async (email:string):Promise<boolean> =>
{
    const db = getDB();
    return ((await db.collection(COLLECTION).findOne({email: email}))!==null);
}

export const comprobarUsuarioId= async (id:string) =>
{
    const db = getDB();
    const usuario = await db.collection<User>(COLLECTION).findOne({_id: new ObjectId(id.toString())});
    if(!usuario)
    {
        throw new Error("El usuario con el id proporcionado no existe");
    }
}

const usuarioValido = async (email: string, autenticacion:boolean=false):Promise<boolean> =>
{
    if(!validarEmail(email))
    {
        throw new Error("ERROR! El email provisto está mal formado");
    }
    const enColeccion = await usuarioEnColeccion(email);
    if(enColeccion && !autenticacion)
    {
        throw new Error("El email ya está registrado a otro usuario");
    }
    if(!enColeccion && autenticacion)
    {
        throw new Error("El email no está registrado");
    }
    return true;
};
export const createUser = async (username:string, email: string, password: string) => {
    const db = getDB();
    const contrasenhaEncriptada = await bcrypt.hash(password, 10);

    if(!(await usuarioValido(email)))
    {
        throw new Error("Ha habido un error al crear el usuario");
    }

    const result = await db.collection(COLLECTION).insertOne({
        username: username,
        email:email,
        password: contrasenhaEncriptada,
        createdAt:new Date()
    });

    return result.insertedId.toString();
}

export const findUserById = async (id: string) => {
    const db = getDB();
    return await db.collection<User>(COLLECTION).findOne({_id: new ObjectId(id)})
}

export const obtenerUsuarios= async ()=>
{
    const db = getDB();
    return await db.collection<User>(COLLECTION).find().toArray();
}

export const logearUsuario= async (email: string, password: string) =>
{
    if( !(await usuarioValido(email, true)) )
    {
        throw new Error("El usuario no existe");
    }
    const db = getDB();
    const usuario = await db.collection(COLLECTION).findOne({email: email});
    if(!usuario)
    {
        throw new Error("El usuario no existe");
    }

    const contrasenhaCorrecta = await bcrypt.compare(password, usuario.password);
    if(!contrasenhaCorrecta)
    {
        throw new Error("La contraseña es incorrecta");
    }
    return usuario;
}