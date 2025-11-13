import {Db, MongoClient} from "mongodb";
import {Usuario} from "../types/Usuario";
import {Cart} from "../types/Cart";
import {Product} from "../types/Product";

let client: MongoClient;
let dB: Db;

export const conectarMongoDB = async (): Promise<void> => {
    try {
        const mongoUrl = `mongodb+srv://${process.env.USER_MONGO}:${process.env.USER_PASSWORD}@${process.env.MONGO_CLUSTER}.${process.env.MONGOURL}/?appName=${process.env.MONGO_APP_NAME}`;

        client = new MongoClient(mongoUrl);
        await client.connect();
        dB = client.db(`${process.env.MONGO_DATABASE}`);
        console.log("Connected to mongodb at db " + `${process.env.MONGO_DATABASE}`);
    } catch (error) {
        console.log("Error mongo: ", error);
    }
};

const obtenerDB = ():Db => dB;

export const coleccionUsuarios = () => obtenerDB().collection<Usuario>("users");
export const coleccionCarritos = () => obtenerDB().collection<Cart>("cart");
export const coleccionProductos = () => obtenerDB().collection<Product>("products");
