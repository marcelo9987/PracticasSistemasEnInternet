import express from "express";
import { conectarMongoDB } from "./database/mongo";
import rutasAuth from "./routes/auth";
import rutasInventario from "./routes/rutasInventario"
import rutasCarritos from "./routes/rutasCarritos"
import dotenv from "dotenv";

const PUERTO: number = 3000;

dotenv.config();

conectarMongoDB();

const app = express();
app.use(express.json());
app.use("/api/auth", rutasAuth);
app.use("/api/products", rutasInventario);
app.use("/api/cart", rutasCarritos);

app.listen(PUERTO, () => console.log("API en marcha!🎉 Puerto:", PUERTO));