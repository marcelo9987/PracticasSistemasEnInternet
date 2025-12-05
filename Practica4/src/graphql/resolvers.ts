import {IResolvers} from "@graphql-tools/utils";
import {signToken} from "../auth";
import {createUser, findUserById, logearUsuario} from "../collections/users";

export const resolvers: IResolvers ={
    Query: {

    },
    Mutation:{
        // REGISTRAR
        register: async (
            _,
            { input }: {input:{ username: string ,email: string; password: string }}
        ) => {
            const {username, password, email} = input
            const userId:string = await createUser(username, email, password);
            const _user = await findUserById(userId)
            if(typeof _user===null || _user===null)
            {
                console.error("Error creando el usuario");
                return;
            }

            const tokenRecibido = signToken(userId);
            return {user:_user,token:tokenRecibido}
        },
        //----//
        // INICIAR SESION
        login: async(_, {input}:{input:{email: string, password:string}})=>
        {

            const usuarioValidado = await logearUsuario(input.email, input.password);
            if(typeof usuarioValidado===null || usuarioValidado===null)
            {
                throw new Error("Error iniciando sesión");
            }
            const tokenDeUsuario = signToken(usuarioValidado._id.toString());
            return {user:usuarioValidado, token:tokenDeUsuario};
        },

    }
}


