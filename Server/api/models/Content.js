var mongoose = require('mongoose');
// use the mongoose-paginate library to store contents in pages
var mongoosePaginate = require('mongoose-paginate');

var comment = mongoose.model('Comment');
var commentSchema = comment.schema;

// TODO: Omit creator specific schema [ProfileDependency | AuthDependency]
var contentSchema = mongoose.Schema({
    approved: {
        required: true,
        type: Boolean
    },
    body: {
        required: true,
        trim: false,
        type: String
    },
    category: {
        required: true,
        trim: true,
        type: String
    },
    creator: {
        trim: true,
        type: String
    },
    creatorAvatarLink: {
        trim: true,
        type: String
    },
    creatorProfileLink: {
        trim: true,
        type: String
    },
    discussion: { type: [commentSchema] },
    image: {
        trim: false,
        type: String
    },
    section: {
        required: true,
        trim: true,
        type: String
    },
    tags: { type: [String] },
    title: {
        required: true,
        trim: true,
        type: String
    },
    touchDate: {
        default: Date.now,
        type: Date
    },
    type: {
        default: 'resource',
        enum: [
            'resource',
            'idea'
        ],
        type: String
    },
    update: {
        trim: true,
        type: String
    },
    video: {
        trim: true,
        type: String
    }
});

// apply the mongoose paginate library to the schema
contentSchema.plugin(mongoosePaginate);
var Content = mongoose.model('Content', contentSchema, 'contents');
