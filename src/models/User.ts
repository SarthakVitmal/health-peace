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
    provider: { type: String, default: "credentials" },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordTokenExpiration: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = (mongoose.models && mongoose.models.User) || mongoose.model('User', UserSchema);
export default User;