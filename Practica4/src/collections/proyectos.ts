import {getDB} from "../db/mongo";
import {Project} from "../types/Project";
import {ObjectId} from "mongodb";
import {Task} from "../types/Task";
import {encontrarTareasPorProyecto} from "./tasks";

/**
 * Nombre de la colección de proyectos en la base de datos
 * @type {string} Nombre de la colección
 */
const COLLECTION = "projects";

/**
 * Valida fechas para su posterior uso en proyectos
 * @param {Date} fechaInicio Fecha en la que se supone que inicia el proyecto
 * @param {Date} fechaFin Fecha en la que se supone que finaliza el proyecto
 * @returns {boolean} True si las fechas son válidas (fechaInicio existe y es menor o igual a fechaFin, que también existe), false si no lo son.
 */
export const validarFechasProyecto = (fechaInicio: Date, fechaFin: Date): boolean => {
    if(!fechaInicio || !fechaFin) {
        throw new Error("Las fechas no pueden estar vacías");
    }

    if(isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        throw new Error("Las fechas proporcionadas no son válidas");
    }

    return fechaFin >= fechaInicio;
}

export const crearProyecto = async (proyecto: Project): Promise<string> => {
    const db = getDB();
    const result = await db.collection(COLLECTION).insertOne(proyecto);
    return result.insertedId.toString();
}

export const actualizarProyecto = async (id:string, proyectoActualizado:Project): Promise<Project> =>
{
    const db = getDB();
    await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $set: proyectoActualizado }
    );

    const tareasAsociadas:Array<Task> = await encontrarTareasPorProyecto(id);

    const proyectoRemoto:Project|null = await db.collection<Project>(COLLECTION).findOne({_id: new ObjectId(id)});
    if(!proyectoRemoto)
    {
        throw new Error("Error actualizando el proyecto");
    }

    return {
        ...proyectoRemoto,
        tasks: tareasAsociadas.map(tarea => tarea._id!)
    };
}

export const eliminarProyecto= async (id: string): Promise<boolean> => {
    const db = getDB();
    const resultado = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
    return resultado.deletedCount === 1;
}

export const proyectoDeUsuario = async (id_usuario: string, id_proyecto: string): Promise<boolean> => {
    const db = getDB();
    const proyecto = await db.collection<Project>(COLLECTION).findOne({_id: new ObjectId(id_proyecto)});
    if(!proyecto) {
        throw new Error("El proyecto no existe");
    }
    if((proyecto.owner.toString() === id_usuario ) || (proyecto.members.map(member => member.toString()).includes(id_usuario)))
    {
        return true;
    }

    return false;

}


export const findProjectById = async (id: string): Promise<Project | null> => {
    const db = getDB();
    return await db.collection<Project>(COLLECTION).findOne({_id: new ObjectId(id)});
}

export const obtenerProyectosDelUsuario = async (id_usuario: string): Promise<Project[]> =>
{
    const db = getDB();
    // console.log("Obteniendo proyectos del usuario con id: ", id_usuario);
    return await db.collection<Project>(COLLECTION).find({ $or: [ { owner: new ObjectId(id_usuario) }, { members: new ObjectId(id_usuario) } ] }).toArray();
}


