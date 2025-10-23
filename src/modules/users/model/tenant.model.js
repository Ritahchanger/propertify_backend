const {
  sequelize,
  DataTypes,
} = require("../../../database-config/database-config");
const TenantApplication = sequelize.define(
  "TenantApplication",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    unitId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "unit_id",
    },
    applicantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "applicant_id",
    },
    preferredMoveInDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "preferred_move_in_date",
    },
    rentDurationMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "rent_duration_months",
      validate: {
        min: 1,
      },
    },
    applicationStatus: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "withdrawn"),
      defaultValue: "pending",
      field: "application_status",
    },
    employmentLetterUrl: {
      type: DataTypes.TEXT,
      field: "employment_letter_url",
    },
    idCopyUrl: {
      type: DataTypes.TEXT,
      field: "id_copy_url",
    },
    kraPin: {
      type: DataTypes.STRING(20),
      field: "kra_pin",
    },
    emergencyContactName: {
      type: DataTypes.STRING(100),
      field: "emergency_contact_name",
    },
    emergencyContactPhone: {
      type: DataTypes.STRING(20),
      field: "emergency_contact_phone",
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      field: "rejection_reason",
    },
    appliedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "applied_at",
    },
    reviewedAt: {
      type: DataTypes.DATE,
      field: "reviewed_at",
    },
    reviewedBy: {
      type: DataTypes.UUID,
      field: "reviewed_by",
    },
  },
  {
    tableName: "tenant_applications",
    underscored: true,
    timestamps: false,
  }
);

module.exports = TenantApplication;
