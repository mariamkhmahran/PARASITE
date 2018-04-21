/*eslint max-statements: ["error", 10, { "ignoreTopLevelFunctions": true }]*/
var mongoose = require('mongoose');
var chai = require('chai');
var server = require('../../app');
var Category = mongoose.model('Category');
var User = mongoose.model('User');
var chaiHttp = require('chai-http');
var should = chai.should();

chai.use(chaiHttp);

var config = require('../../api/config/config');
var Mockgoose = require('mockgoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose);
var userToken = null;
var adminToken = null;
var successCategory = {
    category: 'testCategory',
    iconLink: 'http://www.this-is-a-link.com'
};
var successSection = {
    iconLink: 'http://www.this-is-a-link.com',
    section: 'testSection'
};
var testCategory = null;
var testSection = null;
var successUpdate = {
    iconLink: 'http://www.this-is-a-link-update.com',
    sectionName: 'updatedSection'
};
var failSectionNameExists = {
    iconLink: 'http://www.this-is-a-link.com',
    section: ''
};
var failSectionNameValid = {
    iconLink: 'http://www.this-is-a-link.com',
    section: {}
};
var failSectionIconExists = {
    iconLink: '',
    section: 'testSection'
};
var failSectionIconValid = {
    iconLink: {},
    section: 'testSection'
};

describe('/PATCH/section/', function () {
    // --- Mockgoose Initiation --- //
    before(function (done) {
        mockgoose.prepareStorage().then(function () {
            mongoose.connect(config.MONGO_URI, function () {
                done();
            });
        });
    });
    // --- End of "Mockgoose Initiation" --- //

    // --- Sign up a new user --//
    before(function (done) {
        //create the first test user(normal permissions)
        chai.request(server).post('/api/signUp').
            send({
                birthdate: '11/11/1997',
                email: 'hello@hello1234.com',
                firstName: 'Reda',
                lastName: 'Ramadan',
                password: 'testing123',
                username: 'Hellothere'
            }).
            end(function (err, res) {
                if (err) {
                    done();
                }
                // get the first test user token
                userToken = res.body.token;
                done();
            });
    });
    before(function (done) {
        //create the second test user(admin permissions)
        chai.request(server).post('/api/signUp').
            send({
                birthdate: '11/11/1997',
                email: 'admin@admin.com',
                firstName: 'admin',
                lastName: 'admin',
                password: 'admin123',
                username: 'admin'
            }).
            end(function (err, res) {
                if (err) {
                    done();
                }
                // update user permissions
                User.updateOne(
                    { username: 'admin' },
                    { $set: { isAdmin: true } },
                    function (updateErr) {
                        if (updateErr) {
                            done();
                        }
                        // get the token for the second test user
                        adminToken = res.body.token;
                        done();
                    }
                );
            });
    });

    before(function (done) {
        chai.request(server).
            post('/api/content/category').
            set('Authorization', adminToken).
            send(successCategory).
            end(function (err, res) {
                if (err) {
                    done(err);
                }
                testCategory = res.body.data;
                done();
            });
    });
    before(function (done) {
        chai.request(server).
            post('/api/content/category/' +
                testCategory._id + '/section').
            set('Authorization', adminToken).
            send(successSection).
            end(function (err, res) {
                if (err) {
                    done(err);
                }
                testCategory = res.body.data;
                testSection = res.body.data.sections[0];
                done();
            });
    });

    it('should update section successfully', function (done) {
        chai.request(server).
            patch('/api/content/category/' +
                testCategory._id + '/section/' + testSection._id).
            set('Authorization', adminToken).
            send(successUpdate).
            end(function (err, res) {
                should.not.exist(err);
                res.should.have.status(200);
                res.body.msg.should.be.equal('The section was updated' +
                    ' successfully');
                should.exist(res.body.data);
                var updatedSections = res.body.data.
                    sections.filter(function (section) {
                        return section.name === successUpdate.sectionName;
                    });
                updatedSections.should.have.lengthOf(1);
                updatedSections[0].iconLink.should.
                    be.equal(successUpdate.iconLink);
                updatedSections[0].name.should.
                    be.equal(successUpdate.sectionName);
                done();
            });
    });
    it('should fail to update section ' +
        'because the user is unregistered', function (done) {
            chai.request(server).
                patch('/api/content/category/' +
                    testCategory._id + '/section/' + testSection._id).
                send(successUpdate).
                end(function (err, res) {
                    should.not.exist(err);
                    res.should.have.status(401);
                    done();
                });
        });
    it('should fail to update section ' +
        'because the user is not an admin', function (done) {
            chai.request(server).
                patch('/api/content/category/' +
                    testCategory._id + '/section/' + testSection._id).
                set('Authorization', userToken).
                send(successUpdate).
                end(function (err, res) {
                    should.not.exist(err);
                    res.should.have.status(403);
                    done();
                });
        });

});
