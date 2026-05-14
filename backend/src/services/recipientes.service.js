const prisma = require('../config/prisma');



const listarRecipientes = async () => {

    return await prisma.$queryRawUnsafe(`

        CALL sp_listar_recipientes();

    `);

};



module.exports = {

    listarRecipientes

};