import {type NextFunction, type Request, type Response, Router} from "express";

import {getDb} from "./mongo";
import {ObjectId} from "mongodb";
import {extraer_libro, validar_libro} from "./util";
import {Book} from "./types";

const router = Router();
const coleccion = () => getDb().collection(`${process.env.COLECCION}`);

export const gestorDeErrores = (err: any, req: Request, res: Response, next: NextFunction) =>
{
    console.error("¡Detectado un error en la aplicación!:", err.message);
    res.status(500).json({error: "Error interno del servidor", detail: err.message});
};


router.get("/", async (req, res) =>
{
    try
    {
        const libros = await coleccion().find().toArray();
        res.status(200).json(libros);
    }
    catch (err)
    {
        res.status(404).json(err);
    }
});


router.post(`/`, async (req, res) =>
{

    try
    {

        const err_validacion = validar_libro(req.body);
        if (err_validacion)
        {
            return res.status(400).json({err_validacion});

        }

        const nuevo_libro = await extraer_libro(req.body, undefined);
        const id_inserccion = await coleccion().insertOne(nuevo_libro);

        const libro_subido = await coleccion().findOne({_id: id_inserccion.insertedId});

        const salida = {
            ...libro_subido,
        };

        res.status(201).json(salida);
    }
    catch (err)
    {
        res.status(400).json({"message": "invalid json body"});
    }
});


router.put("/:id", async (req, res) =>
{
    try
    {

        const err_validacion = validar_libro(req.body);
        if (err_validacion)
        {
            return res.status(400).json({err_validacion});

        }

        const datos_antiguos = await coleccion().findOne({_id: new ObjectId(req.params.id)});

        const libro_antiguo: Book =
            {
                title: datos_antiguos?.title,
                author: datos_antiguos?.author,
                pages: datos_antiguos?.pages,
                createdAt: datos_antiguos?.createdAt,
                updatedAt: datos_antiguos?.updatedAt,
            };


        const nuevo_libro = await extraer_libro(req.body, libro_antiguo);
        await coleccion().updateOne(
            {_id: new ObjectId(req.params?.id)},
            {$set: nuevo_libro}
        );

        const libro_subido = await coleccion().findOne({_id: new ObjectId(req.params.id)});

        res.status(200).json(libro_subido);
    }
    catch (err)
    {
        res.status(400).json({"message": "invalid json body"});
    }
});

router.delete("/:id", async (req, res) =>
{
    try
    {
        const result = await coleccion().deleteOne({
            _id: new ObjectId(req.params?.id),
        });
        res.status(200).json({message: "Deleted successfully"});
    }
    catch (err)
    {
        res.status(404).json({"message": "Not found"});
    }
});


export default router;