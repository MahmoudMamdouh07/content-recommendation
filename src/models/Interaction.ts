import mongoose, { Document, Schema } from 'mongoose';

export interface IInteraction extends Document {
  userId: string;
  contentId: string;
  type: 'view' | 'like' | 'share' | 'comment' | 'save' | 'rating';
  timestamp: Date;
  duration?: number;
  comment?: string;
  rating?: number;
}

const InteractionSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  contentId: {
    type: String,
    required: true,
    ref: 'Content'
  },
  type: {
    type: String,
    required: true,
    enum: ['view', 'like', 'share', 'comment', 'save', 'rating']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    min: 0,
    required: function(this: IInteraction) {
      return this.type === 'view';
    }
  },
  comment: {
    type: String,
    required: function(this: IInteraction) {
      return this.type === 'comment';
    }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: function(this: IInteraction) {
      return this.type === 'rating';
    }
  }
});

// Index for faster lookup of interactions by userId and contentId
InteractionSchema.index({ userId: 1, contentId: 1 });

export default mongoose.model<IInteraction>('Interaction', InteractionSchema); 