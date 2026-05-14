const fs = require('fs');

const path = require('path');

const { exec } = require('child_process');

require('dotenv').config();

/*
|--------------------------------------------------------------------------
| OBTENER NOMBRE BACKUP
|--------------------------------------------------------------------------
*/

const fileName = process.argv[2];

if (!fileName) {

    console.log(

        'Debes enviar el nombre del backup'

    );

    process.exit(1);

}

/*
|--------------------------------------------------------------------------
| VALIDAR ARCHIVO
|--------------------------------------------------------------------------
*/

const backupPath = path.join(

    __dirname,

    '..',

    'backups',

    fileName

);

if (!fs.existsSync(backupPath)) {

    console.log(

        'El archivo backup no existe'

    );

    process.exit(1);

}

/*
|--------------------------------------------------------------------------
| RESTORE
|--------------------------------------------------------------------------
*/

const command = `sh -c "gunzip < ${backupPath} | mysql \
-h ${process.env.MYSQL_HOST} \
-P ${process.env.MYSQL_PORT} \
-u ${process.env.MYSQL_USER} \
-p${process.env.MYSQL_PASSWORD} \
${process.env.MYSQL_DATABASE}"`;

console.log(
    'Restaurando backup...'
);

exec(command, (error) => {

    if (error) {

        console.error(

            'Error restaurando backup:',

            error

        );

        process.exit(1);

    }

    console.log(
        'Backup restaurado correctamente'
    );

});