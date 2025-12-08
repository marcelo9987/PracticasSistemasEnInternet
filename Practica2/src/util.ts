import {Book} from "./types";




export const validar_libro = (datos: any): string | null =>
{
    if (!datos)
    {
        return "Se esperan parámetros de entrada";
    }

    const {title, author, pages} = datos;
    if (!title || !author || !pages)
    {
        return "Faltan campos obligatorios";
    }

    if (typeof title !== "string" || typeof author !== "string" || typeof pages !== "number" )
    {
        return "ERROR!: Formato esperado: {title: string, author: string, pages: number}";
    }

    return null;
};

export const extraer_libro = async (datos: any, initial: Book | undefined ): Promise<Book> =>
{


    const title: string = datos.title || initial?.title;

    const author: string = datos.author || initial?.author;

    const pages: number = datos.pages || initial?.pages;

    const createdAt: Date = initial?.createdAt || new Date();

    const updatedAt: Date = new Date();


    return {
        title: title,
        author: author,
        pages: pages
        ,createdAt: createdAt,
        updatedAt: updatedAt
    };

};