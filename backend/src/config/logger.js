const winston = require('winston');

const path = require('path');

/*
|--------------------------------------------------------------------------
| LOGGER
|--------------------------------------------------------------------------
*/

const logger = winston.createLogger({

    level: 'info',

    format: winston.format.combine(

        winston.format.timestamp(),

        winston.format.printf(

            ({ timestamp, level, message }) => {

                return `[${timestamp}] ${level.toUpperCase()}: ${message}`;

            }

        )

    ),

    transports: [

        /*
        |--------------------------------------------------------------------------
        | ARCHIVO ERRORES
        |--------------------------------------------------------------------------
        */

        new winston.transports.File({

            filename: path.join(

                __dirname,

                '..',

                '..',

                'logs',

                'error.log'

            ),

            level: 'error'

        }),

        /*
        |--------------------------------------------------------------------------
        | ARCHIVO GENERAL
        |--------------------------------------------------------------------------
        */

        new winston.transports.File({

            filename: path.join(

                __dirname,

                '..',

                '..',

                'logs',

                'combined.log'

            )

        }),

        /*
        |--------------------------------------------------------------------------
        | CONSOLA
        |--------------------------------------------------------------------------
        */

        new winston.transports.Console()

    ]

});

module.exports = logger;