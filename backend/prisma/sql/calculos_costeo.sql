/*
|--------------------------------------------------------------------------
| fn_calcular_costo_producto.sql
|--------------------------------------------------------------------------
|
| Motor financiero principal del sistema.
|
|--------------------------------------------------------------------------
*/

DELIMITER $$

DROP FUNCTION IF EXISTS fn_calcular_costo_producto $$

CREATE FUNCTION fn_calcular_costo_producto(

    p_producto_id CHAR(36)

)

RETURNS JSON

DETERMINISTIC

BEGIN

    /*
    |--------------------------------------------------------------------------
    | VARIABLES GENERALES
    |--------------------------------------------------------------------------
    */

    DECLARE v_nombre_producto VARCHAR(255);

    DECLARE v_porcentaje_ganancia DECIMAL(5,2);

    DECLARE v_porcentaje_perdida DECIMAL(5,2);

    DECLARE v_ml_producidos DECIMAL(14,2);

    DECLARE v_costo_ingredientes DECIMAL(14,2);

    DECLARE v_costo_gastos DECIMAL(14,2);

    DECLARE v_costo_total DECIMAL(14,2);

    DECLARE v_costo_ml DECIMAL(14,4);

    DECLARE v_validacion JSON;

    DECLARE v_presentaciones JSON;

    /*
    |--------------------------------------------------------------------------
    | OBTENER CONFIGURACIÓN PRODUCTO
    |--------------------------------------------------------------------------
    */

    SELECT

        nombre,
        porcentaje_ganancia,
        porcentaje_perdida,
        cantidad_ml

    INTO

        v_nombre_producto,
        v_porcentaje_ganancia,
        v_porcentaje_perdida,
        v_ml_producidos

    FROM productos_finales

    WHERE id = p_producto_id;

    /*
    |--------------------------------------------------------------------------
    | COSTO INGREDIENTES
    |--------------------------------------------------------------------------
    */

    SELECT

        IFNULL(

            SUM(

                cantidad_ml
                *
                precio_por_ml

            ),

            0

        )

    INTO v_costo_ingredientes

    FROM recetas_producto_ingrediente

    WHERE producto_id = p_producto_id;

    /*
    |--------------------------------------------------------------------------
    | COSTO GASTOS
    |--------------------------------------------------------------------------
    */

    SELECT

        IFNULL(

            SUM(valor),

            0

        )

    INTO v_costo_gastos

    FROM gastos

    WHERE producto_id = p_producto_id
    AND activo = true;

    /*
    |--------------------------------------------------------------------------
    | COSTO TOTAL
    |--------------------------------------------------------------------------
    */

    SET v_costo_total =

        v_costo_ingredientes
        +
        v_costo_gastos;

    /*
    |--------------------------------------------------------------------------
    | COSTO POR ML
    |--------------------------------------------------------------------------
    */

    IF v_ml_producidos > 0 THEN

        SET v_costo_ml =

            v_costo_total
            /
            v_ml_producidos;

    ELSE

        SET v_costo_ml = 0;

    END IF;

    /*
    |--------------------------------------------------------------------------
    | VALIDAR DISTRIBUCIÓN
    |--------------------------------------------------------------------------
    */

    SET v_validacion =

        fn_validar_distribucion_producto(
            p_producto_id
        );

    /*
    |--------------------------------------------------------------------------
    | CALCULAR PRESENTACIONES
    |--------------------------------------------------------------------------
    */

    SELECT

        JSON_ARRAYAGG(

            JSON_OBJECT(

                'recipiente_id',
                r.id,

                'nombre',
                r.nombre,

                'tamano_ml',
                r.tamano_recipiente,

                'valor_recipiente',
                r.valor,

                'cantidad_unidades',
                pr.cantidad_unidades,

                /*
                |--------------------------------------------------------------------------
                | COSTO CONTENIDO
                |--------------------------------------------------------------------------
                */

                'costo_contenido',

                ROUND(

                    r.tamano_recipiente
                    *
                    v_costo_ml,

                    2

                ),

                /*
                |--------------------------------------------------------------------------
                | COSTO UNITARIO
                |--------------------------------------------------------------------------
                */

                'costo_unitario',

                ROUND(

                    (
                        r.tamano_recipiente
                        *
                        v_costo_ml
                    )
                    +
                    r.valor,

                    2

                ),

                /*
                |--------------------------------------------------------------------------
                | PRECIO SUGERIDO
                |--------------------------------------------------------------------------
                */

                'precio_sugerido',

                ROUND(

                    (
                        (
                            r.tamano_recipiente
                            *
                            v_costo_ml
                        )
                        +
                        r.valor
                    )

                    *

                    (
                        1
                        +
                        (
                            (
                                v_porcentaje_ganancia
                                +
                                v_porcentaje_perdida
                            )
                            / 100
                        )
                    ),

                    2

                )

            )

        )

    INTO v_presentaciones

    FROM producto_recipiente pr

    INNER JOIN tipos_recipientes r
        ON r.id = pr.recipiente_id

    WHERE pr.producto_id = p_producto_id
    AND pr.activo = true
    AND r.activo = true;

    /*
    |--------------------------------------------------------------------------
    | RETORNAR JSON
    |--------------------------------------------------------------------------
    */

    RETURN JSON_OBJECT(

        'producto_id',
        p_producto_id,

        'nombre_producto',
        v_nombre_producto,

        'ml_producidos',
        v_ml_producidos,

        'costo_ingredientes',
        ROUND(v_costo_ingredientes, 2),

        'costo_gastos',
        ROUND(v_costo_gastos, 2),

        'costo_total',
        ROUND(v_costo_total, 2),

        'costo_por_ml',
        ROUND(v_costo_ml, 4),

        'porcentaje_ganancia',
        v_porcentaje_ganancia,

        'porcentaje_perdida',
        v_porcentaje_perdida,

        'validacion',
        v_validacion,

        'presentaciones',
        v_presentaciones

    );

END $$

DELIMITER ;