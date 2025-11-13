import {ObjectId} from "mongodb";
import {DuplaItemCantidad} from "./Product";

export type Cart = {
    _id?: ObjectId,
    userId: ObjectId,
    items: Array<DuplaItemCantidad>
}