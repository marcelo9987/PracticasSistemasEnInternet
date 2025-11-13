import {Router} from "express";
import {authRequest, verifyToken} from "../middleware/verifyToken";
import {Product} from "../types";
import {obtenerDB} from "../mongo";
import {extraerProducto, verificarProducto} from "../util";

const coleccionProductos = () => obtenerDB().collection<Product>("products");


const router = Router();

router.get("/", async (req, res) =>
{
    try
    {
        const discos: Product[] = (await coleccionProductos().find().toArray());
        res.json(discos);
    }
    catch (err)
    {
        res.status(404).json(err);
    }
});

router.post('/', verifyToken, async (req, res) =>
{
    try
    {
        const error = verificarProducto(req.body);
        if (error)
        {
            return res.status(400).json({error});
        }
        const nuevoProducto: Product = extraerProducto(req.body);

        const id_disco_insertado = (await coleccionProductos().insertOne(nuevoProducto)).insertedId;
        res.status(201).json({id_disco_insertado,...nuevoProducto});
    }
    catch (err: any)
    {
        res.status(500).json({error: err.message});
    }
});


export default router;