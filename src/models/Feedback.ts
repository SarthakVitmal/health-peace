import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
    feedbackType: {
        type: String,
        required: true,
        enum: ['general', 'bug', 'suggestion', 'experience'],
        default: 'general'
    },
    rating:{
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        required: true
    },
    userName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
export default Feedback;