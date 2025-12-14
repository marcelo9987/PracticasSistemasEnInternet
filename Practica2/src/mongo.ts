import { Db, MongoClient } from "mongodb";

let client : MongoClient;
let dB: Db;

export const connectMongoDB = async (): Promise<void> =>
{
    const mongoUrl = `mongodb+srv://${process.env.USER_MONGO}:${process.env.USER_PASSWORD}@${process.env.MONGO_CLUSTER}.${process.env.MONGO_DOMINIO}/?appName=${process.env.MONGO_APP_NAME}`;
    try
    {
        client = new MongoClient(mongoUrl);
        await client.connect();
        dB = client.db(process.env.MONGO_NOMBRE_BASE_DE_DATOS);
        console.log("Conectado a MongoDB, BBDD: " + process.env.MONGO_NOMBRE_BASE_DE_DATOS);
    }
    catch (error)
    {
        console.log("Error en mongo: ",error);
    }
};

export const getDb = ():Db => dB;