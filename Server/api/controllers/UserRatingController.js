var mongoose = require('mongoose');
var UserRating = mongoose.model('UserRating');
var Content = mongoose.model('Content');
var Product = mongoose.model('Product');
var StudyPlan = mongoose.model('StudyPlan');

var rate = function (model, message, oldRating, newRating, res, next) {
    model.findOneAndUpdate(
        { _id: newRating.ratedId },
        {
            $inc: {
                'rating.number': oldRating ? 0 : 1,
                'rating.sum': oldRating ? newRating.rating - oldRating.rating
                    : newRating.rating
            }
        },
        { new: true },
        function (err) {
            if (err) {
                return next(err);
            }

            return res.status(201).json({
                data: null,
                err: null,
                msg: message + ' rated succesfully.'
            });
        }
    );
};

module.exports.postRating = function (req, res, next) {
    UserRating.findOneAndUpdate(
        {
            ratedId: req.body.userRating.ratedId,
            type: req.body.userRating.type,
            username: req.body.userRating.username
        },
        { $set: { rating: req.body.userRating.rating } },
        { upsert: true },
        function (err, oldRating) {
            if (err) {
                return next(err);
            }

            switch (req.body.userRating.type) {
                case 'content':
                    return rate(
                        Content,
                        'Content',
                        oldRating,
                        req.body.userRating,
                        res,
                        next
                    );
                case 'product':
                    return rate(
                        Product,
                        'Product',
                        oldRating,
                        req.body.userRating,
                        res,
                        next
                    );
                case 'studyPlan':
                    return rate(
                        StudyPlan,
                        'Study plan',
                        oldRating,
                        req.body.userRating,
                        res,
                        next
                    );
                default:
                    console.log('Something fishy is going on here...');
            }
        }
    );
};
