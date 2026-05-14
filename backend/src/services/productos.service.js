const prisma = require('../config/prisma');



/*
|--------------------------------------------------------------------------
| LISTAR PRODUCTOS
|--------------------------------------------------------------------------
*/

const listarProductos = async () => {

    const productos =
        await prisma.$queryRawUnsafe(`

            CALL sp_listar_productos();

        `);

    return productos;

};



/*
|--------------------------------------------------------------------------
| OBTENER PRODUCTO
|--------------------------------------------------------------------------
*/

const obtenerProducto = async (

    id

) => {

    const producto =
        await prisma.$queryRawUnsafe(`

            CALL sp_obtener_producto_por_id(?);

        `,

        id

    );

    return producto;

};



/*
|--------------------------------------------------------------------------
| CREAR PRODUCTO
|--------------------------------------------------------------------------
*/

const crearProducto = async (

    data

) => {

    await prisma.$executeRawUnsafe(`

        CALL sp_crear_producto(

            ?,
            ?,
            ?,
            ?,
            ?

        );

    `,

        data.nombre,
        data.descripcion,
        data.imagen_url,
        data.porcentaje_ganancia,
        data.porcentaje_perdida

    );

};



module.exports = {

    listarProductos,

    obtenerProducto,

    crearProducto

};