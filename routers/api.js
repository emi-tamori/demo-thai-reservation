const express = require('express');
const router = express.Router();
const controller = require('../controllers/api');

router
    .route('/')
    .get(controller.getData);

router 
    .route('/users/:id')
    .post(controller.putUser);

router 
    .route('/staffs')
    .get(controller.getStaffs);

router 
    .route('/staffs')
    .post(controller.staffRegistration);

router
    .route('/shifts')
    .post(controller.shiftsRegistration);

module.exports = router;