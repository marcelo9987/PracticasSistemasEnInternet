import {Router} from "express";
import {verifyToken} from "../middleware/verifyToken";
import {coleccionProductos} from "../database/mongo";
import {Product} from "../types/Product";
import {validarProducto} from "../validators/producto";
import {extraerProducto} from "../util/parsers/producto";



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
        const error = validarProducto(req.body);
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