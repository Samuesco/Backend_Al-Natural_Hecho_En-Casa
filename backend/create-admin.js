require('dotenv').config();

const prisma = require('./src/config/prisma');

const bcrypt = require('bcrypt');

async function main() {

    try {

        const password = await bcrypt.hash('admin123', 10);

        await prisma.usuarios.create({
            data: {
                nombre: 'Administrador Principal',
                apellidos: 'Sistema',
                identificacion: '0000000000',
                correo: 'alnatural.hechoencasa@pruebas.com',
                password
            }
        });

        console.log('Administrador creado');

    } catch (error) {

        console.log(error);

    } finally {

        await prisma.$disconnect();

    }

}
main();