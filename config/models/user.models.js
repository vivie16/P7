const mongoose = require('mongoose');
const{isEmail} = require('validator');

const userSchema = new mongoose.Schema(
    {
        pseudo: {
            type: string,
            required: true,
            minLength: 3,
            maxLength: 50,
            unique: true,
            trimp: true
        },
        email: {
            type: string,
            required: true,
            validate: ,
            lowercase: true,
            trim: true,
        }
    }
)