/*
|--------------------------------------------------------------------------
| ingredientes.sql
|--------------------------------------------------------------------------
|
| Procedures relacionados con ingredientes.
|
|--------------------------------------------------------------------------
*/

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_crear_ingrediente $$

DROP PROCEDURE IF EXISTS sp_listar_ingredientes $$

DROP PROCEDURE IF EXISTS sp_buscar_ingredientes $$

DROP PROCEDURE IF EXISTS sp_obtener_ingrediente_por_id $$

DROP PROCEDURE IF EXISTS sp_actualizar_ingrediente $$

DROP PROCEDURE IF EXISTS sp_eliminar_ingrediente $$


CREATE PROCEDURE sp_crear_ingrediente(

    IN p_categoria_id INT,

    IN p_nombre VARCHAR(255),

    IN p_descripcion TEXT

)

BEGIN

    DECLARE v_id CHAR(36);

    SET v_id = UUID();

    IF EXISTS (

        SELECT 1
        FROM ingredientes

        WHERE fn_limpiar_texto(nombre)
        =
        fn_limpiar_texto(p_nombre)

    ) THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT =
            'El ingrediente ya existe';

    END IF;

    INSERT INTO ingredientes (

        id,
        categoria_id,
        nombre,
        descripcion,
        activo,
        creado_en,
        actualizado_en

    )

    VALUES (

        v_id,

        p_categoria_id,

        TRIM(p_nombre),

        TRIM(p_descripcion),

        true,

        NOW(),

        NOW()

    );

    SELECT v_id AS id;

END $$



CREATE PROCEDURE sp_listar_ingredientes()

BEGIN

    SELECT

        i.id,
        i.nombre,
        i.descripcion,
        i.activo,
        i.creado_en,
        i.actualizado_en,

        c.id AS categoria_id,

        c.nombre AS categoria_nombre

    FROM ingredientes i

    LEFT JOIN categorias_ingrediente c
        ON c.id = i.categoria_id

    WHERE i.activo = true

    ORDER BY i.nombre ASC;

END $$



CREATE PROCEDURE sp_buscar_ingredientes(

    IN p_search VARCHAR(255),

    IN p_categoria_id INT

)

BEGIN

    SELECT

        i.id,
        i.nombre,
        i.descripcion,
        i.activo,
        i.creado_en,
        i.actualizado_en,

        c.id AS categoria_id,

        c.nombre AS categoria_nombre

    FROM ingredientes i

    LEFT JOIN categorias_ingrediente c
        ON c.id = i.categoria_id

    WHERE i.activo = true

    AND (

        p_search IS NULL

        OR

        fn_limpiar_texto(i.nombre)
        COLLATE utf8mb4_general_ci

        LIKE CONCAT(

            '%',

            fn_limpiar_texto(p_search),

            '%'

        )
        COLLATE utf8mb4_general_ci

    )

    AND (

        p_categoria_id IS NULL

        OR

        i.categoria_id = p_categoria_id

    )

    ORDER BY i.nombre ASC;

END $$



CREATE PROCEDURE sp_obtener_ingrediente_por_id(

    IN p_id CHAR(36)

)

BEGIN

    SELECT

        i.id,
        i.nombre,
        i.descripcion,
        i.activo,
        i.creado_en,
        i.actualizado_en,

        c.id AS categoria_id,

        c.nombre AS categoria_nombre

    FROM ingredientes i

    LEFT JOIN categorias_ingrediente c
        ON c.id = i.categoria_id

    WHERE i.id = p_id
    AND i.activo = true;

END $$



CREATE PROCEDURE sp_actualizar_ingrediente(

    IN p_id CHAR(36),

    IN p_categoria_id INT,

    IN p_nombre VARCHAR(255),

    IN p_descripcion TEXT

)

BEGIN

    UPDATE ingredientes

    SET

        categoria_id = p_categoria_id,

        nombre = TRIM(p_nombre),

        descripcion = TRIM(p_descripcion),

        actualizado_en = NOW()

    WHERE id = p_id;

END $$



CREATE PROCEDURE sp_eliminar_ingrediente(

    IN p_id CHAR(36)

)

BEGIN

    UPDATE ingredientes

    SET

        activo = false,

        actualizado_en = NOW()

    WHERE id = p_id;

END $$

DELIMITER ;