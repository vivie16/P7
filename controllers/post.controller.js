const postModel = require('../models/post.model');
const userModel = require('../models/user.model');
const objectID = require ('mongoose').Types.ObjectId;

module.exports.readPost = (req, res) => {
    postModel.find((err, docs) => {
        if(!err) res.send(docs);
        else console.log('error to get data:' + err);
    })
};

module.exports.createPost = async(req, res) => {
    const newPost = new postModel({
        posterId: req.body.posterId,
        message: req.body.message,
        vidéo: req.body.vidéo,
        likers:[],
        comments: [],
    });
    try {
        const post = await newPost.save();
        return res.status(201).json(post);
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.updatePost = (req, res) => {
    if (!objectID.isValid(req.params.id))
    return res.status(400).send("Id unknown : " + req.params.id);

    const updateRecord = {
        message: req.body.message
    }

    postModel.findByIdAndUpdate(
        req.params.id,
        {$set: updateRecord},
        { new: true},
        (err, docs) => {
            if(!err) res.send(docs);
            else console.log("update error:' + err");
        }
    )
};

module.exports.deletePost = (req, res) => {
    if (!objectID.isValid(req.params.id))
        return res.status(400).send("Id unknown : " + req.params.id);

    postModel.findByIdAndRemove(req.params.id, (err, docs) => {
        if(!err) res.send(docs);
        else console.log("delete error:' + err");  
    });
};