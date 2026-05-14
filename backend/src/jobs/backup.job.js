const cron = require('node-cron');

const { exec } = require('child_process');

const fs = require('fs');

const path = require('path');

const logger = require('../config/logger');

/*
|--------------------------------------------------------------------------
| DIRECTORIO BACKUPS
|--------------------------------------------------------------------------
*/

const backupDir = path.join(

    __dirname,

    '..',

    '..',

    'backups'

);

/*
|--------------------------------------------------------------------------
| ELIMINAR BACKUPS ANTIGUOS
|--------------------------------------------------------------------------
*/

const limpiarBackupsAntiguos = () => {

    const files = fs

        .readdirSync(backupDir)

        .filter(

            file => file.endsWith('.sql.gz')

        )

        .map(file => ({

            name: file,

            time: fs.statSync(

                path.join(backupDir, file)

            ).mtime.getTime()

        }))

        .sort(

            (a, b) => b.time - a.time

        );

    /*
    |--------------------------------------------------------------------------
    | MANTENER ÚLTIMOS 12
    |--------------------------------------------------------------------------
    */

    const filesToDelete = files.slice(12);

    filesToDelete.forEach(file => {

        const filePath = path.join(

            backupDir,

            file.name

        );

        fs.unlinkSync(filePath);

        logger.info(

            `Backup eliminado: ${file.name}`

        );

    });

};

/*
|--------------------------------------------------------------------------
| BACKUP AUTOMÁTICO MENSUAL
|--------------------------------------------------------------------------
|
| Día 1 de cada mes a las 2:00 AM
|
|--------------------------------------------------------------------------
*/

cron.schedule(

    '0 2 1 * *',

    () => {

        logger.info(

            'Ejecutando backup automático mensual...'

        );

        exec(

            'npm run backup',

            (error) => {

                if (error) {

                    logger.error(

                        `Error backup automático: ${error.message}`

                    );

                    return;

                }

                logger.info(

                    'Backup automático completado'

                );

                /*
                |--------------------------------------------------------------------------
                | LIMPIAR BACKUPS
                |--------------------------------------------------------------------------
                */

                limpiarBackupsAntiguos();

            }

        );

    }

);

logger.info(

    'Job backup automático mensual iniciado'

);