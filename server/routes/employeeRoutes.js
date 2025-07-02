const express = require('express');
const router = express.Router();
const { signupEmployee,  loginEmployee, logoutEmployee , getCurrentEmployee } = require('../controller/employeeController');

router.post('/signup', signupEmployee);
router.post('/login', loginEmployee); 
router.post('/logout', logoutEmployee);
router.get('/me', getCurrentEmployee);

module.exports = router;
