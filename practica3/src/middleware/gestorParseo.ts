import {NextFunction, Request, Response} from "express";

/**
 * Gestor de errores de parsing de JSON en las peticiones.
 * @param err Error en el formato JSON
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 * @returns Respuesta con error 400 si el JSON está mal formado, o pasa al siguiente middleware.
 */
export const gestorParseo = (err: any, req: Request, res: Response, next: NextFunction) =>
{
    if (err instanceof SyntaxError && 'body' in err)
    {
        // JSON mal formado --> De sintaxis: Falta una coma, una llave, etc.
        // Que aparezca el body en el error indica que el error viene del parsing del body
        return res.status(400).send({error: 'JSON mal formado'});
    }
    next();
};