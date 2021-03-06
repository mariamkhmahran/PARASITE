var mongoose = require('mongoose');
var chai = require('chai');
var server = require('../../app');
var Category = mongoose.model('Category');
var chaiHttp = require('chai-http');
var expect = require('chai').expect;
var should = require('chai').should();
chai.use(chaiHttp);

var config = require('../../api/config/config');
var Mockgoose = require('mockgoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose);

describe('/GET/ Category', function () {

    // --- Mockgoose Initiation --- //
    before(function (done) {
        mockgoose.prepareStorage().then(function () {
            mongoose.connect(config.MONGO_URI, function () {
                done();
            });
        });
    });
    // --- End of "Mockgoose Initiation" --- //

    // test that the server will retrieve categories
    it('it should GET categories from the server', function (done) {
        // create a category for the test
        var cat1 = new Category({
            iconLink: 'link.com',
            name: 'testcat1',
            sections: [
                {
                    iconLink: 'link.org',
                    name: 'sec1.1'
                }
            ]
        });

        // save the category to the database
        cat1.save(function (err) {
            if (err) {
                return console.log(err);
            }
            // send a get request to retrieve the category
            chai.request(server).get('/api/content/category/').
                end(function (error, res) {
                    if (error) {
                        return console.log(error);
                    }

                    // expect the correct category to be retrieved
                    expect(res).to.have.status(200);
                    res.body.data.should.be.a('array');
                    res.body.data[0].should.have.
                        property('name', 'testcat1', 'category name invalid');
                    res.body.data[0].should.have.property('sections');
                    done();
                });
        });
    });

    // test that when there are no categories, an empty array is sent back
    it('it should get an empty array from ' +
        'the server when there are no categories', function (done) {
            // request categories
            chai.request(server).get('/api/content/category/').
                end(function (error, res) {
                    if (error) {
                        return console.log(error);
                    }

                    // expect an empty array
                    expect(res).to.have.status(200);
                    res.body.data.should.be.a('array');
                    res.body.data.should.have.lengthOf(0);
                    done();
                });
        });

    // --- Clearing Mockgoose --- //
    beforeEach(function (done) {
        mockgoose.helper.reset().then(function () {
            done();
        });
    });
    // --- End of "Clearing Mockgoose" --- //


    // --- Mockgoose Termination --- //
    after(function (done) {
        mongoose.connection.close(function () {
            done();
        });
    });
    // --- End of "Mockgoose Termination" --- //
});
