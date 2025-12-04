import { gql } from "apollo-server";
import {IResolvers} from "@graphql-tools/utils";
import {signToken} from "../auth";
import {AuthPayload} from "../types/AuthPayload";
import {ObjectId} from "mongodb";
import {User} from "../types/User";
import {createUser, findUserById} from "../collections/users";

export const resolvers: IResolvers ={
    Query: {

    },
    Mutation:{
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
        }
    }
}