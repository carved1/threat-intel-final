const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Sha256 = sequelize.define('Sha256', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ioc_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  ioc_value: {
    type: DataTypes.STRING(64),
    allowNull: false,
    validate: {
      len: [64, 64],
      is: /^[a-f0-9]{64}$/i
    }
  },
  threat_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  malware: {
    type: DataTypes.STRING,
    allowNull: true
  },
  malware_printable: {
    type: DataTypes.STRING,
    allowNull: true
  },
  confidence_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  first_seen_utc: {
    type: DataTypes.DATE,
    allowNull: false
  },
  last_seen_utc: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reference: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reporter: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'sha256_hashes',
  timestamps: true
});

module.exports = Sha256;
