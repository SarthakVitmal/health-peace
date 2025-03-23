import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    provider: { type: String, default: "credentials" },
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