const prisma = require('../config/prisma');



const listarIngredientes = async () => {

    return await prisma.$queryRawUnsafe(`

        CALL sp_listar_ingredientes();

    `);

};



module.exports = {

    listarIngredientes

};