import {Cart, DuplaItemCantidad, Product, Usuario} from "./types";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import {obtenerDB} from "./mongo";

export const verificarUsuarioRegistro = (datos: any): string | null =>
{
    if (!datos)
    {
        return "Se esperan parámetros de entrada";
    }

    const {username, email, password} = datos;
    if (!username || !email || !password )
    {
        return "Faltan campos obligatorios";
    }
    if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string")
    {
        return "ERROR!: Formato esperado: {username: string, email: string, passwordHash: string}";
    }

    if(!validarEmail(email))
    {
        return "Error: Email mal formado";
    }


    return null;
};
const validarEmail = (email:string):boolean =>
{
    const regex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
    return regex.test(email);
};

export const verificarProducto = (datos: any): string | null =>
{
    if (!datos)
    {
        return "Se esperan parámetros de entrada";
    }

    const {name, description, price, stock} = datos;
    if (!name || null===price || null===stock )
    {
        return "Faltan campos obligatorios";
    }
    if (typeof name !== "string" || (description && typeof description !== "string") || typeof price !== "number" || typeof stock !== "number")
    {
        return "ERROR!: Formato esperado: {name: string, descripcion: string, price: number, stock: number}";
    }
    if(price <= 0)
    {
        return "Error: price debe ser mayor a cero.";
    }
    if(stock < 0)
    {
        return "Error: stock debe ser mayor o igual a cero.";
    }

    return null;
};

export const extraerProducto = (datos:any):Product=>{
    const nombre: string = datos.name;

    const descripcion:string = datos.description;

    const precio: number = datos.price;

    const stock: number = datos.stock;

    const creacion: Date = new Date;

    return {
        name: nombre,
        description: descripcion,
        price: precio,
        stock: stock,
        createdAt: creacion
    };
}

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


export const extraerUsuario = (datos: any): Usuario =>
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

export const verificarDuplaProductoCantidad = (datos:any): String | null =>
{
    if (!datos)
    {
        return "Se esperan parámetros de entrada";
    }

    const {productId, quantity} = datos;
    if (!productId || null===quantity )
    {
        return "Faltan campos obligatorios";
    }

    if (typeof productId !== "string" || typeof quantity !== "number")
    {
        return "ERROR!: Formato esperado: {productId: string, quantity: number}";
    }

    if(quantity <= 0)
    {
        return "Error: quantity debe ser mayor a cero.";
    }

    if(obtenerDB().collection<Product>("products").findOne({_id: new ObjectId(productId)}) === null)
    {
        return "Error: productId no existe en la base de datos.";
    }

    return null;
}

export const extraerDuplaProductoCantidad= (datos:any): DuplaItemCantidad =>
{
    const productId: string = datos.productId;

    const quantity: number = datos.quantity;

    return {
        productId: productId,
        quantity: quantity
    };
}