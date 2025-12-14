import {Router} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {User} from "../types/User";
import {validarUsuarioRegistro} from "../validators/usuario";
import {coleccionUsuarios} from "../database/mongo";
import {JwtPayload} from "../types/otros";
import {extraerUsuario} from "../util/parsers/usuario";

const router = Router();

dotenv.config();

const SECRET = process.env.SECRET;


router.get("/", async (req, res) =>
{
    res.status(200).json({"message": "Conectado a auth con éxito"});
});


router.post("/register", async (req, res) =>
{
    try
    {
        const errores = validarUsuarioRegistro(req.body);
        if (errores)
        {
            // console.log("Errores de validación:", errores);
            return res.status(400).json({message: errores});
        }

        const usuario: User = extraerUsuario(req.body);

        const existeEmail = await coleccionUsuarios().findOne({email: usuario.email});
        if (existeEmail)
        {
            return res.status(409).json({message: "Email already registered"});
        }

        const existeUsuario = await coleccionUsuarios().findOne({username: usuario.username});
        if (existeUsuario)
        {
            return res.status(409).json({message: "Username already taken"});
        }

        const usuarios = coleccionUsuarios();

        const contrasenhaEncriptada = await bcrypt.hash(usuario.passwordHash, 10);
        const idNuevoUsuario = await usuarios.insertOne({
            username: usuario.username,
            email: usuario.email,
            passwordHash: contrasenhaEncriptada,
            createdAt: new Date()
        });

        const creadoConExito = await usuarios.findOne({_id: idNuevoUsuario.insertedId});
        if (creadoConExito)
        {
            return res.status(201).json({message: "User created"});
        }
        res.status(500).json({message: "Critical error creating user"});

    }
    catch (err)
    {
        // console.log(err);
        res.status(500).json({message: err});
    }
});


router.post("/login", async (req, res) =>
{
    try
    {
        const {
            email,
            password
        } = req.body as {
            email: string,
            password: string
        };

        const usuarios = coleccionUsuarios();

        const user = await usuarios.findOne({email});
        if (!user)
        {
            return res.status(404).json({message: "Email not found, couldn't proceed"});
        }

        const validPass = await bcrypt.compare(password, user.passwordHash);
        if (!validPass)
        {
            return res.status(404).json({message: "Bad password, maybe a typo?"});
        }

        // console.log(user);
        // console.log(SECRET);
        const token = jwt.sign({
            id: user._id?.toString(),
            email: user.email
        } as JwtPayload, SECRET as string, {
            expiresIn: "1h"
        });

        console.log(token);

        res.status(200).json({token});

    }
    catch (err)
    {
        res.status(500).json({message: err});
    }
});


export default router;
