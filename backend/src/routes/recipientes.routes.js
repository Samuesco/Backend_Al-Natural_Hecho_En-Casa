const express = require('express');

const router = express.Router();

const {
    callProcedure
} = require('../utils/db.util');

/*
|--------------------------------------------------------------------------
| BUSCAR RECIPIENTES POR TAMAÑO
|--------------------------------------------------------------------------
| GET /api/recipientes/tamano/:tamano_recipiente
|--------------------------------------------------------------------------
|
| Ejemplo:
|
| GET /api/recipientes/tamano/50
|
|--------------------------------------------------------------------------
*/

router.get(

    '/tamano/:tamano_recipiente',

    async (req, res, next) => {

        try {

            const {

                tamano_recipiente

            } = req.params;

            const recipientes =
                await callProcedure(

                    'sp_buscar_recipientes_por_tamano',

                    [tamano_recipiente]

                );

            return res.status(200).json({

                ok: true,

                data: recipientes

            });

        } catch (error) {

            next(error);

        }

    }

);

/*
|--------------------------------------------------------------------------
| OBTENER RECIPIENTE POR ID
|--------------------------------------------------------------------------
| GET /api/recipientes/:id
|--------------------------------------------------------------------------
|
| Ejemplo:
|
| GET /api/recipientes/uuid
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "data": {
|      "id": "uuid",
|      "nombre": "Frasco vidrio",
|      "valor": 2500,
|      "tamano_recipiente": 120
|   }
| }
|
|--------------------------------------------------------------------------
|
| Response 404:
|
| {
|   "ok": false,
|   "message": "Recipiente no encontrado"
| }
|
|--------------------------------------------------------------------------
*/

router.get('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        const recipiente =
            await callProcedure(

                'sp_obtener_recipiente_por_id',

                [id]

            );

        if (!recipiente?.length) {

            return res.status(404).json({

                ok: false,

                message:
                    'Recipiente no encontrado'

            });

        }

        return res.status(200).json({

            ok: true,

            data: recipiente[0]

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| CREAR RECIPIENTE
|--------------------------------------------------------------------------
| POST /api/recipientes
|--------------------------------------------------------------------------
|
| Body JSON:
|
| {
|   "nombre": "Frasco vidrio",
|   "valor": 2500,
|   "tamano_recipiente": 120
| }
|
|--------------------------------------------------------------------------
|
| Response 201:
|
| {
|   "ok": true,
|   "message": "Recipiente creado correctamente",
|   "data": {
|      "id": "uuid"
|   }
| }
|
|--------------------------------------------------------------------------
*/

router.post('/', async (req, res, next) => {

    try {

        const {

            nombre,
            valor,
            tamano_recipiente

        } = req.body;

        const recipiente =
            await callProcedure(

                'sp_crear_recipiente',

                [

                    nombre,
                    valor,
                    tamano_recipiente

                ]

            );

        return res.status(201).json({

            ok: true,

            message:
                'Recipiente creado correctamente',

            data: recipiente[0]

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| ACTUALIZAR RECIPIENTE
|--------------------------------------------------------------------------
| PUT /api/recipientes/:id
|--------------------------------------------------------------------------
|
| Body JSON:
|
| {
|   "nombre": "Frasco vidrio premium",
|   "valor": 3000,
|   "tamano_recipiente": 150
| }
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "message": "Recipiente actualizado correctamente"
| }
|
|--------------------------------------------------------------------------
*/

router.put('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        const {

            nombre,
            valor,
            tamano_recipiente

        } = req.body;

        await callProcedure(

            'sp_actualizar_recipiente',

            [

                id,
                nombre,
                valor,
                tamano_recipiente

            ]

        );

        return res.status(200).json({

            ok: true,

            message:
                'Recipiente actualizado correctamente'

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| ELIMINAR RECIPIENTE
|--------------------------------------------------------------------------
| DELETE /api/recipientes/:id
|--------------------------------------------------------------------------
|
| Ejemplo:
|
| DELETE /api/recipientes/uuid
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "message": "Recipiente eliminado correctamente"
| }
|
|--------------------------------------------------------------------------
*/

router.delete('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        await callProcedure(

            'sp_eliminar_recipiente',

            [id]

        );

        return res.status(200).json({

            ok: true,

            message:
                'Recipiente eliminado correctamente'

        });

    } catch (error) {

        next(error);

    }

});
/*
|--------------------------------------------------------------------------
| LISTAR / BUSCAR RECIPIENTES
|--------------------------------------------------------------------------
| GET /api/recipientes
|--------------------------------------------------------------------------
|
| Permite:
| - listar todos los recipientes
| - buscar recipientes por nombre
|
| Query Params:
|
| ?search=frasco
|
|--------------------------------------------------------------------------
|
| Ejemplos:
|
| GET /api/recipientes
|
| GET /api/recipientes?search=500
|
| GET /api/recipientes?search=frasco
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "data": [
|      {
|         "id": "uuid",
|         "nombre": "Frasco vidrio 500ml",
|         "valor": 2500,
|         "tamano_recipiente": 500,
|         "activo": true
|      }
|   ]
| }
|
|--------------------------------------------------------------------------
*/

router.get('/', async (req, res, next) => {

    try {

        /*
        |--------------------------------------------------------------------------
        | QUERY PARAMS
        |--------------------------------------------------------------------------
        */

        const {

            search = null

        } = req.query;

        /*
        |--------------------------------------------------------------------------
        | PROCEDURE
        |--------------------------------------------------------------------------
        */

        const recipientes =
            await callProcedure(

                'sp_buscar_recipientes',

                [search]

            );

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({

            ok: true,

            data: recipientes

        });

    } catch (error) {

        next(error);

    }

});
module.exports = router;