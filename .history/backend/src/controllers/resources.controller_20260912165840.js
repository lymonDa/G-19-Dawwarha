const Resource = require('../models/Resource');

const getResources = async (req, res, next) => {
  try {
    const {
      category,
      city,
      area,
      status,
      page,
      limit
    } = req.query;

    const filter = {};

    // Status
    if (status !== undefined) {
      if (typeof status !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const allowedStatuses = ['published', 'available'];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      filter.status = status;
    } else {
      filter.status = {
        $in: ['published', 'available']
      };
    }

    // Category
    if (category !== undefined) {
      if (typeof category !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }

      filter.categoryId = category;
    }

    // City
    if (city !== undefined) {
      if (typeof city !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid city'
        });
      }

      filter['location.city'] = city;
    }

    // Area
    if (area !== undefined) {
      if (typeof area !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid area'
        });
      }

      filter['location.area'] = area;
    }

    const currentPage = page ? Number(page) : 1;
    const currentLimit = limit ? Number(limit) : 20;

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page'
      });
    }

    if (
      !Number.isInteger(currentLimit) ||
      currentLimit < 1 ||
      currentLimit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit'
      });
    }

    const skip = (currentPage - 1) * currentLimit;

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(currentLimit),

      Resource.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: resources,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit)
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources
};