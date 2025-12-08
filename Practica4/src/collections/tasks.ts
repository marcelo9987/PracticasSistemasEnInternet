import {getDB} from "../db/mongo";
import {Task} from "../types/Task";
import {ObjectId} from "mongodb";

const COLLECTION = "tasks";

export const encontrarTareasPorProyecto = async (id_proyecto: string) =>
{
    const db = getDB();
    return await db.collection<Task>(COLLECTION).find({projectId: id_proyecto}).toArray();
}

export const insertarTarea = async (tarea: Task): Promise<string> =>
{
    const db = getDB();
    const result = await db.collection(COLLECTION).insertOne(tarea);
    return result.insertedId.toString();
}

export const obtenerTareaPorId= async (id: string): Promise<Task> =>
{
    const db = getDB();
    const tarea = await db.collection<Task>(COLLECTION).findOne({_id: new ObjectId(id)});
    if(!tarea)
    {
        throw new Error("La tarea solicitada no existe");
    }
    return tarea;
}

export const obtenerTareaPorProyecto = async (id_proyecto: string): Promise<Task[]> =>
{
    const db = getDB();
    return await db.collection<Task>(COLLECTION).find({project: new ObjectId(id_proyecto)}).toArray();
}

export const eliminarTareaPorId = async (id: string): Promise<boolean> =>
{
    const db = getDB();
    const result = await db.collection(COLLECTION).deleteOne({_id: new ObjectId(id)});
    return result.deletedCount === 1;
}

export const actualizarTarea= async(id: string, tareaActualizada: Task): Promise<Task> =>
{
    const db = getDB();
    const resultadoOperacion = await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $set: tareaActualizada }
    );
    if(resultadoOperacion.matchedCount <= 0)
    {
        throw new Error("Error actualizando la tarea");
    }
    const tareaRemota:Task|null = await db.collection<Task>(COLLECTION).findOne({_id: new ObjectId(id)});
    if(!tareaRemota)
    {
        throw new Error("Error actualizando la tarea");
    }
    return tareaRemota;
}