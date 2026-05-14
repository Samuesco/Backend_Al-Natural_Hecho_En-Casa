const prisma = require('../config/prisma');



const listarUsuarios = async () => {

    return await prisma.$queryRawUnsafe(`

        CALL sp_listar_usuarios();

    `);

};



module.exports = {

    listarUsuarios

};