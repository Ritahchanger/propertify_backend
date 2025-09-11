const express = require('express');
const EstateController = require('../controllers/estate.controller');
const asyncHandler = require('../../../shared/middlewares/async-thunk/asyncWrapper');
const { requireRole, requirePermission } = require('../../../modules/auth/roles/roleAuth');

const Router = express.Router();


Router.post('/',
    requireRole(['owner', 'manager']),
    asyncHandler(EstateController.createEstate)
);


// Router.get('/',

//     asyncHandler(EstateController.getEstates)
// );


Router.get('/',
    requireRole(['owner', 'manager', 'tenant', 'accountant']),
    asyncHandler(EstateController.getEstates)
);


Router.get('/:id',
    requireRole(['owner', 'manager', 'tenant', 'accountant']),
    asyncHandler(EstateController.getEstateById)
);


Router.get("/:estateId/units",
    requireRole(['owner', 'manager', 'tenant', 'accountant']),
    asyncHandler(EstateController.getEstateWithUnits)
);


module.exports = Router;