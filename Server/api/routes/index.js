/* eslint-disable max-len */
/* eslint-disable max-statements */

var express = require('express');
var router = express.Router();

var userController = require('../controllers/UserController');
var ActivityController = require('../controllers/ActivityController');
var profileController = require('../controllers/ProfileController');
var contentController = require('../controllers/ContentController');
var adminController = require('../controllers/AdminController');


var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({
    data: null,
    error: null,
    msg: 'User Is Not Logged In!'
  });
};

var isNotAuthenticated = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  return res.status(403).json({
    data: null,
    error: null,
    msg: 'User Is Already Logged In!'
  });
};

module.exports = function (passport) {

  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.send('Server Works');
  });

  // --------------------- Activity Contoller -------------------- //
  router.get('/activities', ActivityController.getActivities);
  router.get('/activities/:activityId', ActivityController.getActivity);
  router.post('/activities', ActivityController.postActivity);
  // --------------------- End of Activity Controller ------------ //

  // ---------------------- User Controller ---------------------- //
  router.post('/signup', isNotAuthenticated, passport.authenticate('local-signup'), userController.signUp);
  router.post('/signin', isNotAuthenticated, passport.authenticate('local-signin'), userController.signIn);
  // ---------------------- End of User Controller --------------- //

  // -------------- Admin Contoller ---------------------- //
  router.get('/admin/VerifiedContributerRequests', adminController.getVCRs);
  router.get(
    '/admin/PendingContentRequests',
    adminController.viewPendingContReqs
  );
  router.patch(
    '/admin/RespondContentRequest/:ContentRequestId',
    adminController.respondContentRequest
  );
  // --------------End Of Admin Contoller ---------------------- //


  //-------------------- Profile Module Endpoints ------------------//
  router.post(
    '/profile/VerifiedContributerRequest',
    profileController.requestUserValidation
  );
  router.get(
    '/profile/:username',
    profileController.getUserInfo
  );
  // router.get(
  //   '/profile/LinkAnotherParent/:parentID',
  //   profileController.linkAnotherParent
  // );


  //  router.get('/profile/:userId/getChildren', profileController.getProduct);
  //------------------- End of Profile module Endpoints-----------//

    // --------------Content Module Endpoints---------------------- //

    // Content Managemen

    // Create a category
    router.post('/content/category', contentController.createCategory);
    // Create a section

    router.patch(
      '/content/category/:id/section',
      contentController.createSection
    );

    //Category retrieval
    router.get('/content/category', contentController.getCategories);


    // Content Retrieval

    // Get a page of content
    router.get(
      '/content/getContentPage/:numberOfEntriesPerPage' +
      '/:pageNumber/:category/:section',
      contentController.getContentPage
    );

    // Get the contents of a user
    router.get(
      '/content/username/:creator/:pageSize/:pageNumber',
      contentController.getContentByCreator
    );

    // Get content by id
    router.get(
      '/content/view/:id',
      contentController.getContentById
    );

    // Get Categories
    router.get(
      '/content/category',
      contentController.getCategories
    );

    //Content Production

    // Create new Content
    router.post('/content', contentController.createContent);


    // -------------------------------------------------------------------- //
  module.exports = router;

  return router;
};

