/**
 * Valida los datos de registro de un usuario
 * @param datos Datos de entrada
 * @returns {string | null} Mensaje de error o null si es válido
 */
export const validarUsuarioRegistro = (datos: any): string | null =>
{
    if (!datos)
    {
        return "Se esperan parámetros de entrada";
    }

    const {
        username,
        email,
        password
    } = datos;
    if (!username || !email || !password)
    {
        return "Faltan campos obligatorios";
    }
    if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string")
    {
        return "ERROR!: Formato esperado: {username: string, email: string, passwordHash: string}";
    }

    if (!validarEmail(email))
    {
        return "Error: Email mal formado, espero una cadena formateada como: usuario@dominio.extension donde la extension ha de tener al menos 2 caracteres";
    }


    return null;
};

/**
 * Valida el formato de un email
 * @param {string} email email a validar
 * @returns {boolean} true si es válido, false si no lo es
 */
const validarEmail = (email: string): boolean =>
{
    const regex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
    return regex.test(email);
};
