const authService = require('../services/auth.service');

const login = async (req, res) => {

    try {

        const { correo, password } = req.body;

        const result = await authService.login(
            correo,
            password
        );

        res.json(result);

    } catch (error) {

        res.status(401).json({
            message: error.message
        });

    }

};

// Agrega aquí las funciones forgotPassword y resetPassword
const passwordService =
    require('../services/password.service');

const forgotPassword =
    async (req, res) => {

        try {

            const { correo } =
                req.body;

            await passwordService
                .forgotPassword(correo);

            return res.json({

                message:
                    'Si el correo existe se enviará recuperación'

            });

        } catch (error) {

            return res.status(500).json({

                message:
                    error.message

            });

        }

    };

const resetPassword =
    async (req, res) => {

        try {

            const {
                token,
                password
            } = req.body;

            await passwordService
                .resetPassword(
                    token,
                    password
                );

            return res.json({

                message:
                    'Contraseña actualizada'

            });

        } catch (error) {

            return res.status(400).json({

                message:
                    error.message

            });

        }

    };

module.exports = {
     login,

    forgotPassword,

    resetPassword

};