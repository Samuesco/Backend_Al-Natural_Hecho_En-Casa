const prisma = require('../config/prisma');


/*
|--------------------------------------------------------------------------
| LISTAR CATEGORÍAS
|--------------------------------------------------------------------------
*/

const listarCategorias = async () => {

    const categorias =
        await prisma.$queryRawUnsafe(`

            CALL sp_listar_categorias();

        `);

    return categorias;

};



/*
|--------------------------------------------------------------------------
| BUSCAR CATEGORÍAS
|--------------------------------------------------------------------------
*/

const buscarCategorias = async (search) => {

    const categorias =
        await prisma.$queryRawUnsafe(`

            CALL sp_buscar_categorias(?);

        `, search);

    return categorias;

};



/*
|--------------------------------------------------------------------------
| CREAR CATEGORÍA
|--------------------------------------------------------------------------
*/

const crearCategoria = async (data) => {

    await prisma.$executeRawUnsafe(`

        CALL sp_crear_categoria(?);

    `,

        data.nombre

    );

};



/*
|--------------------------------------------------------------------------
| ACTUALIZAR CATEGORÍA
|--------------------------------------------------------------------------
*/

const actualizarCategoria = async (

    id,
    data

) => {

    await prisma.$executeRawUnsafe(`

        CALL sp_actualizar_categoria(

            ?,
            ?,
            ?

        );

    `,

        id,
        data.nombre,
        data.activo

    );

};



/*
|--------------------------------------------------------------------------
| ELIMINAR CATEGORÍA
|--------------------------------------------------------------------------
*/

const eliminarCategoria = async (id) => {

    await prisma.$executeRawUnsafe(`

        CALL sp_eliminar_categoria(?);

    `,

        id

    );

};



module.exports = {

    listarCategorias,

    buscarCategorias,

    crearCategoria,

    actualizarCategoria,

    eliminarCategoria

};