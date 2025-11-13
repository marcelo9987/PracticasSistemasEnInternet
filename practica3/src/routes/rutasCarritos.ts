import {Router} from "express";
import {ObjectId} from "mongodb";
import {verifyToken} from "../middleware/verifyToken";
import {validarDuplaProductoCantidad} from "../validators/producto";
import {extraerDuplaProductoCantidad} from "../util/parsers/producto";
import {obtenerIdUsuario} from "../util/parsers/usuario";
import {coleccionCarritos, coleccionProductos} from "../database/mongo";
import {DuplaItemCantidad} from "../types/Product";
import {Cart} from "../types/Cart";


const router = Router();

router.put("/add", verifyToken, async (req, res) =>
{
    try
    {
        // console.log(jwt.decode(req.get("Authorization")!.substring(7)))
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
            return res.status(400).json({message: "Error: productId no existe en la base de datos."});
        }

        const duplaProductoCantidad: DuplaItemCantidad = extraerDuplaProductoCantidad(req.body);

        const carrito = (await coleccionCarritos().findOne({userId: id_usuario}));
        if (carrito === null) // Si el carrito no existe, se crea uno nuevo
        {
            const nuevoCarrito: Cart = {
                userId: id_usuario, items: [duplaProductoCantidad],
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

            const carritoActualizado = await coleccionCarritos()
                .findOneAndUpdate({userId: id_usuario}, {$set: {items: carrito.items}}, {returnDocument: 'after'});
            return res.status(201).json({carritoActualizado: carritoActualizado});
        }
        // El producto no está en el carrito, se agrega
        carrito.items.push(duplaProductoCantidad);
        const carritoActualizado = await coleccionCarritos()
            .findOneAndUpdate({userId: id_usuario}, {$set: {items: carrito.items}}, {returnDocument: 'after'});
        return res.status(201).json({carritoActualizado: carritoActualizado});
    }
    catch (err)
    {
        console.log(err);
    }
});


export default router;