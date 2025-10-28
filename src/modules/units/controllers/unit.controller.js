// src/modules/units/controllers/unit.controller.js
const UnitService = require("../services/unit.service");

const UnitValidator = require("../validators/unit.validator");

class UnitController {
    async createUnit(req, res) {

        const { error, value } = UnitValidator.createUnitSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ success: false, errors: error.details.map((e) => e.message) });
        }

        const unit = await UnitService.createUnit(value);
        return res.status(201).json({ success: true, message: "Unit created successfully", data: unit });
    }

    
    async getUnits(req, res) {
        const units = await UnitService.getAllUnits();
        return res.status(200).json({ success: true, data: units });
    }

    async getUnit(req, res) {
        const unit = await UnitService.getUnitById(req.params.id);
        if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });
        return res.status(200).json({ success: true, data: unit });
    }

    async updateUnit(req, res) {

        const { error, value } = UnitValidator.updateUnitSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ success: false, errors: error.details.map((e) => e.message) });
        }

        const unit = await UnitService.updateUnit(req.params.id, value);
        if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });

        return res.status(200).json({ success: true, message: "Unit updated successfully", data: unit });
    }

    async deleteUnit(req, res) {
        const unit = await UnitService.deleteUnit(req.params.id);
        if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });

        return res.status(200).json({ success: true, message: "Unit deleted successfully" });
    }
    async getOwnerVacantUnits(req, res) {
        try {
            const { ownerId } = req.params;
            if (!ownerId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Owner ID is required" 
                });
            }
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(ownerId)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid Owner ID format" 
                });
            }

            const vacantUnits = await UnitService.getOwnerVacantUnits(ownerId);

            return res.status(200).json({ 
                success: true, 
                message: "Vacant units retrieved successfully",
                data: vacantUnits 
            });

        } catch (error) {
            console.error("Error in getOwnerVacantUnits:", error);
            return res.status(500).json({ 
                success: false, 
                message: "Internal server error",
                error: error.message 
            });
        }
    }
}

module.exports = new UnitController();
