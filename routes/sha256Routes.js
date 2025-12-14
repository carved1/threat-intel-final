const express = require('express');
const router = express.Router();
const { Sha256 } = require('../database/models');
const { Op } = require('sequelize');
const { authenticate, authorize } = require('../middleware/auth');

// GET all SHA256 hashes with pagination and filtering
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, threat_type, malware, reporter, min_confidence } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (threat_type) where.threat_type = threat_type;
    if (malware) where.malware = { [Op.like]: `%${malware}%` };
    if (reporter) where.reporter = reporter;
    if (min_confidence) where.confidence_level = { [Op.gte]: parseInt(min_confidence) };
    
    const { count, rows } = await Sha256.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['first_seen_utc', 'DESC']]
    });
    
    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: rows
    });
  } catch (error) {
    next(error);
  }
});

// GET single SHA256 hash by ID
router.get('/:id', async (req, res, next) => {
  try {
    const sha256 = await Sha256.findByPk(req.params.id);
    
    if (!sha256) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'SHA256 hash not found'
      });
    }
    
    res.json(sha256);
  } catch (error) {
    next(error);
  }
});

// POST create new SHA256 hash (researcher/admin only)
router.post('/', authenticate, authorize('researcher', 'admin'), async (req, res, next) => {
  try {
    const sha256 = await Sha256.create(req.body);
    res.status(201).json(sha256);
  } catch (error) {
    next(error);
  }
});

// PUT update SHA256 hash (researcher/admin only)
router.put('/:id', authenticate, authorize('researcher', 'admin'), async (req, res, next) => {
  try {
    const sha256 = await Sha256.findByPk(req.params.id);
    
    if (!sha256) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'SHA256 hash not found'
      });
    }
    
    await sha256.update(req.body);
    res.json(sha256);
  } catch (error) {
    next(error);
  }
});

// DELETE SHA256 hash (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const sha256 = await Sha256.findByPk(req.params.id);
    
    if (!sha256) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'SHA256 hash not found'
      });
    }
    
    await sha256.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
