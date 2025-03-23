import mongoose from "mongoose";

const MoodSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mood: { type: String, required: true },
  date: { type: Date, required: true },
});

export default mongoose.models.Mood || mongoose.model("Mood", MoodSchema);
