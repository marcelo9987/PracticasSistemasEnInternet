import {ObjectId} from "mongodb";

export type Product = {
    _id?: ObjectId,
    name: String,
    description?: String,
    price: number,
    stock: number,
    createdAt?: Date
}

export type DuplaItemCantidad = {
    productId: String,
    quantity: number
};
