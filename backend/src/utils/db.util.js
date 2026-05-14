const mysql = require('../config/mysql');



/*
|--------------------------------------------------------------------------
| CALL PROCEDURE
|--------------------------------------------------------------------------
|
| Ejecuta procedures SQL:
|
| CALL sp_xxxxx(...)
|
|--------------------------------------------------------------------------
*/

async function callProcedure(

    procedure,

    params = []

) {

    const placeholders = params

        .map(() => '?')

        .join(',');



    const query = `

        CALL ${procedure}(${placeholders})

    `;



    const [result] =

        await mysql.query(

            query,

            params

        );



    /*
    |--------------------------------------------------------------------------
    | MYSQL2
    |--------------------------------------------------------------------------
    |
    | result[0]
    | contiene rows reales
    |
    |--------------------------------------------------------------------------
    */

    return result[0];

}



module.exports = {

    callProcedure

};

