import {Router} from "express";
import {ObjectId} from "mongodb";
import {verifyToken} from "../middleware/verifyToken";
import {validarDuplaProductoCantidad} from "../validators/producto";
import {extraerDuplaProductoCantidad} from "../util/parsers/producto";
import {obtenerIdUsuario} from "../util/parsers/usuario";
import {coleccionCarritos, coleccionProductos} from "../database/mongo";
import {DuplaItemCantidad, Product} from "../types/Product";
import {Cart} from "../types/Cart";


const router = Router();

/**
 * Reduce el stock de un producto en la base de datos.
 * @param {Product | null} producto El producto (actualizado) cuyo stock se va a reducir.
 * @param {DuplaItemCantidad} duplaProductoCantidad La dupla que contiene el ID del producto y la cantidad a reducir.
 * @returns {Promise<void>} Una promesa que se resuelve cuando el stock ha sido reducido.
 */
const reducirStock = async (producto: Product | null, duplaProductoCantidad: DuplaItemCantidad) =>
{
    // console.log("Producto antes de actualizar stock:", producto);
    const nuevoStock = producto!.stock - duplaProductoCantidad.quantity;
    // console.log("Nuevo stock a actualizar:", nuevoStock);
    await coleccionProductos()
        .updateOne({_id: new ObjectId(duplaProductoCantidad.productId)}, {$set: {stock: nuevoStock}});
};


router.put("/add", verifyToken, async (req, res) =>
{
    try
    {
        const auth = req.get("Authorization");
        if (!auth)
        {
            return res.status(400).json({message: "falta el token"});
        }
        const id_usuario: ObjectId | string = obtenerIdUsuario(auth);
        if (typeof id_usuario === "string")
        {
            return res.status(400).json({message: id_usuario});
        }

        const cuerpoCorrecto: String | null = validarDuplaProductoCantidad(req.body);
        if (cuerpoCorrecto !== null)
        {
            return res.status(400).json({message: cuerpoCorrecto});
        }

        if (await coleccionProductos().findOne({_id: new ObjectId(req.body.productId as string)}) === null)
        {
            return res.status(404).json({message: "Product not found"});
        }

        const duplaProductoCantidad: DuplaItemCantidad = extraerDuplaProductoCantidad(req.body);

        const productoEnBD = await coleccionProductos().findOne({_id: new ObjectId(duplaProductoCantidad.productId)});
        if (productoEnBD === null)
        {
            return res.status(404).json({message: "Product not found"});
        }
        if (productoEnBD.stock < duplaProductoCantidad.quantity)
        {
            return res.status(400).json({message: `Error:  Insufficient stock`});
        }

        const carrito = (await coleccionCarritos().findOne({userId: id_usuario}));
        if (carrito === null) // Si el carrito no existe, se crea uno nuevo
        {
            const nuevoCarrito: Cart = {
                userId: id_usuario,
                items: [duplaProductoCantidad],
            };
            const resultado = await coleccionCarritos().insertOne(nuevoCarrito);
            // console.log("Nuevo carrito creado con ID:", resultado.insertedId);
            const carritoActualizado = await coleccionCarritos().findOne({_id: resultado.insertedId});
            return res.status(201).json({carritoActualizado});
        }
        // Si el carrito YA EXISTE, se actualiza
        const indiceProducto = carrito.items.findIndex(item => item.productId === duplaProductoCantidad.productId);
        // console.log("indiceProducto:", indiceProducto);
        if (indiceProducto !== -1)
        {
            // console.log("Producto ya en el carrito, actualizando cantidad");
            // El producto ya está en el carrito, se actualiza la cantidad
            carrito.items[indiceProducto].quantity = carrito.items[indiceProducto].quantity + duplaProductoCantidad.quantity;

        }
        else
        {
            // El producto no está en el carrito, se agrega
            carrito.items.push(duplaProductoCantidad);
        }
        const carritoActualizado = await coleccionCarritos()
            .findOneAndUpdate({userId: id_usuario}, {$set: {items: carrito.items}}, {returnDocument: 'after'});

        //Llegados a este punto, el carrito se ha actualizado correctamente y procedemos a la sustracción de stock en la colección de productos
        const producto: Product | null = await coleccionProductos()
            .findOne({_id: new ObjectId(duplaProductoCantidad.productId)});


        await reducirStock(producto, duplaProductoCantidad);

        return res.status(201).json({carritoActualizado: carritoActualizado});
    }
    catch (err)
    {
        res.status(500).json({message: err});
    }
});


router.get("/", verifyToken, async (req, res) =>
{
    try
    {
        const auth = req.get("Authorization");
        if (!auth)
        {
            return res.status(400).json({message: "falta el token"});
        }
        const id_usuario: ObjectId | string = obtenerIdUsuario(auth);
        if (typeof id_usuario === "string")
        {
            return res.status(400).json({message: id_usuario});
        }

        const carrito = (await coleccionCarritos().findOne({userId: id_usuario}));
        if (carrito === null)
        {
            return res.status(404).json({message: "Carrito no encontrado"});
        }
        return res.status(200).json({carrito});
    }
    catch (err)
    {
        res.status(500).json({message: err});
    }
});


export default router;
