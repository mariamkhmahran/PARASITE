var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.MONGO_URI).
    then(function () {
        console.log('successfully connected to database on the url: ' +
            config.MONGO_URI);
    }).
    catch(function (err) {
        if (err) {
            console.error(err);
        }

    });

require('../models/Activity');
require('../models/Content');
require('../models/User');
require('../models/Category');
require('../models/VerifiedContributerRequest');
require('../models/ContentRequest');
require('../models/StudyPlan');
