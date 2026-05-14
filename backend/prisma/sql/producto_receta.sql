/*
|--------------------------------------------------------------------------
| producto_receta.sql
|--------------------------------------------------------------------------
|
| Procedures relacionados con la receta de un producto.
|
| Permite:
| - Asociar ingredientes
| - Consultar receta
| - Actualizar ingredientes
| - Eliminar ingredientes
|
|--------------------------------------------------------------------------
*/

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_agregar_ingrediente_producto $$

DROP PROCEDURE IF EXISTS sp_listar_receta_producto $$

DROP PROCEDURE IF EXISTS sp_actualizar_ingrediente_producto $$

DROP PROCEDURE IF EXISTS sp_eliminar_ingrediente_producto $$



CREATE PROCEDURE sp_agregar_ingrediente_producto(

    IN p_producto_id CHAR(36),

    IN p_ingrediente_id CHAR(36),

    IN p_cantidad_ml DECIMAL(10,2),

    IN p_precio_por_ml DECIMAL(12,4)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | REACTIVAR RELACIÓN SI EXISTE INACTIVA
    |--------------------------------------------------------------------------
    */

    IF EXISTS (

        SELECT 1
        FROM recetas_producto_ingrediente

        WHERE producto_id = p_producto_id
        AND ingrediente_id = p_ingrediente_id
        AND activo = false

    ) THEN

        UPDATE recetas_producto_ingrediente

        SET

            cantidad_ml = p_cantidad_ml,

            precio_por_ml = p_precio_por_ml,

            activo = true

        WHERE producto_id = p_producto_id
        AND ingrediente_id = p_ingrediente_id;

    ELSE

        /*
        |--------------------------------------------------------------------------
        | VALIDAR INGREDIENTE DUPLICADO
        |--------------------------------------------------------------------------
        */

        IF EXISTS (

            SELECT 1
            FROM recetas_producto_ingrediente

            WHERE producto_id = p_producto_id
            AND ingrediente_id = p_ingrediente_id
            AND activo = true

        ) THEN

            SIGNAL SQLSTATE '45000'

            SET MESSAGE_TEXT =
                'El ingrediente ya está asociado al producto';

        END IF;

        /*
        |--------------------------------------------------------------------------
        | INSERTAR INGREDIENTE
        |--------------------------------------------------------------------------
        */

        INSERT INTO recetas_producto_ingrediente (

            producto_id,

            ingrediente_id,

            cantidad_ml,

            precio_por_ml,

            activo,

            creado_en

        )

        VALUES (

            p_producto_id,

            p_ingrediente_id,

            p_cantidad_ml,

            p_precio_por_ml,

            true,

            NOW()

        );

    END IF;

    /*
    |--------------------------------------------------------------------------
    | RETORNAR RELACIÓN
    |--------------------------------------------------------------------------
    */

    SELECT

        p_producto_id AS producto_id,

        p_ingrediente_id AS ingrediente_id;

END $$



CREATE PROCEDURE sp_listar_receta_producto(

    IN p_producto_id CHAR(36)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | LISTAR RECETA COMPLETA
    |--------------------------------------------------------------------------
    */

    SELECT

        r.producto_id,

        i.id AS ingrediente_id,

        i.nombre AS ingrediente_nombre,

        i.descripcion AS ingrediente_descripcion,

        c.id AS categoria_id,

        c.nombre AS categoria_nombre,

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

    LEFT JOIN categorias_ingrediente c
        ON c.id = i.categoria_id

    WHERE

        r.producto_id = p_producto_id

        AND r.activo = true

        AND i.activo = true

    ORDER BY i.nombre ASC;

END $$



CREATE PROCEDURE sp_actualizar_ingrediente_producto(

    IN p_producto_id CHAR(36),

    IN p_ingrediente_id CHAR(36),

    IN p_cantidad_ml DECIMAL(10,2),

    IN p_precio_por_ml DECIMAL(12,4)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | ACTUALIZAR INGREDIENTE RECETA
    |--------------------------------------------------------------------------
    */

    UPDATE recetas_producto_ingrediente

    SET

        cantidad_ml = p_cantidad_ml,

        precio_por_ml = p_precio_por_ml

    WHERE producto_id = p_producto_id
    AND ingrediente_id = p_ingrediente_id
    AND activo = true;

END $$



CREATE PROCEDURE sp_eliminar_ingrediente_producto(

    IN p_producto_id CHAR(36),

    IN p_ingrediente_id CHAR(36)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | DESACTIVAR INGREDIENTE RECETA
    |--------------------------------------------------------------------------
    */

    UPDATE recetas_producto_ingrediente

    SET

        activo = false

    WHERE producto_id = p_producto_id
    AND ingrediente_id = p_ingrediente_id;

END $$

DELIMITER ;