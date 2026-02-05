import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['roads', 'lighting', 'sanitation', 'water', 'electricity', 'parks', 'other']
  },
  digipin:{
    type: String,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  imageUrl:[ {
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['open', 'assigned', 'in_progress', 'resolved', 'completed'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  resolvedProof: {
    beforeImageUrl: String,
    afterImageUrl: String,
    description: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  aiAnalysis: {
    type: Object
  },
  priority: {
    type: Number,
    default: 2
  },
  zone: {
    type: String,
    enum:[ "school_zone", "hospital_zone", "main_road", "residential", "industrial", "low_traffic"]
  }
}, {
  timestamps: true
});

// Create geospatial index for location queries
issueSchema.index({ location: '2dsphere' });

export default mongoose.model('Issue', issueSchema);