const jwt = require('jsonwebtoken');

const generateToken = (user) => {

    return jwt.sign(

        {
            id: user.id,
            correo: user.correo
        },

        process.env.JWT_SECRET,

        {
            expiresIn:
                process.env.JWT_EXPIRES
        }

    );

};

module.exports = {
    generateToken
};