const express = require('express');

const router = express.Router();

const {
    callProcedure
} = require('../utils/db.util');

/*
|--------------------------------------------------------------------------
| LISTAR / BUSCAR CATEGORÍAS
|--------------------------------------------------------------------------
| GET /api/categorias
|--------------------------------------------------------------------------
|
| Retorna todas las categorías activas.
|
| También permite búsqueda usando query params.
|
|--------------------------------------------------------------------------
|
| Query Params:
|
| ?search=frutas
|
|--------------------------------------------------------------------------
|
| Ejemplos:
|
| GET /api/categorias
|
| GET /api/categorias?search=frutas
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "data": [
|     {
|       "id": 1,
|       "nombre": "Frutas",
|       "cantidad_ingredientes": 10
|     }
|   ]
| }
|
|--------------------------------------------------------------------------
*/

router.get('/', async (req, res, next) => {

    try {

        const { search } = req.query;

        const procedure = search
            ? 'sp_buscar_categorias'
            : 'sp_listar_categorias';

        const params = search
            ? [search]
            : [];

        const categorias =
            await callProcedure(

                procedure,

                params

            );

        return res.status(200).json({

            ok: true,

            data: categorias

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| OBTENER CATEGORÍA POR ID
|--------------------------------------------------------------------------
| GET /api/categorias/:id
|--------------------------------------------------------------------------
|
| Ejemplo:
|
| GET /api/categorias/1
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "data": {
|      "id": 1,
|      "nombre": "Frutas"
|   }
| }
|
|--------------------------------------------------------------------------
|
| Response 404:
|
| {
|   "ok": false,
|   "message": "Categoría no encontrada"
| }
|
|--------------------------------------------------------------------------
*/

router.get('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        const categoria =
            await callProcedure(

                'sp_obtener_categoria_por_id',

                [id]

            );

        if (!categoria?.length) {

            return res.status(404).json({

                ok: false,

                message:
                    'Categoría no encontrada'

            });

        }

        return res.status(200).json({

            ok: true,

            data: categoria[0]

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| OBTENER INGREDIENTES POR CATEGORÍA
|--------------------------------------------------------------------------
| GET /api/categorias/:id/ingredientes
|--------------------------------------------------------------------------
|
| Ejemplo:
|
| GET /api/categorias/1/ingredientes
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
|       "nombre": "Fresa"
|     }
|   ]
| }
|
|--------------------------------------------------------------------------
*/

router.get('/:id/ingredientes', async (req, res, next) => {

    try {

        const { id } = req.params;

        const ingredientes =
            await callProcedure(

                'sp_obtener_ingredientes_por_categoria',

                [id]

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
| CREAR CATEGORÍA
|--------------------------------------------------------------------------
| POST /api/categorias
|--------------------------------------------------------------------------
|
| Body JSON:
|
| {
|   "nombre": "Frutas"
| }
|
|--------------------------------------------------------------------------
|
| Response 201:
|
| {
|   "ok": true,
|   "message": "Categoría creada correctamente",
|   "data": {
|      "id": 1
|   }
| }
|
|--------------------------------------------------------------------------
*/

router.post('/', async (req, res, next) => {

    try {

        const { nombre } = req.body;

        const categoria =
            await callProcedure(

                'sp_crear_categoria',

                [nombre]

            );

        return res.status(201).json({

            ok: true,

            message:
                'Categoría creada correctamente',

            data: categoria[0]

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| ACTUALIZAR CATEGORÍA
|--------------------------------------------------------------------------
| PUT /api/categorias/:id
|--------------------------------------------------------------------------
|
| Body JSON:
|
| {
|   "nombre": "Frutas Premium"
| }
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "message": "Categoría actualizada correctamente"
| }
|
|--------------------------------------------------------------------------
*/

router.put('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        const {

            nombre

        } = req.body;

        await callProcedure(

            'sp_actualizar_categoria',

            [

                id,
                nombre

            ]

        );

        return res.status(200).json({

            ok: true,

            message:
                'Categoría actualizada correctamente'

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| ELIMINAR CATEGORÍA
|--------------------------------------------------------------------------
| DELETE /api/categorias/:id
|--------------------------------------------------------------------------
|
| Ejemplo:
|
| DELETE /api/categorias/1
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "message": "Categoría eliminada correctamente"
| }
|
|--------------------------------------------------------------------------
*/

router.delete('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        await callProcedure(

            'sp_eliminar_categoria',

            [id]

        );

        return res.status(200).json({

            ok: true,

            message:
                'Categoría eliminada correctamente'

        });

    } catch (error) {

        next(error);

    }

});

module.exports = router;