DELIMITER $$

DROP PROCEDURE IF EXISTS sp_crear_usuario $$

DROP PROCEDURE IF EXISTS sp_listar_usuarios $$

DROP PROCEDURE IF EXISTS sp_buscar_usuarios $$

DROP PROCEDURE IF EXISTS sp_obtener_usuario_por_id $$

DROP PROCEDURE IF EXISTS sp_actualizar_usuario $$

DROP PROCEDURE IF EXISTS sp_eliminar_usuario $$



CREATE PROCEDURE sp_crear_usuario(

    IN p_nombre VARCHAR(255),
    IN p_apellidos VARCHAR(255),
    IN p_identificacion VARCHAR(255),
    IN p_correo VARCHAR(255),
    IN p_telefono VARCHAR(255),
    IN p_password TEXT

)

BEGIN

    DECLARE v_id CHAR(36);

    SET v_id = UUID();

    IF EXISTS (

        SELECT 1
        FROM usuarios
        WHERE fn_limpiar_texto(identificacion)
        =
        fn_limpiar_texto(p_identificacion)

    ) THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'La identificación ya existe';

    END IF;

    INSERT INTO usuarios (

        id,
        nombre,
        apellidos,
        identificacion,
        correo,
        telefono,
        password,
        activo,
        creado_en,
        actualizado_en

    )

    VALUES (

        v_id,
        TRIM(p_nombre),
        TRIM(p_apellidos),
        TRIM(p_identificacion),
        LOWER(TRIM(p_correo)),
        TRIM(p_telefono),
        p_password,
        true,
        NOW(),
        NOW()

    );

    SELECT v_id AS id;

END $$



CREATE PROCEDURE sp_listar_usuarios()

BEGIN

    SELECT

        id,
        nombre,
        apellidos,
        identificacion,
        correo,
        telefono,
        activo,
        creado_en,
        actualizado_en

    FROM usuarios

    WHERE activo = true

    ORDER BY nombre ASC;

END $$



CREATE PROCEDURE sp_buscar_usuarios(

    IN p_search VARCHAR(255)

)

BEGIN

    SELECT

        id,
        nombre,
        apellidos,
        identificacion,
        correo,
        telefono,
        activo,
        creado_en,
        actualizado_en

    FROM usuarios

    WHERE activo = true

    AND (

        fn_limpiar_texto(nombre)
        COLLATE utf8mb4_general_ci

        LIKE CONCAT(

            '%',

            fn_limpiar_texto(p_search),

            '%'

        )
        COLLATE utf8mb4_general_ci

        OR

        fn_limpiar_texto(apellidos)
        COLLATE utf8mb4_general_ci

        LIKE CONCAT(

            '%',

            fn_limpiar_texto(p_search),

            '%'

        )
        COLLATE utf8mb4_general_ci

        OR

        fn_limpiar_texto(identificacion)
        COLLATE utf8mb4_general_ci

        LIKE CONCAT(

            '%',

            fn_limpiar_texto(p_search),

            '%'

        )
        COLLATE utf8mb4_general_ci

    )

    ORDER BY nombre ASC;

END $$



CREATE PROCEDURE sp_obtener_usuario_por_id(

    IN p_id CHAR(36)

)

BEGIN

    SELECT

        id,
        nombre,
        apellidos,
        identificacion,
        correo,
        telefono,
        activo,
        creado_en,
        actualizado_en

    FROM usuarios

    WHERE id = p_id
    AND activo = true;

END $$



CREATE PROCEDURE sp_actualizar_usuario(

    IN p_id CHAR(36),

    IN p_nombre VARCHAR(255),
    IN p_apellidos VARCHAR(255),
    IN p_identificacion VARCHAR(255),
    IN p_correo VARCHAR(255),
    IN p_telefono VARCHAR(255),
    IN p_password TEXT

)

BEGIN

    UPDATE usuarios

    SET

        nombre = TRIM(p_nombre),
        apellidos = TRIM(p_apellidos),
        identificacion = TRIM(p_identificacion),
        correo = LOWER(TRIM(p_correo)),
        telefono = TRIM(p_telefono),
        password = p_password,
        actualizado_en = NOW()

    WHERE id = p_id;

END $$



CREATE PROCEDURE sp_eliminar_usuario(

    IN p_id CHAR(36)

)

BEGIN

    UPDATE usuarios

    SET

        activo = false,
        actualizado_en = NOW()

    WHERE id = p_id;

END $$

DELIMITER ;