/*
|--------------------------------------------------------------------------
| validaciones_costeo.sql
|--------------------------------------------------------------------------
|
| Funciones de validación financiera y distribución.
|
|--------------------------------------------------------------------------
*/

DELIMITER $$

DROP FUNCTION IF EXISTS fn_validar_distribucion_producto $$



CREATE FUNCTION fn_validar_distribucion_producto(

    p_producto_id CHAR(36)

)

RETURNS JSON

DETERMINISTIC

BEGIN

    /*
    |--------------------------------------------------------------------------
    | VARIABLES
    |--------------------------------------------------------------------------
    */

    DECLARE v_ml_producidos DECIMAL(14,2);

    DECLARE v_ml_distribuidos DECIMAL(14,2);

    DECLARE v_desperdicio_ml DECIMAL(14,2);

    DECLARE v_status VARCHAR(20);

    DECLARE v_mensaje TEXT;

    /*
    |--------------------------------------------------------------------------
    | ML PRODUCIDOS
    |--------------------------------------------------------------------------
    */

    SELECT

        IFNULL(

            SUM(cantidad_ml),

            0

        )

    INTO v_ml_producidos

    FROM recetas_producto_ingrediente

    WHERE producto_id = p_producto_id;

    /*
    |--------------------------------------------------------------------------
    | ML DISTRIBUIDOS
    |--------------------------------------------------------------------------
    */

    SELECT

        IFNULL(

            SUM(

                r.tamano_recipiente
                *
                pr.cantidad_unidades

            ),

            0

        )

    INTO v_ml_distribuidos

    FROM producto_recipiente pr

    INNER JOIN tipos_recipientes r
        ON r.id = pr.recipiente_id

    WHERE pr.producto_id = p_producto_id
    AND pr.activo = true
    AND r.activo = true;

    /*
    |--------------------------------------------------------------------------
    | DESPERDICIO
    |--------------------------------------------------------------------------
    */

    SET v_desperdicio_ml =

        v_ml_producidos
        -
        v_ml_distribuidos;

    /*
    |--------------------------------------------------------------------------
    | VALIDACIONES
    |--------------------------------------------------------------------------
    */

    IF v_ml_distribuidos > v_ml_producidos THEN

        SET v_status = 'ERROR';

        SET v_mensaje =
            'La distribución excede los ml producidos';

    ELSEIF v_ml_distribuidos < v_ml_producidos THEN

        SET v_status = 'WARNING';

        SET v_mensaje =
            'Existe producto sobrante sin distribuir';

    ELSE

        SET v_status = 'OK';

        SET v_mensaje =
            'Distribución válida';

    END IF;

    /*
    |--------------------------------------------------------------------------
    | RESPONSE JSON
    |--------------------------------------------------------------------------
    */

    RETURN JSON_OBJECT(

        'status',
        v_status,

        'mensaje',
        v_mensaje,

        'ml_producidos',
        v_ml_producidos,

        'ml_distribuidos',
        v_ml_distribuidos,

        'desperdicio_ml',
        v_desperdicio_ml

    );

END $$

DELIMITER ;