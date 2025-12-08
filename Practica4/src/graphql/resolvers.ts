import {IResolvers} from "@graphql-tools/utils";
import {signToken} from "../auth";
import {createUser, findUserById, logearUsuario, obtenerUsuarios} from "../collections/users";
import {Project} from "../types/Project";
import {
    actualizarProyecto, crearProyecto, eliminarProyecto, findProjectById, validarFechasProyecto
} from "../collections/proyectos";
import {ObjectId} from "mongodb";

export const resolvers: IResolvers = {
    Project: {
        owner: async (project: Project) =>
        {
            return await findUserById(project.owner.toString());
        }, members: async (project: Project) =>
        {
            return Promise.all(project.members.map(id => findUserById(id.toString())));
        }
    }, Query: {
        //Consultar usuarios
        users: async (_, __, context) =>
        {
            if (!context.user)
            {
                throw new Error("No autenticado!");
            }
            return await obtenerUsuarios();
        },

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
                name: name, description: description || "",
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                owner: contexto.user._id.toString(),
                members: [contexto.user._id.toString(), ...(members ?? [])],
            };
            const id = await crearProyecto(nuevoProyecto);
            const proyectoCreado: Project | null = await findProjectById(id);
            if (!proyectoCreado)
            {
                throw new Error("Error creando el proyecto");
            }
            return proyectoCreado;
        },


        // ELIMINAR PROYECTO
        deleteProject: async (_, {id}: { //fixme: eliminar las tareas asociadas
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

            const resultado = await eliminarProyecto(id);

            return Boolean(resultado);
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
        }
    }
};


