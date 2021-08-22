const express = require('express');
const router = express.Router();
const { validateSession } = require('../middleware');
const { LogModel } = require('../models');
const Log = require('../models/log');

/*
=========================
   CREATE LOG
=========================
*/
router.post('/', validateSession, async (req, res) => {
  const { description, definition, result } = req.body;
  const { id } = req.user;
  // const id = 1;
  const logEntry = {
    description,
    definition,
    result,
    owner_id: id,
  };

  console.log('Log Entry -->', logEntry);

  try {
    const newLog = await LogModel.create(logEntry);

    res.status(201).json({
      message: 'Log successfully created',
      newLog,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to create log',
      error: err,
    });
  }
});

/*
=========================
   GET ALL LOGS FOR USER
=========================
*/

router.get('/', async (req, res) => {
  try {
    const allLogs = await LogModel.findAll();

    res.status(200).json(allLogs);
  } catch (err) {
    res.status(500).json({
      message: `Server error ${err}`,
    });
  }
});

/*
=========================
   GET LOGS FOR USER BY ID
=========================
*/

router.get('/:id', validateSession, async (req, res) => {
  // another method to get params id using destructure --> const { id } = req.params;

  const userId = req.params.id;

  try {
    const logsById = await LogModel.findAll({
      where: {
        owner_id: userId,
      },
    });
    res.status(200).json(logsById);
  } catch (err) {
    res.status(500).json({
      message: 'Unable to get logs by User ID',
      error: err,
    });
  }
});

/*
=========================
   UPDATE LOGS
=========================
*/

router.put('/:id', validateSession, async (req, res) => {
  const { description, definition, result } = req.body;

  const updateLog = {
    description,
    definition,
    result,
  };

  const logId = req.params.id;
  const userId = req.user.id;

  console.log('Log id -->', logId);
  console.log('User ID -->', userId);

  const query = {
    where: {
      id: logId,
      owner_id: userId,
    },
    returning: true,
  };

  try {
    const updated = await LogModel.update(updateLog, query);
    res.status(200).json({
      message: 'Log successfully updated',
      updated,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to update log',
      error: err,
    });
  }
});

/*
=========================
   DELETE LOGS
=========================
*/

router.delete('/:id', validateSession, async (req, res) => {
  const logId = req.params.id;
  const userId = req.user.id;

  const query = {
    where: {
      id: logId,
      owner_id: userId,
    },
    returning: true,
  };

  try {
    const deletedLog = await LogModel.destroy(query);

    res.status(200).json({
      message: 'Journal entry deleted',
      deletedLog,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Server cannot delete log',
      error: err,
    });
  }
});

module.exports = router;
