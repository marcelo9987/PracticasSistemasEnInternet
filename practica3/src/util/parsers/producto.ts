import {DuplaItemCantidad, Product} from "../../types";

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

export const extraerDuplaProductoCantidad= (datos:any): DuplaItemCantidad =>
{
    const productId: string = datos.productId;

    const quantity: number = datos.quantity;

    return {
        productId: productId,
        quantity: quantity
    };
}