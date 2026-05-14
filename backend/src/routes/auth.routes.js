const express = require('express');

const router = express.Router();

const authController =
    require('../controllers/auth.controller');

const authMiddleware =
    require('../middlewares/auth.middleware');

router.post(
    '/login',
    authController.login
);

router.get(
    '/me',
    authMiddleware,
    (req, res) => {

        return res.json(req.user);

    }
);

router.post(
    '/forgot-password',
    authController.forgotPassword
);

router.post(
    '/reset-password',
    authController.resetPassword
);

module.exports = router;