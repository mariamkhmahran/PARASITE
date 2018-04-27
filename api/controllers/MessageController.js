/* eslint-disable max-len */
/* eslint-disable max-statements */
/* eslint-disable object-shorthand */
/* eslint-disable complexity */

var mongoose = require('mongoose');
var moment = require('moment');
var Validations = require('../utils/validators');
var models = require('../models/Message');
var Message = mongoose.model('Message');
var User = mongoose.model('User');

// add a message to the messages collection in the DB
module.exports.sendMessage = function(req, res, next) {
  // Security Check
  delete req.body.sentAt;

  // create new entry in DB
  Message.create(req.body, function(err, msg) {
    if (err) {
      return next(err);
    }

    // return response message
    return res.status(200).json({
      data: msg,
      err: null,
      msg: 'Message was sent successfully.'
    });
  });
};

// get messages stored in the DB
// where the recipient is specified by an input parameter in the URL
module.exports.getInbox = function(req, res, next) {

  Message.find({ recipient: req.params.user }).sort({ sentAt: -1 }).
  exec(function(err, msgs) {
    if (err) {
      return next(err);
    }

    return res.status(200).json({
      data: msgs,
      err: null,
      msg: 'Inbox has been retreived successfully.'
      });
  });
};

// get messages stored in the DB
// where the sender is specified by an input parameter in the URL
module.exports.getSent = function(req, res, next) {

  Message.find({ sender: req.params.user }).sort({ sentAt: -1 }).
  exec(function(err, msgs) {
    if (err) {
      return next(err);
    }

    return res.status(200).json({
      data: msgs,
      err: null,
      msg: 'Sent messages have been retreived successfully.'
      });
  });
};

// delete a message from the DB
module.exports.deleteMessage = function(req, res, next) {
  // find the message by its id, then delete it
  Message.remove({ _id: req.params.id }, function (err, msg) {
    if (err) {
      return next(err);
    }

    // return response message
    return res.status(200).json({
      data: msg,
      err: null,
      msg: 'Message deleted successfully.'
      });
  });
 };

 module.exports.block = function(req, res, next) {
   var blocked = req.params.blocked;
   //  console.log('username of blocked: ', blocked);
    console.log('CONT. ID of user is: ', req.body._id);
     User.findByIdAndUpdate(
       req.body._id, { $push: { 'blocked': blocked } },
      { new: true }, function (err, updatedob) {
      if (err) {
     //       console.log('entered the error stage of update');

          return res.status(402).json({
              data: null,
              msg: 'error occurred during addition of blocked user to array , user is:' +
              req.body.username + 'Blocked is: ' + blocked
          });
      }
      console.log('status is 200');

      return res.status(200).json({
       data: updatedob,
       err: null,
       msg: 'Blocked user'
      });
  }
 );
};

// get recently contacted users
module.exports.getRecentlyContacted = function(req, res, next) {

  Message.aggregate([
    { $match: { sender: req.params.user } }, // get records where sender is equal to the input parameter user
    { $group: { _id: '$recipient', sentAt: {$max: '$sentAt'} } }, // group records by recipient and most recent sentAt date
    { $sort: { sentAt: -1 } }, // order records descendingly by sentAt
    { $limit: 10 } // get the first 10 elements
   ]).
   exec(function(err, users) {
    if (err) {
      return next(err);
    }

    // console.log(users);
    return res.status(200).json({
      data: users,
      err: null,
      msg: 'Success.'
      });
  });
};

module.exports.contactAdmin = function (req, res, next) {
  console.log('in here');
 User.find({ 'isAdmin': true }, function (err, users) {
    if (err) {
      return next(err);
    } else if (users) {
      for (var num = 0; num < users.length; num += 1) {
        req.body.recipient = users[num].username;
        console.log(users[num].firstName);
        Message.create(
        req.body
      , function(error, posted) {
        if (err) {
          return next(err);
      }
     }
    );
   }

    return res.status(200).json({
      data: null,
      err: null,
      msg: 'Message Sent!'
    });
    }
  });
 };

module.exports.unBlock = function(req, res, next) {
    var blockedUser = req.params.blocked;
  //  console.log('username of blocked: ', blocked);
  // console.log('unBlock CONT. ID of user is: ', req.body._id);
    User.findById(
      req.body._id,
     { new: true }, function (err, updatedob) {
     if (err) {
           console.log('entered the error stage of update');

         return res.status(402).json({
             data: null,
             msg: 'error occurred during unblocking the user'
         });
     }
    
    else {
       updatedob=req.body;
       //   console.log('id of updatedob: ', updatedob._id);
         // console.log('username of updatedob: ', updatedob.username);

          for(let i=0; i<req.body.blocked.length; i++)
             {
                 if(req.body.blocked[i] == blockedUser)
                 {
                   console.log('this user is no longer blocked');
                   req.body.blocked[i].remove();
                 }//end if
             }// end for 
       
     return res.status(200).json({
      data: updatedob,
      err: null,
      msg: 'This user is no longer blocked'
     });
    }//end else
    }//end function
);
};