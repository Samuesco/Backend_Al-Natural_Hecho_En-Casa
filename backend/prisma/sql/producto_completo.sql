/*
|--------------------------------------------------------------------------
| producto_completo.sql
|--------------------------------------------------------------------------
|
| Procedure encargado de obtener toda la información
| relacionada con un producto:
|
| - Información general
| - Ingredientes / receta
| - Gastos adicionales
| - Presentaciones / recipientes
|
|--------------------------------------------------------------------------
*/

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_obtener_producto_completo $$



CREATE PROCEDURE sp_obtener_producto_completo(

    IN p_producto_id CHAR(36)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | PRODUCTO
    |--------------------------------------------------------------------------
    */

    SELECT

        id,
        nombre,
        descripcion,
        imagen_url,
        porcentaje_ganancia,
        porcentaje_perdida,
        activo,
        creado_en,
        actualizado_en

    FROM productos_finales

    WHERE id = p_producto_id
    AND activo = true;

    /*
    |--------------------------------------------------------------------------
    | RECETA / INGREDIENTES
    |--------------------------------------------------------------------------
    */

    SELECT

        r.producto_id,

        i.id AS ingrediente_id,

        i.nombre AS ingrediente_nombre,

        r.cantidad_ml,

        r.precio_por_ml,

        (

            r.cantidad_ml
            *
            r.precio_por_ml

        ) AS subtotal

    FROM recetas_producto_ingrediente r

    INNER JOIN ingredientes i
        ON i.id = r.ingrediente_id

    WHERE r.producto_id = p_producto_id

    ORDER BY i.nombre ASC;

    /*
    |--------------------------------------------------------------------------
    | GASTOS
    |--------------------------------------------------------------------------
    */

    SELECT

        id,

        nombre,

        descripcion,

        valor

    FROM gastos

    WHERE producto_id = p_producto_id
    AND activo = true

    ORDER BY nombre ASC;

    /*
    |--------------------------------------------------------------------------
    | RECIPIENTES / PRESENTACIONES
    |--------------------------------------------------------------------------
    */

    SELECT

        r.id AS recipiente_id,

        r.nombre,

        r.valor,

        r.tamano_recipiente,

        pr.cantidad_unidades

    FROM producto_recipiente pr

    INNER JOIN tipos_recipientes r
        ON r.id = pr.recipiente_id

    WHERE pr.producto_id = p_producto_id
    AND pr.activo = true
    AND r.activo = true

    ORDER BY r.tamano_recipiente ASC;

END $$

DELIMITER ;