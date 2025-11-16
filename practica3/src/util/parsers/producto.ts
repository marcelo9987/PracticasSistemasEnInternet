import {DuplaItemCantidad, Product} from "../../types/Product";

/**
 * Extrae un producto de los datos proporcionados.
 * @param datos Datos de entrada
 * @returns {Product} Producto extraído
 */
export const extraerProducto = (datos: any): Product =>
{
    const nombre: string = datos.name;

    const descripcion: string = datos.description;

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
};

/**
 * Extrae una dupla producto-cantidad de los datos proporcionados.
 * @param datos Datos de entrada
 * @returns {DuplaItemCantidad} Dupla producto-cantidad extraída
 */
export const extraerDuplaProductoCantidad = (datos: any): DuplaItemCantidad =>
{
    const productId: string = datos.productId.trim();

    const quantity: number = datos.quantity;

    return {
        productId: productId,
        quantity: quantity
    };
};
