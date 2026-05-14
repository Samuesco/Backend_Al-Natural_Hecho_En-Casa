const fs = require('fs');

const path = require('path');

const bcrypt = require('bcrypt');

const { PrismaClient } =
    require('@prisma/client');

const mysql =
    require('../src/config/mysql');



const prisma = new PrismaClient();



/*
|--------------------------------------------------------------------------
| CREAR CATEGORÍAS INICIALES
|--------------------------------------------------------------------------
*/

async function crearCategoriasIniciales() {

    const categorias = [

        'frutas',

        'verduras',

        'condimentos',

        'aceites',

        'proteinas',

        'granos'

    ];

    /*
    |--------------------------------------------------------------------------
    | RECORRER CATEGORÍAS
    |--------------------------------------------------------------------------
    */

    for (const nombre of categorias) {

        /*
        |--------------------------------------------------------------------------
        | VALIDAR SI YA EXISTE
        |--------------------------------------------------------------------------
        */

        const existente =
            await prisma.categoriasIngrediente.findFirst({

                where: {

                    nombre

                }

            });

        if (existente) {

            console.log(
                `Categoría ${nombre} ya existe`
            );

            continue;

        }

        /*
        |--------------------------------------------------------------------------
        | CREAR CATEGORÍA
        |--------------------------------------------------------------------------
        */

        await prisma.categoriasIngrediente.create({

            data: {

                nombre,

                activo: true

            }

        });

        console.log(
            `Categoría ${nombre} creada`
        );

    }

}

/*
|--------------------------------------------------------------------------
| ORDEN EJECUCIÓN SQL
|--------------------------------------------------------------------------
|
| IMPORTANTE:
| Existen dependencias entre archivos.
|
|--------------------------------------------------------------------------
*/

const sqlFiles = [

    'functions.sql',

    'usuarios.sql',

    'categorias.sql',

    'ingredientes.sql',

    'recipientes.sql',

    'productos_finales.sql',

    'producto_receta.sql',

    'producto_gasto.sql',

    'producto_recipiente.sql',

    'validaciones_costeo.sql',

    'calculos_costeo.sql',
    
    'producto_completo.sql'

];
 


/*
|--------------------------------------------------------------------------
| EJECUTAR ARCHIVOS SQL
|--------------------------------------------------------------------------
*/

async function ejecutarSqlFiles() {

    for (const file of sqlFiles) {

        const filePath = path.join(

            __dirname,

            'sql',

            file

        );



        console.log(
            `Ejecutando ${file}...`
        );



        /*
        |--------------------------------------------------------------------------
        | LEER SQL
        |--------------------------------------------------------------------------
        */

        const sql =
            fs.readFileSync(

                filePath,

                'utf8'

            );



        /*
        |--------------------------------------------------------------------------
        | LIMPIAR DELIMITERS
        |--------------------------------------------------------------------------
        |
        | mysql2 NO interpreta:
        |
        | DELIMITER $$
        | DELIMITER ;
        |
        |--------------------------------------------------------------------------
        */

        const cleanSql = sql

            .replaceAll('DELIMITER $$', '')

            .replaceAll('DELIMITER ;', '');



        /*
        |--------------------------------------------------------------------------
        | DIVIDIR QUERIES
        |--------------------------------------------------------------------------
        |
        | Cada function/procedure termina en:
        |
        | END $$
        |
        |--------------------------------------------------------------------------
        */

        const queries = cleanSql

            .split('$$')

            .map(query => query.trim())

            .filter(query => query);



        /*
        |--------------------------------------------------------------------------
        | EJECUTAR QUERIES
        |--------------------------------------------------------------------------
        */

        for (const query of queries) {

            await mysql.query(query);

        }



        console.log(
            `${file} ejecutado correctamente`
        );

    }

}



/*
|--------------------------------------------------------------------------
| CREAR ADMINISTRADOR
|--------------------------------------------------------------------------
*/

async function crearAdministrador() {

    const existingAdmin =
        await prisma.usuarios.findFirst({

            where: {

                OR: [

                    {

                        correo:
                            process.env.ADMIN_EMAIL

                    },

                    {

                        identificacion:
                            process.env.ADMIN_IDENTIFICATION

                    }

                ]

            }

        });



    /*
    |--------------------------------------------------------------------------
    | VALIDAR SI YA EXISTE
    |--------------------------------------------------------------------------
    */

    if (existingAdmin) {

        console.log(
            'Administrador ya existe'
        );

        return;

    }



    /*
    |--------------------------------------------------------------------------
    | HASH PASSWORD
    |--------------------------------------------------------------------------
    */

    const password =
        await bcrypt.hash(

            process.env.ADMIN_PASSWORD,

            10

        );



    /*
    |--------------------------------------------------------------------------
    | CREAR ADMIN
    |--------------------------------------------------------------------------
    */

    await prisma.usuarios.create({

        data: {

            nombre:
                process.env.ADMIN_NAME,

            apellidos:
                process.env.ADMIN_LASTNAME,

            identificacion:
                process.env.ADMIN_IDENTIFICATION,

            correo:
                process.env.ADMIN_EMAIL,

            password

        }

    });



    console.log(
        'Administrador creado'
    );

}



/*
|--------------------------------------------------------------------------
| MAIN
|--------------------------------------------------------------------------
*/

async function main() {

    console.log(
        'Iniciando seed...'
    );



    /*
    |--------------------------------------------------------------------------
    | EJECUTAR SQL
    |--------------------------------------------------------------------------
    */

    await ejecutarSqlFiles();


    await crearCategoriasIniciales();
    /*
    |--------------------------------------------------------------------------
    | CREAR ADMIN
    |--------------------------------------------------------------------------
    */

    await crearAdministrador();



    console.log(
        'Seed completado correctamente'
    );

}



/*
|--------------------------------------------------------------------------
| EXECUTION
|--------------------------------------------------------------------------
*/

main()

    .catch((error) => {

        console.error(error);

        process.exit(1);

    })

    .finally(async () => {

        /*
        |--------------------------------------------------------------------------
        | CERRAR CONEXIONES
        |--------------------------------------------------------------------------
        */

        await prisma.$disconnect();

        await mysql.end();

    });