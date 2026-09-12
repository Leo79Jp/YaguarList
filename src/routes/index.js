const express = require('express');
const router = express.Router();
const defaultList = require('../data/defaultList');

router.get('/', (req, res) => {
  res.render('pages/index', { 
    title: 'YaguarList',
    items: defaultList 
  });
});

module.exports = router;