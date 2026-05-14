/*
|--------------------------------------------------------------------------
| producto_recipiente.sql
|--------------------------------------------------------------------------
|
| Procedures relacionados con la distribución comercial
| y presentaciones de un producto.
|
| Permite:
| - Asociar recipientes
| - Consultar presentaciones
| - Actualizar cantidades
| - Desactivar presentaciones
|
|--------------------------------------------------------------------------
*/

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_agregar_recipiente_producto $$

DROP PROCEDURE IF EXISTS sp_listar_recipientes_producto $$

DROP PROCEDURE IF EXISTS sp_actualizar_recipiente_producto $$

DROP PROCEDURE IF EXISTS sp_eliminar_recipiente_producto $$



CREATE PROCEDURE sp_agregar_recipiente_producto(

    IN p_producto_id CHAR(36),

    IN p_recipiente_id CHAR(36),

    IN p_cantidad_unidades INT

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | VALIDAR EXISTENCIA
    |--------------------------------------------------------------------------
    |
    | Si ya existe la relación:
    | - Actualiza cantidad
    | - Reactiva presentación
    |
    |--------------------------------------------------------------------------
    */

    IF EXISTS (

        SELECT 1
        FROM producto_recipiente

        WHERE producto_id = p_producto_id
        AND recipiente_id = p_recipiente_id

    ) THEN

        UPDATE producto_recipiente

        SET

            cantidad_unidades =
                p_cantidad_unidades,

            activo = true

        WHERE producto_id = p_producto_id
        AND recipiente_id = p_recipiente_id;

    ELSE

        /*
        |--------------------------------------------------------------------------
        | INSERTAR NUEVA PRESENTACIÓN
        |--------------------------------------------------------------------------
        */

        INSERT INTO producto_recipiente (

            producto_id,

            recipiente_id,

            cantidad_unidades,

            activo

        )

        VALUES (

            p_producto_id,

            p_recipiente_id,

            p_cantidad_unidades,

            true

        );

    END IF;

    /*
    |--------------------------------------------------------------------------
    | RETORNAR RELACIÓN
    |--------------------------------------------------------------------------
    */

    SELECT

        p_producto_id AS producto_id,

        p_recipiente_id AS recipiente_id;

END $$



CREATE PROCEDURE sp_listar_recipientes_producto(

    IN p_producto_id CHAR(36)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | LISTAR PRESENTACIONES
    |--------------------------------------------------------------------------
    */

    SELECT

        pr.producto_id,

        r.id AS recipiente_id,

        r.nombre AS recipiente_nombre,

        r.valor AS recipiente_valor,

        r.tamano_recipiente,

        pr.cantidad_unidades,

        pr.activo

    FROM producto_recipiente pr

    INNER JOIN tipos_recipientes r
        ON r.id = pr.recipiente_id

    WHERE pr.producto_id = p_producto_id
    AND pr.activo = true
    AND r.activo = true

    ORDER BY r.tamano_recipiente ASC;

END $$



CREATE PROCEDURE sp_actualizar_recipiente_producto(

    IN p_producto_id CHAR(36),

    IN p_recipiente_id CHAR(36),

    IN p_cantidad_unidades INT

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | ACTUALIZAR PRESENTACIÓN
    |--------------------------------------------------------------------------
    */

    UPDATE producto_recipiente

    SET

        cantidad_unidades =
            p_cantidad_unidades

    WHERE producto_id = p_producto_id
    AND recipiente_id = p_recipiente_id;

END $$



CREATE PROCEDURE sp_eliminar_recipiente_producto(

    IN p_producto_id CHAR(36),

    IN p_recipiente_id CHAR(36)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | DESACTIVAR PRESENTACIÓN
    |--------------------------------------------------------------------------
    */

    UPDATE producto_recipiente

    SET

        activo = false

    WHERE producto_id = p_producto_id
    AND recipiente_id = p_recipiente_id;

END $$

DELIMITER ;