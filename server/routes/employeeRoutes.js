const express = require('express');
const router = express.Router();
const { signupEmployee,  loginEmployee  } = require('../controller/employeeController');

router.post('/signup', signupEmployee);
router.post('/login', loginEmployee); 

module.exports = router;
