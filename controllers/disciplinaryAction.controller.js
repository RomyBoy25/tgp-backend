const DisciplinaryAction = require('../model/disciplinaryAction.model');
const User = require('../model/user.model');

// =========================================================
// CREATE DISCIPLINARY ACTION
// POST /api/disciplinary-actions
// =========================================================
exports.createDisciplinaryAction = async (req, res) => {
  try {
    const {
      member,
      count,
      description,
      issuedAt,
    } = req.body;

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------
    if (!member) {
      return res.status(400).json({
        result: false,
        message: 'Member is required.',
      });
    }

    if (!count || Number(count) < 1) {
      return res.status(400).json({
        result: false,
        message: 'DA count must be at least 1.',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        result: false,
        message: 'Description is required.',
      });
    }

    // -------------------------------------------------------
    // CHECK MEMBER
    // -------------------------------------------------------
    const memberExists = await User.findById(member);

    if (!memberExists) {
      return res.status(404).json({
        result: false,
        message: 'Member not found.',
      });
    }

    // -------------------------------------------------------
    // CREATE DA
    // issuedBy comes from authenticated user
    // -------------------------------------------------------
    const disciplinaryAction =
      await DisciplinaryAction.create({
        member,
        issuedBy: req.user._id,
        count: Number(count),
        description: description.trim(),
        issuedAt: issuedAt || new Date(),
        status: 'Pending',
      });

    // -------------------------------------------------------
    // POPULATE RESPONSE
    // -------------------------------------------------------
    const populatedDA =
      await DisciplinaryAction.findById(
        disciplinaryAction._id
      )
        .populate(
          'member',
          'firstName lastName displayPic'
        )
        .populate(
          'issuedBy',
          'firstName lastName displayPic'
        )
        .populate(
          'reportedTo',
          'firstName lastName displayPic'
        );

    return res.status(201).json({
      result: true,
      message:
        'Disciplinary action issued successfully.',
      data: populatedDA,
    });
  } catch (error) {
    console.error(
      'Create Disciplinary Action Error:',
      error
    );

    return res.status(500).json({
      result: false,
      message:
        'Failed to create disciplinary action.',
      error: error.message,
    });
  }
};


// =========================================================
// GET ALL DISCIPLINARY ACTIONS
// GET /api/disciplinary-actions
// =========================================================
exports.getDisciplinaryActions = async (req, res) => {
  try {
    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.max(
      parseInt(req.query.limit) || 10,
      1
    );

    const search =
      req.query.search?.trim() || '';

    const status =
      req.query.status || '';

    const sortBy =
      req.query.sortBy || 'issuedAt';

    const sortOrder =
      req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // -------------------------------------------------------
    // BASE QUERY
    // -------------------------------------------------------
    const query = {};

    // -------------------------------------------------------
    // STATUS FILTER
    // -------------------------------------------------------
    if (status) {
      query.status = status;
    }

    // -------------------------------------------------------
    // SEARCH MEMBER / ISSUER / REPORTED TO / DESCRIPTION
    // -------------------------------------------------------
    if (search) {
      const matchingUsers = await User.find({
        $or: [
          {
            firstName: {
              $regex: search,
              $options: 'i',
            },
          },
          {
            lastName: {
              $regex: search,
              $options: 'i',
            },
          },
        ],
      }).select('_id');

      const userIds = matchingUsers.map(
        (user) => user._id
      );

      query.$or = [
        {
          member: {
            $in: userIds,
          },
        },
        {
          issuedBy: {
            $in: userIds,
          },
        },
        {
          reportedTo: {
            $in: userIds,
          },
        },
        {
          description: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    // -------------------------------------------------------
    // TOTAL RECORDS
    // -------------------------------------------------------
    const totalRecords =
      await DisciplinaryAction.countDocuments(query);

    // -------------------------------------------------------
    // GET DATA
    // -------------------------------------------------------
    const data =
      await DisciplinaryAction.find(query)
        .populate(
          'member',
          'firstName lastName displayPic'
        )
        .populate(
          'issuedBy',
          'firstName lastName displayPic'
        )
        .populate(
          'reportedTo',
          'firstName lastName displayPic'
        )
        .sort({
          [sortBy]: sortOrder,
        })
        .skip(skip)
        .limit(limit);

    // -------------------------------------------------------
    // PAGINATION
    // -------------------------------------------------------
    const totalPages = Math.ceil(
      totalRecords / limit
    );

    return res.status(200).json({
      result: true,
      message:
        'Disciplinary actions retrieved successfully.',
      data,
      pagination: {
        total: totalRecords,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    });
  } catch (error) {
    console.error(
      'Get Disciplinary Actions Error:',
      error
    );

    return res.status(500).json({
      result: false,
      message:
        'Failed to retrieve disciplinary actions.',
      error: error.message,
    });
  }
};


// =========================================================
// GET MEMBER DISCIPLINARY ACTIONS
// GET /api/disciplinary-actions/member/:memberId
// =========================================================
exports.getMemberDisciplinaryActions = async (
  req,
  res
) => {
  try {
    const { memberId } = req.params;

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.max(
      parseInt(req.query.limit) || 10,
      1
    );

    const search =
      req.query.search?.trim() || '';

    const status =
      req.query.status || '';

    const sortBy =
      req.query.sortBy || 'issuedAt';

    const sortOrder =
      req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // -------------------------------------------------------
    // CHECK MEMBER
    // -------------------------------------------------------
    const memberExists =
      await User.findById(memberId);

    if (!memberExists) {
      return res.status(404).json({
        result: false,
        message: 'Member not found.',
      });
    }

    // -------------------------------------------------------
    // QUERY
    // -------------------------------------------------------
    const query = {
      member: memberId,
    };

    // -------------------------------------------------------
    // STATUS
    // -------------------------------------------------------
    if (status) {
      query.status = status;
    }

    // -------------------------------------------------------
    // SEARCH
    // -------------------------------------------------------
    if (search) {
      const matchingUsers = await User.find({
        $or: [
          {
            firstName: {
              $regex: search,
              $options: 'i',
            },
          },
          {
            lastName: {
              $regex: search,
              $options: 'i',
            },
          },
        ],
      }).select('_id');

      const userIds = matchingUsers.map(
        (user) => user._id
      );

      query.$or = [
        {
          issuedBy: {
            $in: userIds,
          },
        },
        {
          reportedTo: {
            $in: userIds,
          },
        },
        {
          description: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    // -------------------------------------------------------
    // TOTAL
    // -------------------------------------------------------
    const totalRecords =
      await DisciplinaryAction.countDocuments(query);

    // -------------------------------------------------------
    // DATA
    // -------------------------------------------------------
    const data =
      await DisciplinaryAction.find(query)
        .populate(
          'member',
          'firstName lastName displayPic'
        )
        .populate(
          'issuedBy',
          'firstName lastName displayPic'
        )
        .populate(
          'reportedTo',
          'firstName lastName displayPic'
        )
        .sort({
          [sortBy]: sortOrder,
        })
        .skip(skip)
        .limit(limit);

    const totalPages = Math.ceil(
      totalRecords / limit
    );

    return res.status(200).json({
      result: true,
      message:
        'Member disciplinary actions retrieved successfully.',
      data,
      pagination: {
        total: totalRecords,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    });
  } catch (error) {
    console.error(
      'Get Member Disciplinary Actions Error:',
      error
    );

    return res.status(500).json({
      result: false,
      message:
        'Failed to retrieve member disciplinary actions.',
      error: error.message,
    });
  }
};


// =========================================================
// GET SINGLE DISCIPLINARY ACTION
// GET /api/disciplinary-actions/:id
// =========================================================
exports.getDisciplinaryActionById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const disciplinaryAction =
      await DisciplinaryAction.findById(id)
        .populate(
          'member',
          'firstName lastName displayPic'
        )
        .populate(
          'issuedBy',
          'firstName lastName displayPic'
        )
        .populate(
          'reportedTo',
          'firstName lastName displayPic'
        );

    if (!disciplinaryAction) {
      return res.status(404).json({
        result: false,
        message:
          'Disciplinary action not found.',
      });
    }

    return res.status(200).json({
      result: true,
      message:
        'Disciplinary action retrieved successfully.',
      data: disciplinaryAction,
    });
  } catch (error) {
    console.error(
      'Get Disciplinary Action Error:',
      error
    );

    return res.status(500).json({
      result: false,
      message:
        'Failed to retrieve disciplinary action.',
      error: error.message,
    });
  }
};


// =========================================================
// RECEIVE DISCIPLINARY ACTION
// PATCH /api/disciplinary-actions/:id/receive
// =========================================================
exports.receiveDisciplinaryAction = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      reportedTo,
      receivedAt,
    } = req.body;

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------
    if (!reportedTo) {
      return res.status(400).json({
        result: false,
        message:
          'Reported To member is required.',
      });
    }

    // -------------------------------------------------------
    // FIND DA
    // -------------------------------------------------------
    const disciplinaryAction =
      await DisciplinaryAction.findById(id);

    if (!disciplinaryAction) {
      return res.status(404).json({
        result: false,
        message:
          'Disciplinary action not found.',
      });
    }

    // -------------------------------------------------------
    // ALREADY RECEIVED
    // -------------------------------------------------------
    if (
      disciplinaryAction.status === 'Received'
    ) {
      return res.status(400).json({
        result: false,
        message:
          'This disciplinary action has already been received.',
      });
    }

    // -------------------------------------------------------
    // CHECK REPORTED TO USER
    // -------------------------------------------------------
    const reportedToUser =
      await User.findById(reportedTo);

    if (!reportedToUser) {
      return res.status(404).json({
        result: false,
        message:
          'Reported To member not found.',
      });
    }

    // -------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------
    disciplinaryAction.status = 'Received';

    disciplinaryAction.reportedTo =
      reportedTo;

    disciplinaryAction.receivedAt =
      receivedAt || new Date();

    await disciplinaryAction.save();

    // -------------------------------------------------------
    // POPULATE
    // -------------------------------------------------------
    const populatedDA =
      await DisciplinaryAction.findById(
        disciplinaryAction._id
      )
        .populate(
          'member',
          'firstName lastName displayPic'
        )
        .populate(
          'issuedBy',
          'firstName lastName displayPic'
        )
        .populate(
          'reportedTo',
          'firstName lastName displayPic'
        );

    return res.status(200).json({
      result: true,
      message:
        'Disciplinary action received successfully.',
      data: populatedDA,
    });
  } catch (error) {
    console.error(
      'Receive Disciplinary Action Error:',
      error
    );

    return res.status(500).json({
      result: false,
      message:
        'Failed to receive disciplinary action.',
      error: error.message,
    });
  }
};


// =========================================================
// DELETE DISCIPLINARY ACTION
// DELETE /api/disciplinary-actions/:id
// =========================================================
exports.deleteDisciplinaryAction = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const disciplinaryAction =
      await DisciplinaryAction.findById(id);

    if (!disciplinaryAction) {
      return res.status(404).json({
        result: false,
        message:
          'Disciplinary action not found.',
      });
    }

    // -------------------------------------------------------
    // PREVENT DELETE IF RECEIVED
    // -------------------------------------------------------
    if (
      disciplinaryAction.status === 'Received'
    ) {
      return res.status(400).json({
        result: false,
        message:
          'Received disciplinary actions cannot be deleted.',
      });
    }

    await DisciplinaryAction.findByIdAndDelete(id);

    return res.status(200).json({
      result: true,
      message:
        'Disciplinary action deleted successfully.',
    });
  } catch (error) {
    console.error(
      'Delete Disciplinary Action Error:',
      error
    );

    return res.status(500).json({
      result: false,
      message:
        'Failed to delete disciplinary action.',
      error: error.message,
    });
  }
};