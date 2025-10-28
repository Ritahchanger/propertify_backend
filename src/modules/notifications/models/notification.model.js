const { sequelize, DataTypes } = require('../../../database-config/database-config');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  channel: {
    type: DataTypes.ENUM('email', 'sms', 'whatsapp', 'system'),
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed'),
    defaultValue: 'pending',
  },
  sentAt: {
    type: DataTypes.DATE,
    field: 'sent_at',
  },
}, {
  tableName: 'notifications',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});


module.exports = Notification;