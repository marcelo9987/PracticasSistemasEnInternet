import {IResolvers} from "@graphql-tools/utils";
import {signToken} from "../auth";
import {comprobarUsuarioId, createUser, findUserById, logearUsuario, obtenerUsuarios,} from "../collections/users";
import {Project} from "../types/Project";
import {
    actualizarProyecto,
    crearProyecto,
    eliminarProyecto,
    findProjectById,
    obtenerProyectosDelUsuario,
    proyectoDeUsuario,
    validarFechasProyecto
} from "../collections/proyectos";
import {ObjectId} from "mongodb";
import {Task, TaskPriority, TaskStatus} from "../types/Task";
import {
    actualizarTarea,
    eliminarTareaPorId,
    insertarTarea,
    obtenerTareaPorId,
    obtenerTareaPorProyecto
} from "../collections/tasks";

export const resolvers: IResolvers = {
    Project: {
        owner: async (project: Project) =>
        {
            return await findUserById(project.owner.toString());
        }, members: async (project: Project) =>
        {
            return Promise.all(project.members.map(id => findUserById(id.toString())));
        }, tasks: async (project: Project) =>
        {
            return await obtenerTareaPorProyecto(project._id!.toString());
        }
    },
    Task: {
        project: async (task: Task) =>
        {
            return await findProjectById(task.project.toString());
        }
        , assignedTo: async (task: Task) =>
        {
            return await findUserById(task.assignedTo!.toString());
        }
    }
    , Query: {
        //Consultar usuarios
        users: async (_, __, context) =>
        {
            if (!context.user)
            {
                throw new Error("No autenticado!");
            }
            return await obtenerUsuarios();
        },
        myProjects: async (_, __, context) =>
        {
            if (!context.user)
            {
                throw new Error("No autenticado!");
            }
            return await obtenerProyectosDelUsuario(context.user._id.toString());
        },
        projectDetails: async (_, {id}: { id: string }, context) =>
        {
            if (!context.user)
            {
                throw new Error("No autenticado!");
            }
            const proyecto = await findProjectById(id);
            if (!proyecto)
            {
                throw new Error("El proyecto no existe");
            }
            if (!(await proyectoDeUsuario(context.user._id.toString(), id)))
            {
                throw new Error("No tienes permisos para ver este proyecto");
            }
            return proyecto;
        }

    }, Mutation: {
        // REGISTRAR
        register: async (_, {input}: {
            input: {
                username: string, email: string; password: string
            }
        }) =>
        {
            const {
                username, password, email
            } = input;
            const userId: string = await createUser(username, email, password);
            const _user = await findUserById(userId);
            if (typeof _user === null || _user === null)
            {
                console.error("Error creando el usuario");
                return;
            }

            const tokenRecibido = signToken(userId);
            return {
                user: _user, token: tokenRecibido
            };
        },


        // INICIAR SESION
        login: async (_, {input}: {
            input: {
                email: string, password: string
            }
        }) =>
        {

            const usuarioValidado = await logearUsuario(input.email, input.password);
            if (typeof usuarioValidado === null || usuarioValidado === null)
            {
                throw new Error("Error iniciando sesión");
            }
            const tokenDeUsuario = signToken(usuarioValidado._id.toString());
            return {
                user: usuarioValidado, token: tokenDeUsuario
            };
        },


        // CREAR PROYECTO
        createProject: async (_, {input}: {
            input: {
                name: string, description: string, startDate: string, endDate: string, members: Array<ObjectId>
            }
        }, contexto): Promise<Project> =>
        {
            if (!contexto.user)
            {
                throw new Error("Error: No tienes permisos para crear un proyecto. Debes iniciar sesión.");
            }
            const {
                name, description, startDate, endDate, members
            } = input;

            if (!validarFechasProyecto(new Date(startDate), new Date(endDate)))
            {
                throw new Error("Error: Las fechas del proyecto no son válidas. La fecha de inicio debe ser anterior a la fecha de fin.");
            }

            const nuevoProyecto: Project = {
                name: name, description: description || "", startDate: new Date(startDate), endDate: new Date(endDate), owner: new ObjectId(contexto.user._id.toString()), members: [contexto.user._id.toString(), ...(members ?? [])],
            };
            const id = await crearProyecto(nuevoProyecto);
            const proyectoCreado: Project | null = await findProjectById(id);
            if (!proyectoCreado)
            {
                throw new Error("Error creando el proyecto");
            }
            return proyectoCreado;
        },

        // Actualizar Proyecto
        updateProject: async (_, {id, input}: {
            id: string, input: { description: string, endDate: string }
        }, contexto): Promise<Project> =>
        {
            if (!contexto.user)
            {
                throw new Error("Error: No tienes permisos para actualizar un proyecto. Debes iniciar sesión.");
            }
            if (!input.endDate)
            {
                throw new Error("Error: La fecha de fin es obligatoria para actualizar el proyecto.");
            }
            const nuevaFechaFin = new Date(input.endDate);
            const nuevaDescripcion = input.description;

            if (isNaN(nuevaFechaFin.getTime()))
            {
                throw new Error("Error: La fecha de fin proporcionada no es válida.");
            }

            const proyectoActual = await findProjectById(id);
            if (!proyectoActual)
            {
                throw new Error("Error: El proyecto que intentas actualizar no existe.");
            }
            if (proyectoActual.owner.toString() !== contexto.user._id.toString())
            {
                throw new Error("Error: No tienes permisos para actualizar este proyecto. Solo el propietario puede actualizarlo.");
            }
            if (proyectoActual.startDate < proyectoActual.startDate)
            {
                throw new Error("Error: La nueva fecha de fin no puede ser anterior a la fecha de inicio del proyecto.");
            }

            const proyectoActualizado: Project = {
                ...proyectoActual, description: nuevaDescripcion || proyectoActual.description, endDate: nuevaFechaFin
            };
            return actualizarProyecto(id, proyectoActualizado);
        },

        addMember: async (_, {projectId, userId}: { projectId: string, userId: string }, contexto): Promise<Project> =>
        {
            if (!contexto.user)
            {
                throw new Error("Error: No tienes permisos para agregar miembros a un proyecto. Debes iniciar sesión.");
            }
            const proyectoActual = await findProjectById(projectId);
            if (!proyectoActual)
            {
                throw new Error("Error: El proyecto al que intentas agregar un miembro no existe.");
            }
            if (proyectoActual.owner.toString() !== contexto.user._id.toString())
            {
                throw new Error("Error: No tienes permisos para agregar miembros a este proyecto. Solo el propietario puede hacerlo.");
            }

            await comprobarUsuarioId(userId);

            if (proyectoActual.members.map(member => member.toString()).includes(userId))
            {
                throw new Error("Error: El usuario ya es miembro de este proyecto.");
            }

            const proyectoActualizado: Project = {
                ...proyectoActual, members: [...proyectoActual.members, new ObjectId(userId)]
            };
            return actualizarProyecto(projectId, proyectoActualizado);

        },

        // ELIMINAR PROYECTO
        deleteProject: async (_, {id}: {
            id: string
        }, context): Promise<boolean> =>
        {
            if (!context.user)
            {
                throw new Error("Error: No tienes permisos para eliminar un proyecto. Debes iniciar sesión primero.");
            }

            const proyecto: Project | null = await findProjectById(id);
            if (!proyecto)
            {
                throw new Error("Error: El proyecto que intentas eliminar no existe.");
            }
            if (proyecto.owner.toString() !== context.user._id.toString())
            {
                throw new Error("Error: No tienes permisos para eliminar este proyecto. Solo el propietario puede eliminarlo.");
            }

            const tareasProyecto: Task[] = await obtenerTareaPorProyecto(id);
            if (tareasProyecto.length !== 0)
            {
                for (const tarea of tareasProyecto)
                {
                    if (!tarea._id)
                    {
                        continue;
                    }
                    const resultadoEliminacion = await eliminarTareaPorId(tarea._id.toString());
                    if (!resultadoEliminacion)
                    {
                        throw new Error(`Error: No se pudo eliminar la tarea con id ${tarea._id.toString()} asociada al proyecto.`);
                    }
                }
            }

            const resultado = await eliminarProyecto(id);


            return Boolean(resultado);
        },


        createTask: async (_, {projectId, input}: {
            projectId: string, input: {
                title: String
                assignedTo: ObjectId
                status: string
                priority: string
                dueDate: string
            }
        }, contexto): Promise<Task> =>
        {
            if (!contexto.user)
            {
                throw new Error("Error: No tienes permisos para crear una tarea. Debes iniciar sesión.");
            }

            if (!(await proyectoDeUsuario(contexto.user._id.toString(), projectId)))
            {
                throw new Error("Error: No tienes permisos para crear una tarea en este proyecto.");
            }

            const {title, assignedTo, status, priority, dueDate} = input;

            if (isNaN(new Date(dueDate).getTime()))
            {
                throw new Error("Error: La fecha de vencimiento proporcionada no es válida.");
            }

            // console.log("AssignedTo:", assignedTo);
            if(assignedTo)
            {
                await comprobarUsuarioId(assignedTo.toString());
            }


            if (!priority || !(priority in TaskPriority))
            {
                throw new Error("Error: La prioridad de la tarea no es válida.");
            }

            const tareaNueva: Task =
                {
                    title: title,
                    project: new ObjectId(projectId),
                    assignedTo: assignedTo?? null,
                    status: status as TaskStatus??TaskStatus.PENDING ,
                    priority: priority as TaskPriority,
                    dueDate: new Date(dueDate)
                };

            const resultadoOperacion = await insertarTarea(tareaNueva);
            return await obtenerTareaPorId(resultadoOperacion);
        },
        updateTaskStatus: async (_, {taskId, status}: { taskId: string, status: string }, contexto): Promise<Task> =>
        {
            if (!contexto.user)
            {
                throw new Error("Error: No tienes permisos para actualizar una tarea. Debes iniciar sesión.");
            }

            const tareaActual = await obtenerTareaPorId(taskId);
            if (!tareaActual)
            {
                throw new Error("Error: La tarea que intentas actualizar no existe.");
            }

            const proyectoAsociado = await findProjectById(tareaActual.project.toString());
            if (!proyectoAsociado || !(await proyectoDeUsuario(contexto.user._id.toString(), proyectoAsociado._id!.toString())))
            {
                throw new Error("Error: No tienes permisos para actualizar esta tarea.");
            }

            if (!status || !(status in TaskStatus))
            {
                throw new Error("Error: El estado de la tarea no es válido.");
            }

            const tareaActualizada: Task = {
                ...tareaActual,
                status: status as TaskStatus
            };
            return await actualizarTarea(taskId,tareaActualizada);
        }


    }
};


