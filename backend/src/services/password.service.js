const crypto = require('crypto');

const prisma =
    require('../config/prisma');

const {
    sendMail
} = require('./mail.service');

const {
    hashPassword
} = require('../utils/hash');

const forgotPassword =
    async (correo) => {

        const user =
            await prisma.usuarios.findUnique({

                where: {
                    correo
                }

            });

        if (!user) {

            return;

        }

        const token =
            crypto.randomBytes(32)
                .toString('hex');

        const expiration =
            new Date(
                Date.now() +
                1000 * 60 * 30
            );

        await prisma.usuarios.update({

            where: {
                id: user.id
            },

            data: {

                token_recuperacion:
                    token,

                expira_recuperacion:
                    expiration

            }

        });

        const resetLink =

            `${process.env.FRONTEND_RESET_URL}?token=${token}`;

        await sendMail(

            user.correo,

            'Recuperar contraseña',

            `
            <h2>Recuperar contraseña</h2>

            <p>
                Haz click:
            </p>

            <a href="${resetLink}">
                Recuperar contraseña
            </a>
            `

        );

    };

const resetPassword =
    async (
        token,
        password
    ) => {

        const user =
            await prisma.usuarios.findFirst({

                where: {

                    token_recuperacion:
                        token,

                    expira_recuperacion: {
                        gt: new Date()
                    }

                }

            });

        if (!user) {

            throw new Error(
                'Token inválido'
            );

        }

        const hashedPassword =
            await hashPassword(
                password
            );

        await prisma.usuarios.update({

            where: {
                id: user.id
            },

            data: {

                password:
                    hashedPassword,

                token_recuperacion:
                    null,

                expira_recuperacion:
                    null

            }

        });

    };

module.exports = {

    forgotPassword,

    resetPassword

};