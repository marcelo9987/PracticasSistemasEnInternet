import {Router} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {validarUsuarioRegistro} from "../validators/usuario";
import {coleccionUsuarios} from "../database/mongo";
import {JwtPayload} from "../types/otros";

const router = Router();

dotenv.config();

const SECRET = process.env.SECRET;



router.get("/", async (req, res) =>
{
    res.status(200).json({"message":"Conectado a auth con éxito"});
});


router.post("/register", async (req, res) =>
{
    try
    {
        const {username, email, password} = req.body as { username: string, email: string, password: string };

        const errores = validarUsuarioRegistro({username, email, password});
        if (errores)
        {
            console.log("Errores de validación:", errores);
            return res.status(400).json({message: errores});
        }

        const existeEmail = await coleccionUsuarios().findOne({email});
        if (existeEmail)
        {
            return res.status(400).json({message: "Email already registered"});
        }

        const existeUsuario = await coleccionUsuarios().findOne({username});
        if (existeUsuario)
        {
            return res.status(400).json({message: "Username already taken"});
        }

        const usuarios = coleccionUsuarios();

        const creadoConExito = await usuarios.findOne({email});
        if (creadoConExito)
        {
            return res.status(400).json({message: "User created"});
        }

        const contrasenhaEncriptada = await bcrypt.hash(password, 10);
        await usuarios.insertOne({username: username, email: email, passwordHash: contrasenhaEncriptada, createdAt: new Date()});

        res.status(201).json({message: "Usuario creado correctamente!"});

    }
    catch (err)
    {
        res.status(500).json({message: err});
    }
});

router.post("/login", async (req, res) =>
{
    try
    {
        const {email, password} = req.body as { email: string, password: string };

        const usuarios = coleccionUsuarios();

        const user = await usuarios.findOne({email});
        if (!user)
        {
            return res.status(404).json({message: "email incorrecto"});
        }

        const validPass = await bcrypt.compare(password, user.passwordHash);
        if (!validPass)
        {
            return res.status(404).json({message: "contraseña incorrecta"});
        }

        console.log(user);
        console.log(SECRET);
        const token = jwt.sign({id: user._id?.toString(), email: user.email} as JwtPayload, SECRET as string, {
            expiresIn: "1h"
        });

        console.log(token);

        res.status(200).json({token});

    }
    catch (err)
    {
        res.status(500).json({message: err});
    }
})


export default router;