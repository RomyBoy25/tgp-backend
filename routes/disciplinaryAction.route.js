const express = require('express');

const router = express.Router();

const {
  createDisciplinaryAction,
  getDisciplinaryActions,
  getMemberDisciplinaryActions,
  getDisciplinaryActionById,
  receiveDisciplinaryAction,
  deleteDisciplinaryAction,
} = require('../controllers/disciplinaryAction.controller');

// =========================================================
// GET ALL DISCIPLINARY ACTIONS
// =========================================================

router.get(
  '/',
  getDisciplinaryActions
);

// =========================================================
// CREATE DISCIPLINARY ACTION
// =========================================================

router.post(
  '/',
  createDisciplinaryAction
);

// =========================================================
// GET MEMBER DISCIPLINARY ACTIONS
// =========================================================

router.get(
  '/member/:memberId',
  getMemberDisciplinaryActions
);

// =========================================================
// GET SINGLE DISCIPLINARY ACTION
// =========================================================

router.get(
  '/:id',
  getDisciplinaryActionById
);

// =========================================================
// RECEIVE DISCIPLINARY ACTION
// =========================================================

router.patch(
  '/:id/receive',
  receiveDisciplinaryAction
);

// =========================================================
// DELETE DISCIPLINARY ACTION
// =========================================================

router.delete(
  '/:id',
  deleteDisciplinaryAction
);

module.exports = router;