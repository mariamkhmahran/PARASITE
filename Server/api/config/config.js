//TODO production URL to be added in deployment
module.exports = {
    //either dev or prod
    ENV: 'dev',
    MONGO_URI: this.env === 'prod' ? '' : 'mongodb://localhost:27017/nawwar',
    PORT: 3000,
    SECRET: ';iN.yVt,Tmu44cZkX#.|tS>s`4xb;-oRe66iMz0[L^e9;ltF_5"DUvPphj:f:&'
};
var mongoosePaginate = require('mongoose-paginate');

mongoosePaginate.paginate.options = {
    lean:  true,
    limit: 20
};
