const postModel = require('../models/post.model');
const userModel = require('../models/user.model');
const objectID = require ('mongoose').Types.ObjectId;
const fs = require ("fs");
const { promisify } = require("util");
const pipeline = promisify(require ("stream").pipeline);
const { uploadErrors } = require("../utils/errors.utils");

module.exports.readPost = (req, res) => {
    postModel.find((err, docs) => {
        if(!err) res.send(docs);
        else console.log('error to get data:' + err);
    })
};

module.exports.createPost = async(req, res) => {
    let fileName;
    if (req.file !== null) {
        try {
            if (req.file.detectedMimeType != "image/jpg" && req.file.detectedMimeType != "image/png" && req.file.detectedMimeType != "image/jpeg")
            throw Error("invalid file");
    
            if (req.file.size > 500000)
            throw Error("max size");
        } catch (err) {
            const errors = uploadErrors(err);
            return res.status(201).json({ errors });
        }
        fileName = req.body.posterId + Date.now() + ".jpg";
    
        await pipeline(
          req.file.stream,
          fs.createWriteStream(
            `${__dirname}/../client/public/uploads/posts/${fileName}`
          )
        );
      }

    const newPost = new postModel({
        posterId: req.body.posterId,
        message: req.body.message,
        picture: req.file !== null ? "./uploads/post/" + fileName : "",
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

module.exports.likePost = async(req, res) => {
    if (!objectID.isValid(req.params.id))
        return res.status(400).send("Id unknown : " + req.params.id);
    try {
        await postModel.findByIdAndUpdate (
            req.params.id, 
            {
                $addToSet: {likers: req.body.id}
            },
            { new: true},
            (err, docs) => {
                if (err) return res.status(400).send(err);
            },
        );
        await userModel.findByIdAndUpdate (
            req.body.id,
            {
                $addToSet: { likes: req.params.id}
            },
            { new: true},
            (err, docs) => {
                if (! err) res.send(docs);
                else return res.status(400).send(err);
            },
        );
    } catch(err) {
        return res.status(400).send(err);
    }
};

module.exports.unlikePost = async(req, res) => {
    if (!objectID.isValid(req.params.id))
        return res.status(400).send("Id unknown : " + req.params.id);
        try {
            await postModel.findByIdAndUpdate (
                req.params.id, 
                {
                    $pull: {likers: req.body.id},
                },
                { new: true},
                (err, docs) => {
                    if (err) return res.status(400).send(err);
                },
            );
            await userModel.findByIdAndUpdate (
                req.body.id,
                {
                    $pull: { likes: req.params.id},
                },
                { new: true},
                (err, docs) => {
                    if (! err) res.send(docs);
                    else return res.status(400).send(err);
                },
            );
        } catch(err) {
            return res.status(400).send(err);
        }
};

module.exports.commentPost = (req, res) =>{
    if (!objectID.isValid(req.params.id))
        return res.status(400).send("Id unknown : " + req.params.id);
    try {
        return postModel.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        commenterId: req.body.commenterId,
                        commenterPseudo: req.body.commenterPseudo,
                        text: req.body.text,
                        timestramp: new Date().getTime(),
                    },
                },
            },
            {new: true},
            (err, docs) => {
                if (!err) return res.send(docs);
                else return res.status(400).send(err);
                },
            );
    } catch(err) {
        return res.status(400).send(err);
    }
};

module.exports.editCommentPost = (req, res) =>{
    if (!objectID.isValid(req.params.id))
        return res.status(400).send("Id unknown : " + req.params.id);
    try {
        return postModel.findById (
            req.params.id,
            (err, docs) => {
                const theComment = docs.comments.find((comment) => 
                    comment._id.equals(req.body.commentId)
                )
                if(!theComment) return res.status(404).send('comment not found')
                theComment.text = req.body.text;
                return docs.save((err) => {
                    if (!err) return res.status(200).send(docs);
                    return res.status(500).send(err);
                });
            },
        );
    } catch(err) {
        return res.status(400).send(err);
    }
};

module.exports.deleteCommentPost = (req, res) =>{
    if (!objectID.isValid(req.params.id))
        return res.status(400).send("Id unknown : " + req.params.id);
    try {
        return postModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull:{
                    comments: {
                        _id: req.body.commentId,
                    },
                },
            },
            {new: true},
            (err,docs) => {
                if (!err) return res.send(docs);
                else return res.status(400).send()
            }
        );
    } catch(err) {
        return res.status(400).send(err);
    }
};