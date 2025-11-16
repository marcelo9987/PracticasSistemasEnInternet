import express from "express";
import {conectarMongoDB} from "./database/mongo";
import rutasAuth from "./routes/rutasAuth";
import rutasInventario from "./routes/rutasInventario";
import rutasCarritos from "./routes/rutasCarritos";
import dotenv from "dotenv";
import {gestorParseo} from "./middleware/gestorParseo";


const PUERTO: number = 3000;

dotenv.config();

conectarMongoDB();

const app = express();
app.use(express.json());
app.use(gestorParseo);

app.use("/api/auth", rutasAuth);
app.use("/api/products", rutasInventario);
app.use("/api/cart", rutasCarritos);

app.use((req, res) =>
{
    res.status(404).json({message: 'Not found'});
});


app.listen(PUERTO, () => console.log("API en marcha!🎉 Puerto:", PUERTO));
