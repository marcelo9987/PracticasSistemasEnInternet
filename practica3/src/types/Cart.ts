import {ObjectId} from "mongodb";
import {DuplaItemCantidad} from "./Product";

/*
 * carts
 * _id: ObjectId
 * userId: ObjectId (referencia a users), único por usuario
 * items: Array de objetos { productId, quantity }
 */

/**
 * Cart
 * @param [_id] ObjectId
 * @param userId ObjectId
 * @param items Array<DuplaItemCantidad>
 * @see DuplaItemCantidad
 */
export type Cart = {
    _id?: ObjectId,
    userId: ObjectId,
    items: Array<DuplaItemCantidad>
}
