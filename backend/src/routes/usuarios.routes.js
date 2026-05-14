const express = require('express');

const router = express.Router();

const {
    callProcedure
} = require('../utils/db.util');

/*
|--------------------------------------------------------------------------
| LISTAR / BUSCAR USUARIOS
|--------------------------------------------------------------------------
| GET /api/usuarios
|--------------------------------------------------------------------------
|
| Retorna todos los usuarios activos.
|
| También permite búsqueda usando query params.
|
|--------------------------------------------------------------------------
|
| Query Params:
|
| ?search=juan
|
|--------------------------------------------------------------------------
|
| Ejemplos:
|
| GET /api/usuarios
|
| GET /api/usuarios?search=juan
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
|       "nombre": "Juan",
|       "apellidos": "Perez",
|       "correo": "juan@mail.com"
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
            ? 'sp_buscar_usuarios'
            : 'sp_listar_usuarios';

        const params = search
            ? [search]
            : [];

        const usuarios =
            await callProcedure(

                procedure,

                params

            );

        return res.status(200).json({

            ok: true,

            data: usuarios

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| OBTENER USUARIO POR ID
|--------------------------------------------------------------------------
| GET /api/usuarios/:id
|--------------------------------------------------------------------------
|
| Ejemplo:
|
| GET /api/usuarios/uuid
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "data": {
|      "id": "uuid",
|      "nombre": "Juan"
|   }
| }
|
|--------------------------------------------------------------------------
|
| Response 404:
|
| {
|   "ok": false,
|   "message": "Usuario no encontrado"
| }
|
|--------------------------------------------------------------------------
*/

router.get('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        const usuario =
            await callProcedure(

                'sp_obtener_usuario_por_id',

                [id]

            );

        if (!usuario?.length) {

            return res.status(404).json({

                ok: false,

                message:
                    'Usuario no encontrado'

            });

        }

        return res.status(200).json({

            ok: true,

            data: usuario[0]

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| CREAR USUARIO
|--------------------------------------------------------------------------
| POST /api/usuarios
|--------------------------------------------------------------------------
|
| Body JSON:
|
| {
|   "nombre": "Juan",
|   "apellidos": "Perez",
|   "identificacion": "123456",
|   "correo": "juan@mail.com",
|   "telefono": "3001234567",
|   "password": "123456"
| }
|
|--------------------------------------------------------------------------
|
| Response 201:
|
| {
|   "ok": true,
|   "message": "Usuario creado correctamente",
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
            apellidos,
            identificacion,
            correo,
            telefono,
            password

        } = req.body;

        const usuario =
            await callProcedure(

                'sp_crear_usuario',

                [

                    nombre,
                    apellidos,
                    identificacion,
                    correo,
                    telefono,
                    password

                ]

            );

        return res.status(201).json({

            ok: true,

            message:
                'Usuario creado correctamente',

            data: usuario[0]

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| ACTUALIZAR USUARIO
|--------------------------------------------------------------------------
| PUT /api/usuarios/:id
|--------------------------------------------------------------------------
|
| Body JSON:
|
| {
|   "nombre": "Juan",
|   "apellidos": "Perez",
|   "identificacion": "123456",
|   "correo": "juan@mail.com",
|   "telefono": "3001234567",
|   "password": "123456"
| }
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "message": "Usuario actualizado correctamente"
| }
|
|--------------------------------------------------------------------------
*/

router.put('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        const {

            nombre,
            apellidos,
            identificacion,
            correo,
            telefono,
            password

        } = req.body;

        await callProcedure(

            'sp_actualizar_usuario',

            [

                id,
                nombre,
                apellidos,
                identificacion,
                correo,
                telefono,
                password

            ]

        );

        return res.status(200).json({

            ok: true,

            message:
                'Usuario actualizado correctamente'

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| ELIMINAR USUARIO
|--------------------------------------------------------------------------
| DELETE /api/usuarios/:id
|--------------------------------------------------------------------------
|
| Ejemplo:
|
| DELETE /api/usuarios/uuid
|
|--------------------------------------------------------------------------
|
| Response 200:
|
| {
|   "ok": true,
|   "message": "Usuario eliminado correctamente"
| }
|
|--------------------------------------------------------------------------
*/

router.delete('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        await callProcedure(

            'sp_eliminar_usuario',

            [id]

        );

        return res.status(200).json({

            ok: true,

            message:
                'Usuario eliminado correctamente'

        });

    } catch (error) {

        next(error);

    }

});

module.exports = router;