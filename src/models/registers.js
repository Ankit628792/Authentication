const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const registerSchema = new mongoose.Schema({
    Firstname: {
        type: String,
        required: true
    },
    Lastname: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Gender: {
        type: String,
        required: true
    },
    Phone: {
        type: Number,
        required: true,
        unique: true
    },
    Age: {
        type: Number,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    ConfirmPassword: {
        type: String,
        required: true
    },
    Tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

registerSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({_id: this._id}, process.env.SECRET_KEY);
        this.Tokens = this.Tokens.concat({token: token});
        // console.log(token)
        await this.save();
        return token;

    } catch (error) {
        console.log(error)
    }
}


registerSchema.pre('save', async function (next) {
    if(this.isModified('Password')){
    this.Password = await bcrypt.hash(this.Password, 10);
    this.ConfirmPassword = await bcrypt.hash(this.Password, 10);
    }
    next()
})

const Register = new mongoose.model("Register", registerSchema);

module.exports = Register;