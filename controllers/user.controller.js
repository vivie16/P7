const userModel = require('../models/user.model');
const objectID = require('mongoose').Types.ObjectId;

module.exports.getAllUsers = async(req, res) => {
    const users = await userModel.find().select('-password');
    res.status(200).json(users);
};

module.exports.userInfo = (req, res) =>{
    if (!objectID.isValid(req.params.id))
        return res.status(400).send('Id unknown : ' + req.params.id)

    userModel.findById(req.params.id,(err, docs) => {
        if(!err)res.send(docs);
        else console.log('Id unknown : '+ err);
    }).select('-password');
};

module.exports.updateUser = async (req, res) => {
    if (!objectID.isValid(req.params.id))
        return res.status(400).send('Id unknown : ' + req.params.id)
    
    try{
        await userModel.findOneAndUpdate( 
            {_id: req.params.id},
            {
                $set: {
                    bio: req.body.bio
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true},
            (err, docs) =>{
                if (!err) return res.send(docs);
                if(err) return res.status(500).send({message : err});
            }
        )
    } catch (err) {
        return res.status(500).json({message : err});
    }
};
module.exports.deleteUser = async (req, res) => {
    if (!objectID.isValid(req.params.id))
        return res.status(400).send('Id unknown : ' + req.params.id)
    
    try {
        await userModel.remove({_id: req.params.id});
        res.status(200).json({ message: "Successfully deleted."})
    } catch (err) {
        return res.status(500).json({message : err});
    }
};
module.exports.follow = async (req, res) => {
    if (!objectID.isValid(req.params.id) || !objectID.isValid(req.body.idToFollow))
        return res.status(400).send('Id unknown : ' + req.params.id)
    
    try { 
        //add to the follower list
        await userModel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { following: req.body.idToFollow}},
            { new: true, upsert: true},
            (err, docs) => {
                if (!err) res.status(201).json(docs);
                else return res.status(400).jsos(err);
            },
        );
        // add to following list
        await userModel.findByIdAndUpdate (
            req.body.idToFollow,
            { $addToSet: { followers: req.params.id}},
            { new: true, upsert: true},
            (err, docs) => {
                if(err) return res.status(400).jsos(err);
            },
        )
    } catch (err) {
        return res.status(500).json({message : err});
    }
};
module.exports.unfollow = async (req, res) => {
    if (!objectID.isValid(req.params.id) || !objectID.isValid(req.body.idToUnfollow))
    return res.status(400).send('Id unknown : ' + req.params.id)

    try { 
        //add to the unfollower list
        await userModel.findByIdAndUpdate(
            req.params.id,
            { $pull: { following: req.body.idToUnfollow}},
            { new: true, upsert: true},
            (err, docs) => {
                if (!err) res.status(201).json(docs);
                else return res.status(400).jsos(err);
            },
        );
        // add to unfollowing list
        await userModel.findByIdAndUpdate (
            req.body.idToUnfollow,
            { $pull: { followers: req.params.id}},
            { new: true, upsert: true},
            (err, docs) => {
                if(err) return res.status(400).jsos(err);
            },
        )
    } catch (err) {
        return res.status(500).json({message : err});
    }
};