import {ObjectId} from "mongodb";

export type Usuario =
    {
        _id?: ObjectId,
        username: string,
        email: string,
        passwordHash: string,
        createdAt?: Date
    }

export type Product = {
    _id?: ObjectId,
    name: String,
    description?: String,
    price: number,
    stock: number,
    createdAt: Date
}

export type DuplaItemCantidad = { productId: String, quantity: number };

export type Cart = {
    _id?: ObjectId,
    userId: ObjectId,
    items: Array<DuplaItemCantidad>
}


export type JwtPayload = {
    id: string;
    email: string;
}