const express = require('express');

const router = express.Router();

const fs = require('fs');

const path = require('path');

const { exec } = require('child_process');

const authMiddleware = require('../middlewares/auth.middleware');

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
| CREAR BACKUP MANUAL
|--------------------------------------------------------------------------
| POST /api/system/backup
|--------------------------------------------------------------------------
|
| DESCRIPCIÓN:
| Genera manualmente una copia de seguridad comprimida
| de toda la base de datos.
|
| AUTENTICACIÓN:
| Requiere JWT válido.
|
| HEADERS:
| Authorization: Bearer TOKEN
|
| JSON ENTRADA:
| No requiere body.
|
| JSON RESPUESTA EXITOSA:
|
| {
|   "ok": true,
|   "message": "Backup generado correctamente"
| }
|
| JSON ERROR:
|
| {
|   "ok": false,
|   "message": "Error generando backup"
| }
|
|--------------------------------------------------------------------------
*/

router.post(

    '/backup',

    authMiddleware,

    async (req, res, next) => {

        try {

            logger.info(

                'Generando backup manual...'

            );

            exec(

                'npm run backup',

                (error) => {

                    if (error) {

                        logger.error(

                            `Error backup manual: ${error.message}`

                        );

                        return res.status(500).json({

                            ok: false,

                            message:
                                'Error generando backup'

                        });

                    }

                    logger.info(

                        'Backup manual completado'

                    );

                    return res.status(200).json({

                        ok: true,

                        message:
                            'Backup generado correctamente'

                    });

                }

            );

        } catch (error) {

            next(error);

        }

    }

);

/*
|--------------------------------------------------------------------------
| LISTAR BACKUPS DISPONIBLES
|--------------------------------------------------------------------------
| GET /api/system/backups
|--------------------------------------------------------------------------
|
| DESCRIPCIÓN:
| Retorna todos los backups disponibles almacenados
| en el sistema junto con:
|
| - Nombre del archivo
| - Tamaño formateado automáticamente
| - Fecha de creación
|
| AUTENTICACIÓN:
| Requiere JWT válido.
|
| HEADERS:
| Authorization: Bearer TOKEN
|
| JSON ENTRADA:
| No requiere body.
|
| JSON RESPUESTA EXITOSA:
|
| {
|   "ok": true,
|   "total": 2,
|   "data": [
|     {
|       "name": "2026-05-24_backup.sql.gz",
|       "size": "24.81 KB",
|       "created_at": "2026-05-24T22:30:00.000Z"
|     }
|   ]
| }
|
| FORMATO TAMAÑOS:
|
| - Bytes (B)
| - Kilobytes (KB)
| - Megabytes (MB)
|
| JSON ERROR:
|
| {
|   "ok": false,
|   "message": "Error obteniendo backups"
| }
|
|--------------------------------------------------------------------------
*/

router.get(

    '/backups',

    authMiddleware,

    async (req, res, next) => {

        try {

            if (!fs.existsSync(backupDir)) {

                return res.status(200).json({

                    ok: true,

                    total: 0,

                    data: []

                });

            }

            const backups = fs

                .readdirSync(backupDir)

                .filter(

                    file => file.endsWith('.sql.gz')

                )

                .map(file => {

                    const filePath = path.join(

                        backupDir,

                        file

                    );

                    const stats = fs.statSync(filePath);

                    let size = '';

                    if (stats.size < 1024) {

                        size = `${stats.size} B`;

                    }

                    else if (

                        stats.size < 1024 * 1024

                    ) {

                        size = `${(

                            stats.size / 1024

                        ).toFixed(2)} KB`;

                    }

                    else {

                        size = `${(

                            stats.size

                            /

                            1024

                            /

                            1024

                        ).toFixed(2)} MB`;

                    }

                    return {

                        name: file,

                        size,

                        created_at: stats.birthtime

                    };

                })

                .sort(

                    (a, b) =>

                        new Date(b.created_at)

                        -

                        new Date(a.created_at)

                );

            return res.status(200).json({

                ok: true,

                total: backups.length,

                data: backups

            });

        } catch (error) {

            logger.error(

                `Error listando backups: ${error.message}`

            );

            return res.status(500).json({

                ok: false,

                message:
                    'Error obteniendo backups'

            });

        }

    }

);

/*
|--------------------------------------------------------------------------
| RESTAURAR BACKUP
|--------------------------------------------------------------------------
| POST /api/system/restore
|--------------------------------------------------------------------------
|
| DESCRIPCIÓN:
| Restaura completamente la base de datos utilizando
| un backup previamente generado.
|
| AUTENTICACIÓN:
| Requiere JWT válido.
|
| HEADERS:
| Authorization: Bearer TOKEN
|
| JSON ENTRADA:
|
| {
|   "file_name": "2026-05-14_backup.sql.gz"
| }
|
| JSON RESPUESTA EXITOSA:
|
| {
|   "ok": true,
|   "message": "Backup restaurado correctamente"
| }
|
| JSON ERROR VALIDACIÓN:
|
| {
|   "ok": false,
|   "message": "Debes enviar file_name"
| }
|
| JSON ERROR SISTEMA:
|
| {
|   "ok": false,
|   "message": "Error restaurando backup"
| }
|
|--------------------------------------------------------------------------
*/

router.post(

    '/restore',

    authMiddleware,

    async (req, res, next) => {

        try {

            const {

                file_name

            } = req.body;

            if (!file_name) {

                return res.status(400).json({

                    ok: false,

                    message:
                        'Debes enviar file_name'

                });

            }

            logger.info(

                `Restaurando backup: ${file_name}`

            );

            exec(

                `npm run restore ${file_name}`,

                (error) => {

                    if (error) {

                        logger.error(

                            `Error restore: ${error.message}`

                        );

                        return res.status(500).json({

                            ok: false,

                            message:
                                'Error restaurando backup'

                        });

                    }

                    logger.info(

                        `Backup restaurado: ${file_name}`

                    );

                    return res.status(200).json({

                        ok: true,

                        message:
                            'Backup restaurado correctamente'

                    });

                }

            );

        } catch (error) {

            next(error);

        }

    }

);

module.exports = router;