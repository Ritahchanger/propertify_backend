const express = require('express');

const EstateController = require('../controllers/estate.controller');

const asyncHandler = require('../../../shared/middlewares/async-thunk/asyncWrapper');





const Router = express.Router();

Router.post('/', asyncHandler(EstateController.createEstate));

Router.get('/', asyncHandler(EstateController.getEstates));

Router.get('/:id', asyncHandler(EstateController.getEstateById));

Router.get("/:estateId/units", asyncHandler(EstateController.getEstateWithUnits));


module.exports = Router;
