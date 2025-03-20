import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // isVerified: {
    //     type: Boolean,
    //     default: false,
    // },
    // verificationToken: {
    //     type: String,
    // },
    // verificationTokenExpiration: {
    //     type: Date,
    // },
    // forgotPasswordToken: {
    //     type: String,
    // },
    // forgotPasswordTokenExpiration: {
    //     type: Date,
    // },
});

const User = (mongoose.models && mongoose.models.User) || mongoose.model('User', UserSchema);
export default User;