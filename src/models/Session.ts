// models/Session.ts
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  text: String,
  sender: { type: String, enum: ["user", "bot"] },
  timestamp: { type: Date, default: Date.now }
});

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [MessageSchema],
  summary: String,
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,
  status: { type: String, enum: ["active", "ended"], default: "active" }
}, { timestamps: true });

const Session = mongoose.models.Session || mongoose.model("Session", SessionSchema);
export default Session;