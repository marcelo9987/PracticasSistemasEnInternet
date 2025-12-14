import {Router} from "express";
import {ObjectId} from "mongodb";
import {AuthRequest, verifyToken} from "../middleware/verifyToken";
import {validarDuplaProductoCantidad} from "../validators/producto";
import {extraerDuplaProductoCantidad} from "../util/parsers/producto";
import {coleccionCarritos, coleccionProductos} from "../database/mongo";
import {DuplaItemCantidad, Product} from "../types/Product";
import {Cart} from "../types/Cart";
import {obtenerIdUsuario} from "../util/parsers/usuario";


const router = Router();

/**
 * Reduce el stock de un producto en la base de datos.
 * @param {Product | null} producto El producto (actualizado) cuyo stock se va a reducir.
 * @param {DuplaItemCantidad} duplaProductoCantidad La dupla que contiene el ID del producto y la cantidad a reducir.
 * @returns {Promise<void>} Una promesa que se resuelve cuando el stock ha sido reducido.
 */
const reducirStock = async (producto: Product, duplaProductoCantidad: DuplaItemCantidad): Promise<void> =>
{
    // console.log("Producto antes de actualizar stock:", producto);
    const nuevoStock = producto.stock - duplaProductoCantidad.quantity;
    // console.log("Nuevo stock a actualizar:", nuevoStock);
    await coleccionProductos()
        .updateOne({_id: new ObjectId(duplaProductoCantidad.productId)}, {$set: {stock: nuevoStock}});
};


router.put("/add", verifyToken, async (req: AuthRequest, res) =>
{
    try
    {
        const auth = req.get("Authorization");
        if (!auth)
        {
            return res.status(400).json({message: "falta el token"});
        }


        if (!req.user || typeof req.user === "string" || !("id" in req.user))
        {
            return res.status(401).json({message: "Invalid token payload"});
        }

        const id_usuario = obtenerIdUsuario(auth);
        if (!id_usuario)
        {
            // console.log("PETICION --> Error al extraer el ID de usuario del token");
            return res.status(401).json({message: "Invalid token"});
        }

        // console.log("PETICION --> ID usuario extraído del token:", id_usuario);

        const cuerpoCorrecto = validarDuplaProductoCantidad(req.body);
        if (cuerpoCorrecto !== null)
        {
            return res.status(400).json({message: cuerpoCorrecto});
        }

        // console.log("PETICION --> Cuerpo de la petición validado correctamente:", req.body);

        const duplaProductoCantidad: DuplaItemCantidad = extraerDuplaProductoCantidad(req.body);

        // console.log("PETICION --> He creado la dupla producto-cantidad:", duplaProductoCantidad);
        // console.log("PETICION --> el tipo de productId es:", typeof duplaProductoCantidad.productId);

        const _id = new ObjectId(duplaProductoCantidad.productId);

        // console.log("PETICION --> Buscando producto en BD con ID:", _id);

        const productoEnBD = await coleccionProductos().findOne({_id});
        if (!productoEnBD)
        {
            return res.status(404).json({message: "Product not found"});
        }

        if (productoEnBD.stock < duplaProductoCantidad.quantity)
        {
            return res.status(400).json({message: "Insufficient stock"});
        }

        // console.log("PETICION --> Producto en BD:", productoEnBD);

        let carrito = (await coleccionCarritos().findOne({userId: new ObjectId(id_usuario)}));
        if (null === carrito) // Si el carrito no existe, se crea uno nuevo
        {
            const nuevoCarrito: Cart = {
                userId: new ObjectId(id_usuario),
                items: [duplaProductoCantidad],
            };
            const resultado = await coleccionCarritos().insertOne(nuevoCarrito);
            // console.log("Nuevo carrito creado con ID:", resultado.insertedId);
            carrito = await coleccionCarritos().findOne({_id: resultado.insertedId});
            if (carrito === null)
            {
                return res.status(500).json({message: "Error creating cart"});
            }
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

        //--

        const carritoActualizado = await coleccionCarritos()
            .findOneAndUpdate({userId: new ObjectId(id_usuario)}, {$set: {items: carrito.items}}, {returnDocument: 'after'});

        //Llegados a este punto, el carrito se ha actualizado correctamente y procedemos a la sustracción de stock en la colección de productos
        const producto: Product | null = await coleccionProductos()
            .findOne({_id: new ObjectId(duplaProductoCantidad.productId)});
        if (producto === null)
        {
            return res.status(404).json({message: "Product not found for stock reduction"});
        }


        await reducirStock(producto, duplaProductoCantidad);

        return res.status(200).json({carritoActualizado: carritoActualizado});
    }
    catch (err)
    {
        res.status(500).json({message: err});
    }
});


router.get("/", verifyToken, async (req: AuthRequest, res) =>
{
    try
    {
        const auth = req.get("Authorization");
        if (!auth)
        {
            return res.status(400).json({message: "falta el token"});
        }
        const id_usuario = obtenerIdUsuario(auth);
        if (!id_usuario)
        {
            // console.log("PETICION GET CARRITO--> Error al extraer el ID de usuario del token");
            return res.status(401).json({message: "Invalid token"});
        }

        const carrito = (await coleccionCarritos().findOne({userId: new ObjectId(id_usuario)}));
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
