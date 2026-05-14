/*
|--------------------------------------------------------------------------
| recipientes.sql
|--------------------------------------------------------------------------
|
| Procedures relacionados con recipientes y presentaciones.
|
| Permite:
| - Crear recipientes
| - Listar recipientes
| - Buscar recipientes
| - Obtener recipiente por ID
| - Actualizar recipientes
| - Desactivar recipientes
|
|--------------------------------------------------------------------------
*/

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_crear_recipiente $$

DROP PROCEDURE IF EXISTS sp_listar_recipientes $$

DROP PROCEDURE IF EXISTS sp_buscar_recipientes_por_tamano $$

DROP PROCEDURE IF EXISTS sp_obtener_recipiente_por_id $$

DROP PROCEDURE IF EXISTS sp_actualizar_recipiente $$

DROP PROCEDURE IF EXISTS sp_eliminar_recipiente $$
DROP PROCEDURE IF EXISTS sp_buscar_recipientes $$

CREATE PROCEDURE sp_crear_recipiente(

    IN p_nombre VARCHAR(255),

    IN p_valor DECIMAL(14,2),

    IN p_tamano_recipiente DECIMAL(14,2)

)

BEGIN

    DECLARE v_id CHAR(36);

    SET v_id = UUID();

    IF EXISTS (

        SELECT 1
        FROM tipos_recipientes

        WHERE fn_limpiar_texto(nombre)
        =
        fn_limpiar_texto(p_nombre)

        AND tamano_recipiente =
            p_tamano_recipiente

    ) THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT =
            'El recipiente ya existe';

    END IF;

    INSERT INTO tipos_recipientes (

        id,
        nombre,
        valor,
        tamano_recipiente,
        activo

    )

    VALUES (

        v_id,

        TRIM(p_nombre),

        p_valor,

        p_tamano_recipiente,

        true

    );

    SELECT v_id AS id;

END $$



CREATE PROCEDURE sp_listar_recipientes()

BEGIN

    /*
    |--------------------------------------------------------------------------
    | LISTAR RECIPIENTES
    |--------------------------------------------------------------------------
    */

    SELECT

        id,

        nombre,

        valor,

        tamano_recipiente,

        activo

    FROM tipos_recipientes

    WHERE activo = true

    ORDER BY tamano_recipiente ASC;

END $$



CREATE PROCEDURE sp_buscar_recipientes_por_tamano(

    IN p_tamano_recipiente DECIMAL(14,2)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | BUSCAR RECIPIENTES POR TAMAÑO
    |--------------------------------------------------------------------------
    */

    SELECT

        id,

        nombre,

        valor,

        tamano_recipiente,

        activo

    FROM tipos_recipientes

    WHERE activo = true

    AND tamano_recipiente =
        p_tamano_recipiente

    ORDER BY tamano_recipiente ASC;

END $$




CREATE PROCEDURE sp_obtener_recipiente_por_id(

    IN p_id CHAR(36)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | OBTENER RECIPIENTE
    |--------------------------------------------------------------------------
    */

    SELECT

        id,

        nombre,

        valor,

        tamano_recipiente,

        activo

    FROM tipos_recipientes

    WHERE id = p_id
    AND activo = true;

END $$



CREATE PROCEDURE sp_actualizar_recipiente(

    IN p_id CHAR(36),

    IN p_nombre VARCHAR(255),

    IN p_valor DECIMAL(14,2),

    IN p_tamano_recipiente DECIMAL(14,2)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | ACTUALIZAR RECIPIENTE
    |--------------------------------------------------------------------------
    */

    UPDATE tipos_recipientes

    SET

        nombre = TRIM(p_nombre),

        valor = p_valor,

        tamano_recipiente =
            p_tamano_recipiente

    WHERE id = p_id;

END $$



CREATE PROCEDURE sp_eliminar_recipiente(

    IN p_id CHAR(36)

)

BEGIN

    /*
    |--------------------------------------------------------------------------
    | DESACTIVAR RECIPIENTE
    |--------------------------------------------------------------------------
    */

    UPDATE tipos_recipientes

    SET

        activo = false

    WHERE id = p_id;

END $$



CREATE PROCEDURE sp_buscar_recipientes(

    IN p_search VARCHAR(255)

)

BEGIN

    SELECT

        r.id,
        r.nombre,
        r.valor,
        r.tamano_recipiente,
        r.activo

    FROM tipos_recipientes r

    WHERE

        r.activo = TRUE

        AND (

            p_search IS NULL

            OR r.nombre LIKE CONCAT('%', p_search, '%')

        )

    ORDER BY r.nombre ASC;

END$$

DELIMITER ;