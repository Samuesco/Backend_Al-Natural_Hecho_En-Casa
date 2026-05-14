const express = require('express');

const cors = require('cors');

const authRoutes =
    require('./routes/auth.routes');

const errorMiddleware =
    require('./middlewares/error.middleware');

const authMiddleware = require('./middlewares/auth.middleware');
const app = express();
const usuariosRoutes = require('./routes/usuarios.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const ingredientesRoutes = require('./routes/ingredientes.routes');
const recipientesRoutes = require('./routes/recipientes.routes');
const productosRoutes = require('./routes/productos.routes');
const systemRoutes = require('./routes/system.routes');

const helmet = require('helmet'); // Agrega headers de seguridad

const rateLimit =require('express-rate-limit');


const limiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 100,

    message: {

        ok: false,

        message:
            'Demasiadas solicitudes'

    }

});

/*
|--------------------------------------------------------------------------
| MIDDLEWARES
|--------------------------------------------------------------------------
*/

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(limiter);


/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

app.use('/api/auth', authRoutes);

app.use(
    '/api/usuarios',
    authMiddleware,
    usuariosRoutes
);

app.use(
    '/api/categorias',
    authMiddleware,
    categoriasRoutes
);

app.use(
    '/api/ingredientes',
    authMiddleware,
    ingredientesRoutes
);

app.use(
    '/api/recipientes',
    authMiddleware,
    recipientesRoutes
);

app.use(
    '/api/productos',
    authMiddleware,
    productosRoutes
);

app.use(

    '/api/system',

    authMiddleware,

    systemRoutes

);

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get('/health', (req, res) => {

    return res.status(200).json({

        ok: true,

        message:
            'API funcionando correctamente'

    });

});
/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use(errorMiddleware);



module.exports = app;