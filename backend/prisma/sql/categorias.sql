/*
|--------------------------------------------------------------------------
| categorias.sql
|--------------------------------------------------------------------------
|
| Procedures relacionados con categorías de ingredientes.
|
|--------------------------------------------------------------------------
*/

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_crear_categoria $$

DROP PROCEDURE IF EXISTS sp_listar_categorias $$

DROP PROCEDURE IF EXISTS sp_buscar_categorias $$

DROP PROCEDURE IF EXISTS sp_obtener_categoria_por_id $$

DROP PROCEDURE IF EXISTS sp_obtener_ingredientes_por_categoria $$

DROP PROCEDURE IF EXISTS sp_actualizar_categoria $$

DROP PROCEDURE IF EXISTS sp_eliminar_categoria $$



CREATE PROCEDURE sp_crear_categoria(

    IN p_nombre VARCHAR(255)

)

BEGIN

    IF EXISTS (

        SELECT 1
        FROM categorias_ingrediente

        WHERE fn_limpiar_texto(nombre)
        =
        fn_limpiar_texto(p_nombre)

    ) THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT =
            'La categoría ya existe';

    END IF;

    INSERT INTO categorias_ingrediente (

        nombre,
        activo,
        creado_en

    )

    VALUES (

        TRIM(p_nombre),
        true,
        NOW()

    );

    SELECT LAST_INSERT_ID() AS id;

END $$



CREATE PROCEDURE sp_listar_categorias()

BEGIN

    SELECT

        c.id,
        c.nombre,
        c.activo,
        c.creado_en,

        COUNT(i.id)
        AS cantidad_ingredientes

    FROM categorias_ingrediente c

    LEFT JOIN ingredientes i
        ON i.categoria_id = c.id
        AND i.activo = true

    WHERE c.activo = true

    GROUP BY

        c.id,
        c.nombre,
        c.activo,
        c.creado_en

    ORDER BY c.nombre ASC;

END $$



CREATE PROCEDURE sp_buscar_categorias(

    IN p_search VARCHAR(255)

)

BEGIN

    SELECT

        c.id,
        c.nombre,
        c.activo,
        c.creado_en,

        COUNT(i.id)
        AS cantidad_ingredientes

    FROM categorias_ingrediente c

    LEFT JOIN ingredientes i
        ON i.categoria_id = c.id
        AND i.activo = true

    WHERE c.activo = true

    AND fn_limpiar_texto(c.nombre)
    COLLATE utf8mb4_general_ci

    LIKE CONCAT(

        '%',

        fn_limpiar_texto(p_search),

        '%'

    )
    COLLATE utf8mb4_general_ci

    GROUP BY

        c.id,
        c.nombre,
        c.activo,
        c.creado_en

    ORDER BY c.nombre ASC;

END $$



CREATE PROCEDURE sp_obtener_categoria_por_id(

    IN p_id INT

)

BEGIN

    SELECT

        id,
        nombre,
        activo,
        creado_en

    FROM categorias_ingrediente

    WHERE id = p_id
    AND activo = true;

END $$



CREATE PROCEDURE sp_obtener_ingredientes_por_categoria(

    IN p_categoria_id INT

)

BEGIN

    SELECT

        i.id,
        i.nombre,
        i.descripcion,
        i.activo,

        c.id AS categoria_id,
        c.nombre AS categoria_nombre

    FROM ingredientes i

    INNER JOIN categorias_ingrediente c
        ON c.id = i.categoria_id

    WHERE i.categoria_id = p_categoria_id
    AND i.activo = true
    AND c.activo = true

    ORDER BY i.nombre ASC;

END $$



CREATE PROCEDURE sp_actualizar_categoria(

    IN p_id INT,

    IN p_nombre VARCHAR(255)

)

BEGIN

    UPDATE categorias_ingrediente

    SET

        nombre = TRIM(p_nombre),

        activo = p_activo

    WHERE id = p_id;

END $$



CREATE PROCEDURE sp_eliminar_categoria(

    IN p_id INT

)

BEGIN

    UPDATE categorias_ingrediente

    SET

        activo = false

    WHERE id = p_id;

END $$

DELIMITER ;