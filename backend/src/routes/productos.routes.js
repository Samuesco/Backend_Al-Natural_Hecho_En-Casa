const express = require('express');

const router = express.Router();

const {callProcedure} = require('../utils/db.util');


/*
|--------------------------------------------------------------------------
| LISTAR / BUSCAR PRODUCTOS
|--------------------------------------------------------------------------
| GET /api/productos
|--------------------------------------------------------------------------
|
| Query Params:
|
| ?producto=perfume
|
|--------------------------------------------------------------------------
*/

router.get('/', async (req, res, next) => {

    try {

        const { producto } = req.query;

        const procedure = producto
            ? 'sp_buscar_productos'
            : 'sp_listar_productos';

        const params = producto
            ? [producto]
            : [];

        const productos =
            await callProcedure(

                procedure,

                params

            );

        return res.status(200).json({

            ok: true,

            data: productos

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| CREAR PRODUCTO COMPLETO
|--------------------------------------------------------------------------
| POST /api/productos/completo
|--------------------------------------------------------------------------
|
| Esta ruta:
|
| 1. Crea el producto final.
| 2. Relaciona ingredientes existentes.
| 3. Relaciona recipientes existentes.
| 4. Crea gastos del producto.
| 5. Todo dentro de una transacción.
|
|--------------------------------------------------------------------------
|
| IMPORTANTE
|--------------------------------------------------------------------------
|
| INGREDIENTES:
|
| El ingrediente YA existe previamente.
|
| En esta ruta solo se envía:
| - ingrediente_id
| - cantidad_ml
| - precio_por_ml
|
| Porque:
| - cantidad_ml
| - precio_por_ml
|
| pertenecen a:
|
| recetas_producto_ingrediente
|
|--------------------------------------------------------------------------
|
| RECIPIENTES:
|
| El recipiente YA existe previamente.
|
| En esta ruta solo se envía:
| - recipiente_id
| - cantidad_unidades
|
| Porque:
| - cantidad_unidades
|
| pertenece a:
|
| producto_recipiente
|
|--------------------------------------------------------------------------
|
| GASTOS:
|
| Los gastos sí se crean directamente porque:
| - son únicos por producto
| - no son reutilizables
|
|--------------------------------------------------------------------------
|
| Body JSON:
|
| {
|   "producto": {
|     "nombre": "Salsa Picante Tropical",
|     "descripcion": "Salsa artesanal",
|     "imagen_url": "https://...",
|     "cantidad_ml": 8000,
|     "porcentaje_ganancia": 40,
|     "porcentaje_perdida": 8
|   },
|
|   "ingredientes": [
|     {
|       "ingrediente_id": "uuid",
|       "cantidad_ml": 4000,
|       "precio_por_ml": 12
|     }
|   ],
|
|   "recipientes": [
|     {
|       "recipiente_id": "uuid",
|       "cantidad_unidades": 20
|     }
|   ],
|
|   "gastos": [
|     {
|       "nombre": "gas",
|       "descripcion": "Consumo gas",
|       "valor": 3000
|     }
|   ]
| }
|
|--------------------------------------------------------------------------
*/

router.post(
    '/completo',
    async (req, res, next) => {

        try {

            /*
            |--------------------------------------------------------------------------
            | BODY
            |--------------------------------------------------------------------------
            */

            const {

                producto,
                ingredientes,
                recipientes,
                gastos

            } = req.body;

            /*
            |--------------------------------------------------------------------------
            | PRISMA
            |--------------------------------------------------------------------------
            */

            const prisma =
                require('../config/prisma');

            /*
            |--------------------------------------------------------------------------
            | TRANSACCIÓN
            |--------------------------------------------------------------------------
            */

            const resultado =
                await prisma.$transaction(

                    async (tx) => {

                        /*
                        |--------------------------------------------------------------------------
                        | VALIDACIONES
                        |--------------------------------------------------------------------------
                        */

                        if (!producto?.nombre) {

                            throw new Error(
                                'El nombre del producto es obligatorio'
                            );

                        }

                        if (!ingredientes?.length) {

                            throw new Error(
                                'Debe agregar al menos un ingrediente'
                            );

                        }

                        if (!recipientes?.length) {

                            throw new Error(
                                'Debe agregar al menos un recipiente'
                            );

                        }

                        /*
                        |--------------------------------------------------------------------------
                        | VALIDAR INGREDIENTES
                        |--------------------------------------------------------------------------
                        */

                        for (const item of ingredientes) {

                            const ingrediente =
                                await tx.ingredientes.findFirst({

                                    where: {

                                        id:
                                            item.ingrediente_id,

                                        activo:
                                            true

                                    }

                                });

                            if (!ingrediente) {

                                throw new Error(
                                    `Ingrediente inválido: ${item.ingrediente_id}`
                                );

                            }

                        }

                        /*
                        |--------------------------------------------------------------------------
                        | VALIDAR RECIPIENTES
                        |--------------------------------------------------------------------------
                        */

                        for (const item of recipientes) {

                            const recipiente =
                                await tx.tiposRecipientes.findFirst({

                                    where: {

                                        id:
                                            item.recipiente_id,

                                        activo:
                                            true

                                    }

                                });

                            if (!recipiente) {

                                throw new Error(
                                    `Recipiente inválido: ${item.recipiente_id}`
                                );

                            }

                        }

                        /*
                        |--------------------------------------------------------------------------
                        | CREAR PRODUCTO
                        |--------------------------------------------------------------------------
                        */

                        const nuevoProducto =
                            await tx.productosFinales.create({

                                data: {

                                    nombre:
                                        producto.nombre,

                                    descripcion:
                                        producto.descripcion,

                                    imagen_url:
                                        producto.imagen_url,

                                    cantidad_ml:
                                        producto.cantidad_ml,

                                    porcentaje_ganancia:
                                        producto.porcentaje_ganancia,

                                    porcentaje_perdida:
                                        producto.porcentaje_perdida,

                                    activo:
                                        true

                                }

                            });

                        /*
                        |--------------------------------------------------------------------------
                        | CREAR RELACIONES INGREDIENTES
                        |--------------------------------------------------------------------------
                        */

                        for (const item of ingredientes) {

                            await tx.recetasProductoIngrediente.create({

                                data: {

                                    producto_id:
                                        nuevoProducto.id,

                                    ingrediente_id:
                                        item.ingrediente_id,

                                    cantidad_ml:
                                        item.cantidad_ml,

                                    precio_por_ml:
                                        item.precio_por_ml

                                }

                            });

                        }

                        /*
                        |--------------------------------------------------------------------------
                        | CREAR RELACIONES RECIPIENTES
                        |--------------------------------------------------------------------------
                        */

                        for (const item of recipientes) {

                            await tx.productoRecipiente.create({

                                data: {

                                    producto_id:
                                        nuevoProducto.id,

                                    recipiente_id:
                                        item.recipiente_id,

                                    cantidad_unidades:
                                        item.cantidad_unidades,

                                    activo:
                                        true

                                }

                            });

                        }

                        /*
                        |--------------------------------------------------------------------------
                        | CREAR GASTOS
                        |--------------------------------------------------------------------------
                        */

                        if (gastos?.length) {

                            for (const item of gastos) {

                                await tx.gastos.create({

                                    data: {

                                        producto_id:
                                            nuevoProducto.id,

                                        nombre:
                                            item.nombre,

                                        descripcion:
                                            item.descripcion,

                                        valor:
                                            item.valor,

                                        activo:
                                            true

                                    }

                                });

                            }

                        }

                        /*
                        |--------------------------------------------------------------------------
                        | CONSULTAR PRODUCTO COMPLETO
                        |--------------------------------------------------------------------------
                        */

                        const productoCompleto =
                            await tx.productosFinales.findUnique({

                                where: {

                                    id:
                                        nuevoProducto.id

                                },

                                include: {

                                    recetas: {

                                        include: {

                                            ingrediente:
                                                true

                                        }

                                    },

                                    recipientes: {

                                        include: {

                                            recipiente:
                                                true

                                        }

                                    },

                                    gastos:
                                        true

                                }

                            });

                        /*
                        |--------------------------------------------------------------------------
                        | RETURN
                        |--------------------------------------------------------------------------
                        */

                        return productoCompleto;

                    }

                );

            /*
            |--------------------------------------------------------------------------
            | RESPONSE
            |--------------------------------------------------------------------------
            */

            return res.status(201).json({

                ok: true,

                message:
                    'Producto completo creado correctamente',

                data:
                    resultado

            });

        } catch (error) {

            next(error);

        }

    }
);

/*
|--------------------------------------------------------------------------
| OBTENER PRODUCTO COMPLETO
|--------------------------------------------------------------------------
| GET /api/productos/:id
|--------------------------------------------------------------------------
|
| Retorna:
| - producto
| - ingredientes
| - recipientes
| - gastos
| - costeo
|
|--------------------------------------------------------------------------
*/

router.get('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        const producto =
            await callProcedure(

                'sp_obtener_producto_por_id',

                [id]

            );

        if (!producto?.length) {

            return res.status(404).json({

                ok: false,

                message:
                    'Producto no encontrado'

            });

        }

        const ingredientes =
            await callProcedure(

                'sp_listar_receta_producto',

                [id]

            );

        const recipientes =
            await callProcedure(

                'sp_listar_recipientes_producto',

                [id]

            );

        const gastos =
            await callProcedure(

                'sp_listar_gastos_producto',

                [id]

            );


        return res.status(200).json({

            ok: true,

            data: {

                producto:
                    producto[0],

                ingredientes,

                recipientes,

                gastos

            }

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| CREAR PRODUCTO
|--------------------------------------------------------------------------
| POST /api/productos
|--------------------------------------------------------------------------
|
| Body JSON:
|
| {
|   "nombre": "Perfume Coco",
|   "descripcion": "Perfume premium",
|   "imagen_url": "https://...",
|   "cantidad_ml": 120,
|   "porcentaje_ganancia": 30,
|   "porcentaje_perdida": 5
| }
|
|--------------------------------------------------------------------------
*/

router.post('/', async (req, res, next) => {

    try {

        const {

            nombre,
            descripcion,
            imagen_url,
            cantidad_ml,
            porcentaje_ganancia,
            porcentaje_perdida

        } = req.body;

        const producto =
            await callProcedure(

                'sp_crear_producto',

                [

                    nombre,
                    descripcion,
                    imagen_url,
                    cantidad_ml,
                    porcentaje_ganancia,
                    porcentaje_perdida

                ]

            );

        return res.status(201).json({

            ok: true,

            message:
                'Producto creado correctamente',

            data: producto[0]

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| ACTUALIZAR PRODUCTO
|--------------------------------------------------------------------------
| PUT /api/productos/:id
|--------------------------------------------------------------------------
*/

router.put('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        const {

            nombre,
            descripcion,
            imagen_url,
            cantidad_ml,
            porcentaje_ganancia,
            porcentaje_perdida

        } = req.body;

        await callProcedure(

            'sp_actualizar_producto',

            [

                id,
                nombre,
                descripcion,
                imagen_url,
                cantidad_ml,
                porcentaje_ganancia,
                porcentaje_perdida

            ]

        );

        return res.status(200).json({

            ok: true,

            message:
                'Producto actualizado correctamente'

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| ELIMINAR PRODUCTO
|--------------------------------------------------------------------------
| DELETE /api/productos/:id
|--------------------------------------------------------------------------
*/

router.delete('/:id', async (req, res, next) => {

    try {

        const { id } = req.params;

        await callProcedure(

            'sp_eliminar_producto',

            [id]

        );

        return res.status(200).json({

            ok: true,

            message:
                'Producto eliminado correctamente'

        });

    } catch (error) {

        next(error);

    }

});

/*
|--------------------------------------------------------------------------
| LISTAR INGREDIENTES DE PRODUCTO
|--------------------------------------------------------------------------
| GET /api/productos/:producto_id/ingredientes
|--------------------------------------------------------------------------
*/

router.get(

    '/:producto_id/ingredientes',

    async (req, res, next) => {

        try {

            const { producto_id } = req.params;

            const ingredientes =
                await callProcedure(

                    'sp_listar_receta_producto',

                    [producto_id]

                );

            return res.status(200).json({

                ok: true,

                data: ingredientes

            });

        } catch (error) {

            next(error);

        }

    }

);

/*
|--------------------------------------------------------------------------
| AGREGAR INGREDIENTE A PRODUCTO
|--------------------------------------------------------------------------
| POST /api/productos/:producto_id/ingredientes
|--------------------------------------------------------------------------
*/

router.post(

    '/:producto_id/ingredientes',

    async (req, res, next) => {

        try {

            const { producto_id } = req.params;

            const {

                ingrediente_id,
                cantidad_ml,
                precio_por_ml

            } = req.body;

            const relacion =
                await callProcedure(

                    'sp_agregar_ingrediente_producto',

                    [

                        producto_id,
                        ingrediente_id,
                        cantidad_ml,
                        precio_por_ml

                    ]

                );

            return res.status(201).json({

                ok: true,

                message:
                    'Ingrediente agregado correctamente',

                data: relacion[0]

            });

        } catch (error) {

            next(error);

        }

    }

);

/*
|--------------------------------------------------------------------------
| ACTUALIZAR INGREDIENTE DE PRODUCTO
|--------------------------------------------------------------------------
| PUT /api/productos/:producto_id/ingredientes/:ingrediente_id
|--------------------------------------------------------------------------
*/

router.put(

    '/:producto_id/ingredientes/:ingrediente_id',

    async (req, res, next) => {

        try {

            const {

                producto_id,
                ingrediente_id

            } = req.params;

            const {

                cantidad_ml,
                precio_por_ml

            } = req.body;

            await callProcedure(

                'sp_actualizar_ingrediente_producto',

                [

                    producto_id,
                    ingrediente_id,
                    cantidad_ml,
                    precio_por_ml

                ]

            );

            return res.status(200).json({

                ok: true,

                message:
                    'Ingrediente actualizado correctamente sobre la receta del producto'

            });

        } catch (error) {

            next(error);

        }

    }

);

/*
|--------------------------------------------------------------------------
| ELIMINAR INGREDIENTE DE PRODUCTO
|--------------------------------------------------------------------------
| DELETE /api/productos/:producto_id/ingredientes/:ingrediente_id
|--------------------------------------------------------------------------
*/

router.delete(

    '/:producto_id/ingredientes/:ingrediente_id',

    async (req, res, next) => {

        try {

            const {

                producto_id,
                ingrediente_id

            } = req.params;

            await callProcedure(

                'sp_eliminar_ingrediente_producto',

                [

                    producto_id,
                    ingrediente_id

                ]

            );

            return res.status(200).json({

                ok: true,

                message:
                    'Ingrediente eliminado correctamente'

            });

        } catch (error) {

            next(error);

        }

    }

);

/*
|--------------------------------------------------------------------------
| LISTAR RECIPIENTES DE PRODUCTO
|--------------------------------------------------------------------------
| GET /api/productos/:producto_id/recipientes
|--------------------------------------------------------------------------
*/

router.get(

    '/:producto_id/recipientes',

    async (req, res, next) => {

        try {

            const { producto_id } = req.params;

            const recipientes =
                await callProcedure(

                    'sp_listar_recipientes_producto',

                    [producto_id]

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
| AGREGAR RECIPIENTE A PRODUCTO
|--------------------------------------------------------------------------
| POST /api/productos/:producto_id/recipientes
|--------------------------------------------------------------------------
*/

router.post(

    '/:producto_id/recipientes',

    async (req, res, next) => {

        try {

            const { producto_id } = req.params;

            const {

                recipiente_id,
                cantidad_unidades

            } = req.body;

            const relacion =
                await callProcedure(

                    'sp_agregar_recipiente_producto',

                    [

                        producto_id,
                        recipiente_id,
                        cantidad_unidades

                    ]

                );

            return res.status(201).json({

                ok: true,

                message:
                    'Recipiente agregado correctamente',

                data: relacion[0]

            });

        } catch (error) {

            next(error);

        }

    }

);

/*
|--------------------------------------------------------------------------
| ACTUALIZAR RECIPIENTE DE PRODUCTO
|--------------------------------------------------------------------------
| PUT /api/productos/:producto_id/recipientes/:recipiente_id
|--------------------------------------------------------------------------
*/

router.put(

    '/:producto_id/recipientes/:recipiente_id',

    async (req, res, next) => {

        try {

            const {

                producto_id,
                recipiente_id

            } = req.params;

            const {

                cantidad_unidades

            } = req.body;

            await callProcedure(

                'sp_actualizar_recipiente_producto',

                [

                    producto_id,
                    recipiente_id,
                    cantidad_unidades

                ]

            );

            return res.status(200).json({

                ok: true,

                message:
                    'Recipiente actualizado correctamente para el producto'

            });

        } catch (error) {

            next(error);

        }

    }

);

/*
|--------------------------------------------------------------------------
| ELIMINAR RECIPIENTE DE PRODUCTO
|--------------------------------------------------------------------------
| DELETE /api/productos/:producto_id/recipientes/:recipiente_id
|--------------------------------------------------------------------------
*/

router.delete(

    '/:producto_id/recipientes/:recipiente_id',

    async (req, res, next) => {

        try {

            const {

                producto_id,
                recipiente_id

            } = req.params;

            await callProcedure(

                'sp_eliminar_recipiente_producto',

                [

                    producto_id,
                    recipiente_id

                ]

            );

            return res.status(200).json({

                ok: true,

                message:
                    'Recipiente eliminado correctamente'

            });

        } catch (error) {

            next(error);

        }

    }

);

/*
|--------------------------------------------------------------------------
| LISTAR GASTOS DE PRODUCTO
|--------------------------------------------------------------------------
| GET /api/productos/:producto_id/gastos
|--------------------------------------------------------------------------
*/

router.get(

    '/:producto_id/gastos',

    async (req, res, next) => {

        try {

            const { producto_id } = req.params;

            const gastos =
                await callProcedure(

                    'sp_listar_gastos_producto',

                    [producto_id]

                );

            return res.status(200).json({

                ok: true,

                data: gastos

            });

        } catch (error) {

            next(error);

        }

    }

);

/*
|--------------------------------------------------------------------------
| CREAR GASTO DE PRODUCTO
|--------------------------------------------------------------------------
| POST /api/productos/:producto_id/gastos
|--------------------------------------------------------------------------
*/

router.post(

    '/:producto_id/gastos',

    async (req, res, next) => {

        try {

            const { producto_id } = req.params;

            const {

                nombre,
                descripcion,
                valor

            } = req.body;

            const gasto =
                await callProcedure(

                    'sp_agregar_gasto_producto',

                    [

                        producto_id,
                        nombre,
                        descripcion,
                        valor

                    ]

                );

            return res.status(201).json({

                ok: true,

                message:
                    'Gasto agregado correctamente',

                data: gasto[0]

            });

        } catch (error) {

            next(error);

        }

    }

);

/*
|--------------------------------------------------------------------------
| ACTUALIZAR GASTO
|--------------------------------------------------------------------------
| PUT /api/productos/gastos/:gasto_id
|--------------------------------------------------------------------------
*/

router.put(

    '/gastos/:gasto_id',

    async (req, res, next) => {

        try {

            const { gasto_id } = req.params;

            const {

                nombre,
                descripcion,
                valor

            } = req.body;

            await callProcedure(

                'sp_actualizar_gasto_producto',

                [

                    gasto_id,
                    nombre,
                    descripcion,
                    valor

                ]

            );

            return res.status(200).json({

                ok: true,

                message:
                    'Gasto actualizado correctamente para el producto'

            });

        } catch (error) {

            next(error);

        }

    }

);

/*
|--------------------------------------------------------------------------
| ELIMINAR GASTO
|--------------------------------------------------------------------------
| DELETE /api/productos/gastos/:gasto_id
|--------------------------------------------------------------------------
*/

router.delete(

    '/gastos/:gasto_id',

    async (req, res, next) => {

        try {

            const { gasto_id } = req.params;

            await callProcedure(

                'sp_eliminar_gasto_producto',

                [gasto_id]

            );

            return res.status(200).json({

                ok: true,

                message:
                    'Gasto eliminado correctamente'

            });

        } catch (error) {

            next(error);

        }

    }

);

module.exports = router;