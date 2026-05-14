const express = require('express');

const router = express.Router();

const {
    callProcedure
} = require('../utils/db.util');

/*
|--------------------------------------------------------------------------
| LISTAR / BUSCAR INGREDIENTES
|--------------------------------------------------------------------------
| GET /api/ingredientes
|--------------------------------------------------------------------------
|
| Retorna todos los ingredientes activos.
|
| Permite:
| - búsqueda
| - filtrado por categoría
|
|--------------------------------------------------------------------------
|
| Query Params:
|
| ?search=aceite
|
| ?categoria_id=1
|
| ?search=aceite&categoria_id=1
|
|--------------------------------------------------------------------------
|
| Ejemplos:
|
| GET /api/ingredientes
|
| GET /api/ingredientes?search=aceite
|
| GET /api/ingredientes?categoria_id=1
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "data": [
|     {
|       "id": "uuid",
|       "nombre": "Aceite de coco",
|       "descripcion": "Aceite natural",
|       "categoria_id": 1,
|       "categoria_nombre": "Aceites"
|     }
|   ]
| }
|
|--------------------------------------------------------------------------
*/

router.get('/', async (req, res, next) => {

    try {

        const {

            search,
            categoria_id

        } = req.query;

        const ingredientes =
            await callProcedure(

                'sp_buscar_ingredientes',

                [

                    search || null,

                    categoria_id || null

                ]

            );

        return res.status(200).json({

            ok: true,

            data: ingredientes

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| OBTENER INGREDIENTE POR ID
|--------------------------------------------------------------------------
| GET /api/ingredientes/:id
|--------------------------------------------------------------------------
|
| Ejemplo:
|
| GET /api/ingredientes/uuid
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "data": {
|      "id": "uuid",
|      "nombre": "Aceite de coco",
|      "descripcion": "Aceite natural",
|      "categoria_id": 1,
|      "categoria_nombre": "Aceites"
|   }
| }
|
|--------------------------------------------------------------------------
|
| Response 404:
|
| {
|   "ok": false,
|   "message": "Ingrediente no encontrado"
| }
|
|--------------------------------------------------------------------------
*/

router.get('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        const ingrediente =
            await callProcedure(

                'sp_obtener_ingrediente_por_id',

                [id]

            );

        if (!ingrediente?.length) {

            return res.status(404).json({

                ok: false,

                message:
                    'Ingrediente no encontrado'

            });

        }

        return res.status(200).json({

            ok: true,

            data: ingrediente[0]

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| CREAR INGREDIENTE
|--------------------------------------------------------------------------
| POST /api/ingredientes
|--------------------------------------------------------------------------
|
| Body JSON:
|
| {
|   "categoria_id": 1,
|   "nombre": "Aceite de coco",
|   "descripcion": "Aceite natural premium"
| }
|
|--------------------------------------------------------------------------
|
| Response 201:
|
| {
|   "ok": true,
|   "message": "Ingrediente creado correctamente",
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

            categoria_id,
            nombre,
            descripcion

        } = req.body;

        const ingrediente =
            await callProcedure(

                'sp_crear_ingrediente',

                [

                    categoria_id,
                    nombre,
                    descripcion

                ]

            );

        return res.status(201).json({

            ok: true,

            message:
                'Ingrediente creado correctamente',

            data: ingrediente[0]

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| ACTUALIZAR INGREDIENTE
|--------------------------------------------------------------------------
| PUT /api/ingredientes/:id
|--------------------------------------------------------------------------
|
| Body JSON:
|
| {
|   "categoria_id": 1,
|   "nombre": "Aceite de coco premium",
|   "descripcion": "Nueva descripción"
| }
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "message": "Ingrediente actualizado correctamente"
| }
|
|--------------------------------------------------------------------------
*/

router.put('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        const {

            categoria_id,
            nombre,
            descripcion

        } = req.body;

        await callProcedure(

            'sp_actualizar_ingrediente',

            [

                id,
                categoria_id,
                nombre,
                descripcion

            ]

        );

        return res.status(200).json({

            ok: true,

            message:
                'Ingrediente actualizado correctamente'

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| ELIMINAR INGREDIENTE
|--------------------------------------------------------------------------
| DELETE /api/ingredientes/:id
|--------------------------------------------------------------------------
|
| Ejemplo:
|
| DELETE /api/ingredientes/uuid
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "message": "Ingrediente eliminado correctamente"
| }
|
|--------------------------------------------------------------------------
*/

router.delete('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        await callProcedure(

            'sp_eliminar_ingrediente',

            [id]

        );

        return res.status(200).json({

            ok: true,

            message:
                'Ingrediente eliminado correctamente'

        });

    } catch (error) {

        next(error);

    }

});

module.exports = router;