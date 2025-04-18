import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IContent extends Document {
  id: string;
  title: string;
  type: string;
  tags: string[];
  popularity: number;
  createdAt: Date;
}

const ContentSchema: Schema = new Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['article', 'video', 'podcast', 'image']
  },
  tags: {
    type: [String],
    default: []
  },
  popularity: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

export default mongoose.model<IContent>('Content', ContentSchema); 