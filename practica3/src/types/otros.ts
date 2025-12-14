/**
 * JwtPayload
 * @param {string} id - ID del usuario
 * @param {string} email - Email del usuario
 */
export type JwtPayload = {
    id: string;
    email: string;
}
