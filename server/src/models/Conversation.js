import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  profileInsight: {
    detectedSkill: String,
    detectedExperience: String,
    detectedEducation: String,
    rawText: String,
    confirmed: {
      type: Boolean,
      default: false
    }
  }
});

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  language: {
    type: String,
    default: 'te'
  },
  messages: [messageSchema]
}, {
  timestamps: true
});

export const Conversation = mongoose.model('Conversation', conversationSchema);
