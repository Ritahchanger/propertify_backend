class TenantsUtil {
  formatTenantData(application) {
    const applicant = application.applicant;
    const unit = application.unit;
    const estate = unit.estate;

    return {
      tenantId: applicant.id,
      applicationId: application.id,
      personalInfo: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        email: applicant.email,
        phone: applicant.phone,
        idNumber: applicant.idNumber,
        role: applicant.role,
        status: applicant.status,
      },
      applicationDetails: {
        status: application.applicationStatus,
        appliedAt: application.appliedAt,
        reviewedAt: application.reviewedAt,
        preferredMoveInDate: application.preferredMoveInDate,
        rentDurationMonths: application.rentDurationMonths,
      },
      emergencyContact: {
        name: application.emergencyContactName || "",
        phone: application.emergencyContactPhone || "",
        relationship: "", // You might want to add this field to your TenantApplication model
      },
      unitDetails: {
        unitId: unit.id,
        unitNumber: unit.unitNumber,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        monthlyRent: unit.monthlyRent,
        unitType: unit.unitType,
        status: unit.status,
        floorArea: unit.floorArea,
      },
      estateDetails: {
        estateId: estate.id,
        estateName: estate.name,
        location: estate.location,
        description: estate.description,
        status: estate.status,
      },
      ownerDetails: {
        ownerId: estate.owner.id,
        ownerName: `${estate.owner.firstName} ${estate.owner.lastName}`,
        ownerEmail: estate.owner.email,
        ownerPhone: estate.owner.phone,
      },
    };
  }
}

module.exports = new TenantsUtil();
