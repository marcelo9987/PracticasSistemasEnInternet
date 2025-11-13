export const validarUsuarioRegistro = (datos: any): string | null =>
{
    if (!datos)
    {
        return "Se esperan parámetros de entrada";
    }

    const {username, email, password} = datos;
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
        return "Error: Email mal formado";
    }


    return null;
};
const validarEmail = (email: string): boolean =>
{
    const regex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
    return regex.test(email);
};