/*
|--------------------------------------------------------------------------
| MIDDLEWARE GLOBAL ERRORES
|--------------------------------------------------------------------------
*/

const errorMiddleware = (

    err,
    req,
    res,
    next

) => {

    console.error(err);



    /*
    |--------------------------------------------------------------------------
    | ERRORES MYSQL / PRISMA
    |--------------------------------------------------------------------------
    */

    if (

        err.message

    ) {

        return res.status(400).json({

            success: false,

            message: err.message

        });

    }



    /*
    |--------------------------------------------------------------------------
    | ERROR GENERAL
    |--------------------------------------------------------------------------
    */

    return res.status(500).json({

        success: false,

        message:

            'Error interno del servidor'

    });

};



module.exports = errorMiddleware;