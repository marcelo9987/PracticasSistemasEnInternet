
/**
 * Valida los datos de un producto
 * @param datos Datos de entrada
 * @returns {string | null} Mensaje de error o null si es válido
 */
export const validarProducto = (datos: any): string | null =>
{
    if (!datos)
    {
        return "Se esperan parámetros de entrada";
    }

    const {
        name,
        description,
        price,
        stock
    } = datos;
    if (!name || null === price || null === stock)
    {
        return "Faltan campos obligatorios";
    }
    if (typeof name !== "string" || (description && typeof description !== "string") || typeof price !== "number" || typeof stock !== "number")
    {
        return "ERROR!: Formato esperado: {name: string, descripcion: string, price: number, stock: number}";
    }
    if (price <= 0)
    {
        return "Error: price debe ser mayor a cero.";
    }
    if (stock < 0)
    {
        return "Error: stock debe ser mayor o igual a cero.";
    }

    return null;
};

/**
 * Valida una dupla producto-cantidad
 * @param datos Datos de entrada
 * @returns {String | null} Mensaje de error o null si es válido
 */
export const validarDuplaProductoCantidad = (datos: any): String | null =>
{
    if (!datos)
    {
        return "Se esperan parámetros de entrada";
    }

    const {
        productId,
        quantity
    } = datos;
    if (!productId || null === quantity)
    {
        return "Faltan campos obligatorios";
    }

    if (typeof productId !== "string" || typeof quantity !== "number")
    {
        return "ERROR!: Formato esperado: {productId: string, quantity: number}";
    }

    if (quantity <= 0)
    {
        return "Error: quantity debe ser mayor a cero.";
    }


    return null;
};
