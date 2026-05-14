DELIMITER $$

DROP FUNCTION IF EXISTS fn_limpiar_texto $$

CREATE FUNCTION fn_limpiar_texto(

    texto TEXT

)

RETURNS TEXT

DETERMINISTIC

RETURN LOWER(

    REPLACE(

        REPLACE(

            REPLACE(

                REPLACE(

                    REPLACE(

                        TRIM(texto),

                        'á',
                        'a'

                    ),

                    'é',
                    'e'

                ),

                'í',
                'i'

            ),

            'ó',
            'o'

        ),

        'ú',
        'u'

    )

) COLLATE utf8mb4_general_ci $$

DELIMITER ;