const prisma =
    require('../config/prisma');

const {
    comparePassword
} = require('../utils/hash');

const {
    generateToken
} = require('../utils/jwt');

const login = async (
    correo,
    password
) => {

    const user =
        await prisma.usuarios.findUnique({

            where: {
                correo
            }

        });

    if (!user) {

        throw new Error(
            'Credenciales inválidas'
        );

    }

    const validPassword =
        await comparePassword(
            password,
            user.password
        );

    if (!validPassword) {

        throw new Error(
            'Credenciales inválidas'
        );

    }

    const token =
        generateToken(user);

    return {

        token,

        user: {

            id: user.id,

            nombre: user.nombre,

            correo: user.correo

        }

    };

};

module.exports = {
    login
};