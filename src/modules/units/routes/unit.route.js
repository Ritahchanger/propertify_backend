// src/modules/units/routes/unit.routes.js
const express = require("express");
const UnitController = require("../controllers/unit.controller");
const asyncWrapper = require("../../../shared/middlewares/async-thunk/asyncWrapper");

const Route = express.Router();

Route.post("/", asyncWrapper(UnitController.createUnit));
Route.get("/", asyncWrapper(UnitController.getUnits));
Route.get("/:id", asyncWrapper(UnitController.getUnit));
Route.put("/:id", asyncWrapper(UnitController.updateUnit));
Route.delete("/:id", asyncWrapper(UnitController.deleteUnit));

module.exports = Route;
