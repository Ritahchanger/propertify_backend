const EstateService = require('../services/estate.service');
const EstateValidation = require('../validators/estate.validation');

class EstateController {

    static async getEstateWithUnits(req, res) {

        const { estateId } = req.params;
        const estate = await EstateService.getEstateWithUnits(estateId);

        return res.status(200).json({
            success: true,
            data: estate,
        });

    }
    static async createEstate(req, res) {
        const { error, value } = EstateValidation.createEstateSchema.validate(req.body);
        if (error) {
            const errObj = new Error(error.details[0].message);
            errObj.statusCode = 400;
            throw errObj;
        }

        const estate = await EstateService.createEstate(value);
        return res.status(201).json({ message: 'Estate created successfully', estate });
    }

    static async getEstates(req, res) {
        const estates = await EstateService.getAllEstates();
        return res.status(200).json(estates);
    }

    static async getEstateNamesByOwner(req, res) {
        const { ownerId } = req.params;
        const estatesNames = await EstateService.getEstateNamesByOwner(ownerId);
        return res.status(200).json(estatesNames);
    }

    static async getEstateById(req, res) {
        const { id } = req.params;
        const estate = await EstateService.getEstateById(id);
        if (!estate) {
            const errObj = new Error("Estate not found");
            errObj.statusCode = 404;
            throw errObj;
        }
        return res.status(200).json(estate);
    }


    static async getEstatesByOwnerPaginated(req, res) {
        const { ownerId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!ownerId) {
            const errObj = new Error("Owner ID is required");
            errObj.statusCode = 400;
            throw errObj;
        }

        const result = await EstateService.getEstatesByOwnerPaginated(
            ownerId, 
            parseInt(page), 
            parseInt(limit)
        );
        
        return res.status(200).json({
            success: true,
            ...result
        });
    }

    static async getOwnerApplications(req, res) {
        
            const ownerId = req.user.id; 
            const { page = 1, limit = 10, status } = req.query;

            const result = await EstateService.getApplicationsByOwner(
                ownerId, 
                parseInt(page), 
                parseInt(limit), 
                status
            );

            res.status(200).json({
                success: true,
                ...result
            });
        
        }

        static async getOwnerApplicationsStats(req, res) {
          
                const ownerId = req.user.id;
    
                const stats = await EstateService.getApplicationsStatsByOwner(ownerId);
    
                res.status(200).json({
                    success: true,
                    data: stats
                });
    
            }




            static async getEstateApplications(req, res) {
                
                    const ownerId = req.user.id;
                    const { estateId } = req.params;
                    const { page = 1, limit = 10 } = req.query;
        
                    const result = await EstateService.getApplicationsByEstate(
                        ownerId,
                        estateId,
                        parseInt(page),
                        parseInt(limit)
                    );
        
                    res.status(200).json({
                        success: true,
                        ...result
                    });
                
            
            }


            static async getOwnerApplicationById(req, res) {
            
                    const ownerId = req.user.id;
                    const { applicationId } = req.params;

                    const application = await EstateService.getApplicationById(applicationId);
                    
                    if (!application) {
                        return res.status(404).json({
                            success: false,
                            message: "Application not found"
                        });
                    }
        
                    const isOwnerApplication = await EstateService.verifyApplicationOwnership(
                        applicationId, 
                        ownerId
                    );
        
                    if (!isOwnerApplication) {
                        return res.status(403).json({
                            success: false,
                            message: "Access denied. This application does not belong to your estate."
                        });
                    }
        
                    res.status(200).json({
                        success: true,
                        data: application
                    });
               
            }



            static async updateApplicationStatus(req, res) {
                
                    const ownerId = req.user.id;
                    const { applicationId } = req.params;
                    const { status, rejectionReason } = req.body;
        
                    // Validate required fields
                    if (!status) {
                        return res.status(400).json({
                            success: false,
                            message: "Status is required"
                        });
                    }
        
                    // Verify that the application belongs to the owner's estate
                    const isOwnerApplication = await EstateService.verifyApplicationOwnership(
                        applicationId, 
                        ownerId
                    );
        
                    if (!isOwnerApplication) {
                        return res.status(403).json({
                            success: false,
                            message: "Access denied. This application does not belong to your estate."
                        });
                    }
        
                    const updatedApplication = await EstateService.updateApplicationStatus(
                        applicationId,
                        status,
                        ownerId,
                        rejectionReason
                    );
        
                    res.status(200).json({
                        success: true,
                        message: `Application status updated to '${status}'`,
                        data: updatedApplication
                    });
                
                }
    

}

module.exports = EstateController;
