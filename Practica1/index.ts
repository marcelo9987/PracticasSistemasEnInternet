import axios from "axios";
//------ EJ1 ------//
console.log("------- EJERCICIO 1 -------")
const factorialRecursivo = (n: number): number =>
    {
        if (n === 1)
            {
                return 1;
            }
        return factorialRecursivo(n - 1) * n;
    }
console.log("el factorial de 7 es: " + factorialRecursivo(7));
console.log("el factorial de 3 es: " + factorialRecursivo(3));


//------ EJ2 ------//
console.log("------- EJERCICIO 2 -------")

interface Pelicula
    {
        id: number;
        title: string;
        genre_ids: number[]; // Array de IDs de géneros
    }

const agruparPeliculasPorGenero = (peliculas: Pelicula[]): { [key: number]: string[] } =>
    {
        return peliculas.reduce(
            (acc, pelicula) =>
            {
                pelicula.genre_ids.forEach(genreId =>
                {
                    if (!acc[genreId])
                        {
                            acc[genreId] = [pelicula.title];
                        } else
                        {
                            acc[genreId].push(pelicula.title);
                        }
                })

                return acc;
            },
            {} as { [key: number]: string[] }
        )
    }

// Ejemplo de uso (puedes crear un array de películas de prueba):
const peliculasDePrueba = [
    {id: 1, title: "Película A", genre_ids: [28, 35]},
    {id: 2, title: "Película B", genre_ids: [10749]},
    {id: 3, title: "Película C", genre_ids: [28]}
];

const peliculasAgrupadas = agruparPeliculasPorGenero(peliculasDePrueba);
console.log(peliculasAgrupadas); // Debería imprimir un objeto con los géneros como claves y arrays de títulos como valores


//------ EJ3 ------//
/*
 * Escribe una función asíncrona llamada obtenerTitulosDePosts que realice las siguientes acciones:
 *
 *     Utiliza fetch para obtener los datos de la siguiente URL: https://jsonplaceholder.typicode.com/posts.
 *     Maneja posibles errores durante la petición utilizando bloques try...catch.
 *     Extrae el título (title) de cada post en el array resultante.
 *     Devuelve un array con los títulos extraídos.
 */
console.log("------- EJERCICIO 3 -------")

async function obtenerTitulosDePosts(): Promise<string[]>
    {
        try
            {
                const datos = (await axios.get("https://jsonplaceholder.typicode.com/posts")).data;
                const titulos = datos.map(async (elem: { title: string[] }) =>
                    {
                        return elem.title;
                    }
                )
                return Promise.all(titulos);
            } catch (err)
            {
                console.log("Error detectado: " + err)
            }
        return [];
    }

// Ejemplo de uso:
obtenerTitulosDePosts()
    .then(titulos =>
    {
        console.log(`Títulos de los posts: ${titulos}`);
    })
    .catch(error =>
    {
        console.error(`Error al obtener los títulos: ${error}`);
    });

// Ejemplo con async/await (opcional, para practicar):
async function ejecutarObtenerTitulos()
    {
        try
            {
                const titulos = await obtenerTitulosDePosts();
                console.log(`Títulos de los posts (con async/await): ${titulos}`);
            } catch (error)
            {
                console.error(`Error al obtener los títulos (con async/await): ${error}`);
            }
    }

ejecutarObtenerTitulos();
