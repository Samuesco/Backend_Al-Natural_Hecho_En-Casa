const fs = require('fs');

const path = require('path');

const { exec } = require('child_process');

require('dotenv').config();

/*
|--------------------------------------------------------------------------
| CREAR DIRECTORIO BACKUPS
|--------------------------------------------------------------------------
*/

const backupDir = path.join(

    __dirname,

    '..',

    'backups'

);

if (!fs.existsSync(backupDir)) {

    fs.mkdirSync(backupDir);

}

/*
|--------------------------------------------------------------------------
| GENERAR NOMBRE ARCHIVO
|--------------------------------------------------------------------------
*/

const date = new Date()
    .toISOString()
    .split('T')[0];

const backupFile = path.join(

    backupDir,

    `${date}_backup.sql.gz`

);

/*
|--------------------------------------------------------------------------
| COMANDO MYSQLDUMP
|--------------------------------------------------------------------------
*/

const command = `sh -c "mysqldump \
-h ${process.env.MYSQL_HOST} \
-P ${process.env.MYSQL_PORT} \
-u ${process.env.MYSQL_USER} \
-p${process.env.MYSQL_PASSWORD} \
${process.env.MYSQL_DATABASE} \
| gzip > ${backupFile}"`;

console.log(
    'Generando backup comprimido...'
);

exec(command, (error) => {

    if (error) {

        console.error(

            'Error generando backup:',

            error

        );

        process.exit(1);

    }

    console.log(

        `Backup generado correctamente: ${backupFile}`

    );

});