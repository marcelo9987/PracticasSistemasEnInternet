/**
 * JwtPayload
 * @param id - ID del usuario
 * @param email - Email del usuario
 */
export type JwtPayload = {
    id: string;
    email: string;
}