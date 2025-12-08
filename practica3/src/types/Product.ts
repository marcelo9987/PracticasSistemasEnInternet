import {ObjectId} from "mongodb";

/* Product
 * _id: ObjectId
 * name: String, requerido
 * description: String, opcional
 * price: Number, requerido, >0
 * stock: Number, requerido, >=0
 * createdAt: Date (default)
 */
/**
 * Representa un producto en la base de datos.
 * @param {ObjectId} [_id] id del producto
 * @param {String} name nombre del producto
 * @param {String} [description] descripcion del producto
 * @param {number} price precio del producto
 * @param {number} stock stock del producto
 * @param {Date} [createdAt] fecha de creacion del producto
 */
export type Product = {
    _id?: ObjectId,
    name: String,
    description?: String,
    price: number,
    stock: number,
    createdAt?: Date
}


/**
 *  DuplaItemCantidad
 * @param {string} productId  id del producto
 * @param {number} quantity cantidad del producto
 */
export type DuplaItemCantidad = {
    productId: string,
    quantity: number
};
