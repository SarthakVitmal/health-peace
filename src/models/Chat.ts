import mongoose, { Schema, Document, Model } from 'mongoose';

// Message subdocument schema
interface IMessage {
  text: string;
  response?: string; // Only for bot responses
  timestamp: Date;
  metadata?: {
    sentiment?: string;
    urgency?: number;
    // Additional analysis fields
  };
}

const MessageSchema: Schema = new Schema({
  text: { type: String, required: true },
  response: { type: String },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    sentiment: { type: String },
    urgency: { type: Number, min: 0, max: 5 },
  }
});

// Main Chat document interface
interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  sessionName: string;
  messages: IMessage[];
  summary?: string;
  moodAtStart?: string;
  moodAtEnd?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sessionId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  sessionName: { 
    type: String, 
    default: 'New Chat' 
  },
  messages: [MessageSchema],
  summary: { type: String },
  moodAtStart: { 
    type: String,
    enum: ['happy', 'neutral', 'sad', 'anxious', 'angry', undefined]
  },
  moodAtEnd: {
    type: String,
    enum: ['happy', 'neutral', 'sad', 'anxious', 'angry', undefined]
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
ChatSchema.index({ userId: 1 });
ChatSchema.index({ sessionId: 1 });
ChatSchema.index({ createdAt: -1 });

// Pre-save hook to set session name if first message exists
ChatSchema.pre<IChat>('save', function(next) {
  if (this.isNew && this.messages.length > 0 && this.sessionName === 'New Chat') {
    const firstMessage = this.messages[0].text;
    this.sessionName = firstMessage.length > 30 
      ? `${firstMessage.substring(0, 30)}...` 
      : firstMessage;
  }
  next();
});

// Static method to create a new chat session
ChatSchema.statics.createNewSession = async function(
  userId: mongoose.Types.ObjectId,
  initialMessage?: string
) {
  const sessionId = require('uuid').v4();
  
  const newChat = new this({
    userId,
    sessionId,
    messages: initialMessage ? [{ text: initialMessage }] : []
  });

  return newChat.save();
};

// Method to add a message to the chat
ChatSchema.methods.addMessage = function(text: string, response?: string) {
  this.messages.push({ text, response });
  return this.save();
};

// Method to generate and store a summary
ChatSchema.methods.generateSummary = async function() {
  // In a real implementation, you would call your AI service here
interface IMessageText {
    sender: 'user' | 'bot';
    text: string;
}

const messagesText: string = this.messages.map((m: IMessageText) => 
    `${m.sender === 'user' ? 'User' : 'Bot'}: ${m.text}`
).join('\n');
  
  this.summary = `Conversation summary:\n${messagesText.substring(0, 500)}...`;
  return this.save();
};

const ChatModel: Model<IChat> = mongoose.model<IChat>('Chat', ChatSchema);

export default ChatModel;