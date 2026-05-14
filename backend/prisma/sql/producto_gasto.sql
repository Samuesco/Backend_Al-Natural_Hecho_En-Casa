/*
|--------------------------------------------------------------------------
| producto_gasto.sql
|--------------------------------------------------------------------------
|
| Procedures relacionados con gastos asociados
| a un producto.
|
|--------------------------------------------------------------------------
*/

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_agregar_gasto_producto $$

DROP PROCEDURE IF EXISTS sp_listar_gastos_producto $$

DROP PROCEDURE IF EXISTS sp_actualizar_gasto_producto $$

DROP PROCEDURE IF EXISTS sp_eliminar_gasto_producto $$



CREATE PROCEDURE sp_agregar_gasto_producto(

    IN p_producto_id CHAR(36),

    IN p_nombre VARCHAR(255),

    IN p_descripcion TEXT,

    IN p_valor DECIMAL(14,2)

)

BEGIN

    DECLARE v_id CHAR(36);

    SET v_id = UUID();

    INSERT INTO gastos (

        id,
        producto_id,
        nombre,
        descripcion,
        valor,
        activo,
        creado_en,
        actualizado_en

    )

    VALUES (

        v_id,

        p_producto_id,

        TRIM(p_nombre),

        TRIM(p_descripcion),

        p_valor,

        true,

        NOW(),

        NOW()

    );

    SELECT v_id AS id;

END $$



CREATE PROCEDURE sp_listar_gastos_producto(

    IN p_producto_id CHAR(36)

)

BEGIN

    SELECT

        id,

        producto_id,

        nombre,

        descripcion,

        valor,

        activo,

        creado_en,

        actualizado_en

    FROM gastos

    WHERE producto_id = p_producto_id
    AND activo = true

    ORDER BY nombre ASC;

END $$



CREATE PROCEDURE sp_actualizar_gasto_producto(

    IN p_id CHAR(36),

    IN p_nombre VARCHAR(255),

    IN p_descripcion TEXT,

    IN p_valor DECIMAL(14,2)

)

BEGIN

    UPDATE gastos

    SET

        nombre = TRIM(p_nombre),

        descripcion = TRIM(p_descripcion),

        valor = p_valor,

        actualizado_en = NOW()

    WHERE id = p_id;

END $$



CREATE PROCEDURE sp_eliminar_gasto_producto(

    IN p_id CHAR(36)

)

BEGIN

    UPDATE gastos

    SET

        activo = false,

        actualizado_en = NOW()

    WHERE id = p_id;

END $$

DELIMITER ;