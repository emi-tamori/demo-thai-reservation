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
    .route('/staffs/:name')
    .delete(controller.staffDelete);

router
    .route('/shifts')
    .post(controller.shiftsRegistration);

router
    .route('/reservation')
    .put(controller.updateReservation);

router 
    .route('/reservation/:name')
    .delete(controller.deleteReservation);

router
    .route('/reservation')
    .post(controller.createReservation);

router
    .route('/judge-staff')
    .post(controller.judgeStaff);

module.exports = router;