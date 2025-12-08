import express, {type Request, type Response,} from "express";
import {connectMongoDB} from "./mongo";
import enrutadorPersonas, {gestorDeErrores} from "./routes";
import dotenv from "dotenv";

dotenv.config();

connectMongoDB();

const app = express();
app.use(express.json());

//RUTAS
app.use("/api/books",enrutadorPersonas);

app.use((req: Request, res: Response) => {
    res.status(404).json({error: "Ruta no encontrada"});
});

app.use(gestorDeErrores);


//FIN RUTAS



app.listen(3000,()=>"API iniciada");