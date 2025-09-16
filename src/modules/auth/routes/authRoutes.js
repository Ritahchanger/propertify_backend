const AuthController = require('../controllers/authController');


const { authMiddleware } = require('../middleware/authMiddleware');


const asyncWrapper = require("../../../shared/middlewares/async-thunk/asyncWrapper")



const Router = require('express').Router();



Router.post('/register', asyncWrapper(AuthController.register));



Router.post('/login', asyncWrapper(AuthController.login));



Router.post('/refresh-token', asyncWrapper(AuthController.refreshToken));



Router.post('/logout', authMiddleware, asyncWrapper(AuthController.logout));



Router.get('/me', authMiddleware, asyncWrapper(AuthController.me));



module.exports = Router;



