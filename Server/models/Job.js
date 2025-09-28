const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  video: {
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    duration: { type: Number, required: true },
    source: { 
      type: String, 
      enum: ["upload", "youtube"], 
      required: true 
    }
  },
  status: { 
    type: String, 
    enum: ["pending", "processing", "completed", "failed"], 
    default: "pending" 
  },
  result: [
    { 
      clipUrl: String, 
      startTime: Number, 
      endTime: Number, 
      duration: Number 
    }
  ],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

JobSchema.index({ userId: 1, status: 1 });
JobSchema.index({ createdAt: -1 });
JobSchema.index({ status: 1 });

module.exports = mongoose.model('Job', JobSchema);
