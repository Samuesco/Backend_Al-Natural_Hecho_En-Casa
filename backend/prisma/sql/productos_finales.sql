/*
|--------------------------------------------------------------------------
| productos_finales.sql
|--------------------------------------------------------------------------
|
| Procedures relacionados con productos finales.
|
| Permite:
| - Crear productos
| - Consultar productos
| - Buscar productos
| - Actualizar productos
| - Desactivar productos
|
|--------------------------------------------------------------------------
*/

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_crear_producto $$

DROP PROCEDURE IF EXISTS sp_listar_productos $$

DROP PROCEDURE IF EXISTS sp_buscar_productos $$

DROP PROCEDURE IF EXISTS sp_obtener_producto_por_id $$

DROP PROCEDURE IF EXISTS sp_actualizar_producto $$

DROP PROCEDURE IF EXISTS sp_eliminar_producto $$

CREATE PROCEDURE sp_crear_producto(

    IN p_nombre VARCHAR(255),

    IN p_descripcion TEXT,

    IN p_imagen_url TEXT,

    IN p_cantidad_ml DECIMAL(14,2),

    IN p_porcentaje_ganancia DECIMAL(5,2),

    IN p_porcentaje_perdida DECIMAL(5,2)

)

BEGIN

    DECLARE v_id CHAR(36);

    SET v_id = UUID();

    IF EXISTS (

        SELECT 1
        FROM productos_finales

        WHERE fn_limpiar_texto(nombre)
        =
        fn_limpiar_texto(p_nombre)

    ) THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT =
            'El producto ya existe';

    END IF;

    INSERT INTO productos_finales (

        id,
        nombre,
        descripcion,
        imagen_url,
        cantidad_ml,
        porcentaje_ganancia,
        porcentaje_perdida,
        activo,
        creado_en,
        actualizado_en

    )

    VALUES (

        v_id,

        TRIM(p_nombre),

        TRIM(p_descripcion),

        p_imagen_url,

        p_cantidad_ml,

        p_porcentaje_ganancia,

        p_porcentaje_perdida,

        true,

        NOW(),

        NOW()

    );

    SELECT v_id AS id;

END$$



CREATE PROCEDURE sp_listar_productos()

BEGIN

    /*
    |--------------------------------------------------------------------------
    | LISTAR PRODUCTOS
    |--------------------------------------------------------------------------
    */

    SELECT

        p.id,

        p.nombre,

        p.descripcion,

        p.imagen_url,

        p.porcentaje_ganancia,

        p.porcentaje_perdida,

        p.activo,

        p.creado_en,

        p.actualizado_en,

        COUNT(
            DISTINCT r.ingrediente_id
        ) AS cantidad_ingredientes,

        COUNT(
            DISTINCT g.id
        ) AS cantidad_gastos,

        COUNT(
            DISTINCT pr.recipiente_id
        ) AS cantidad_presentaciones

    FROM productos_finales p

    LEFT JOIN recetas_producto_ingrediente r
        ON r.producto_id = p.id

    LEFT JOIN gastos g
        ON g.producto_id = p.id
        AND g.activo = true

    LEFT JOIN producto_recipiente pr
        ON pr.producto_id = p.id
        AND pr.activo = true

    WHERE p.activo = true

    GROUP BY

        p.id,
        p.nombre,
        p.descripcion,
        p.imagen_url,
        p.porcentaje_ganancia,
        p.porcentaje_perdida,
        p.activo,
        p.creado_en,
        p.actualizado_en

    ORDER BY p.nombre ASC;

END $$



CREATE PROCEDURE sp_buscar_productos(

    IN p_search VARCHAR(255)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | BUSCAR PRODUCTOS
    |--------------------------------------------------------------------------
    */

    SELECT

        p.id,

        p.nombre,

        p.descripcion,

        p.imagen_url,

        p.porcentaje_ganancia,

        p.porcentaje_perdida,

        p.activo,

        p.creado_en,

        p.actualizado_en


    FROM productos_finales p

    WHERE p.activo = true

    AND fn_limpiar_texto(p.nombre)
    COLLATE utf8mb4_general_ci

    LIKE CONCAT(

        '%',

        fn_limpiar_texto(p_search),

        '%'

    )
    COLLATE utf8mb4_general_ci

    ORDER BY p.nombre ASC;

END $$



CREATE PROCEDURE sp_obtener_producto_por_id(

    IN p_id CHAR(36)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | OBTENER PRODUCTO
    |--------------------------------------------------------------------------
    */

    SELECT

    id,

    nombre,

    descripcion,

    imagen_url,

    cantidad_ml,

    porcentaje_ganancia,

    porcentaje_perdida,

    activo,

    creado_en,

    actualizado_en

    FROM productos_finales

    WHERE id = p_id
    AND activo = true;

END $$



CREATE PROCEDURE sp_actualizar_producto(

    IN p_id CHAR(36),

    IN p_nombre VARCHAR(255),

    IN p_descripcion TEXT,

    IN p_imagen_url TEXT,

    IN p_cantidad_ml DECIMAL(14,2),

    IN p_porcentaje_ganancia DECIMAL(5,2),

    IN p_porcentaje_perdida DECIMAL(5,2)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | ACTUALIZAR PRODUCTO
    |--------------------------------------------------------------------------
    */

    UPDATE productos_finales

    SET

        nombre = TRIM(p_nombre),

        descripcion = TRIM(p_descripcion),

        imagen_url = p_imagen_url,

        cantidad_ml = p_cantidad_ml,

        porcentaje_ganancia =
            p_porcentaje_ganancia,

        porcentaje_perdida =
            p_porcentaje_perdida,


        actualizado_en = NOW()

    WHERE id = p_id;

END$$



CREATE PROCEDURE sp_eliminar_producto(

    IN p_id CHAR(36)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | DESACTIVAR PRODUCTO
    |--------------------------------------------------------------------------
    */

    UPDATE productos_finales

    SET

        activo = false,

        actualizado_en = NOW()

    WHERE id = p_id;

END $$

DELIMITER ;