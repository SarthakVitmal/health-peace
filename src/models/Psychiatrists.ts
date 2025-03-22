import mongoose from "mongoose";

const PsychiatristsSchema = new mongoose.Schema({
    name:String,
    address:String,
    mobile:String,
    email:String,
    location:{
        type: String
    },
})

export default mongoose.models.Psychiatrists || mongoose.model('Psychiatrists', PsychiatristsSchema);