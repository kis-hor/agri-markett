const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter the blog title!"],
    },
    content: {
        type: String,
        required: [true, "Please enter the blog content!"],
    },
    category: {
        type: String,
        required: [true, "Please enter the blog category!"],
    },
    author: {
        type: String,
        required: [true, "Please enter the author name!"],
    },
    publishDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["Draft", "Published", "Archived"],
        default: "Draft",
    },
    tags: [{
        type: String,
    }],
    featuredImage: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    images: [{
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    }],
    views: {
        type: Number,
        default: 0,
    },
    comments: [{
        userId: {
            type: String,
        },
        comment: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Blog", blogSchema);