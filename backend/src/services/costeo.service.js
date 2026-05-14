const prisma = require('../config/prisma');



/*
|--------------------------------------------------------------------------
| CALCULAR COSTEO PRODUCTO
|--------------------------------------------------------------------------
*/

const calcularCosteoProducto = async (

    productoId

) => {

    const resultado =
        await prisma.$queryRawUnsafe(`

            SELECT fn_calcular_costo_producto(?)
            AS resultado;

        `,

        productoId

    );



    /*
    |--------------------------------------------------------------------------
    | MYSQL retorna array
    |--------------------------------------------------------------------------
    */

    return resultado[0].resultado;

};



module.exports = {

    calcularCosteoProducto

};