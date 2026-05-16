import { model, Schema, Types, type HydratedDocument } from "mongoose";

export interface Note {
  title: string;
  content: string;
  tags: string[];
  category: string;
  archived: boolean;
  isPublic: boolean;
  shareId?: string;
  aiSummary?: string;
  actionItems: string[];
  suggestedTitle?: string;
  aiUsageCount: number;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type NoteDocument = HydratedDocument<Note>;

const noteSchema = new Schema<NoteDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      default: "",
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    category: {
      type: String,
      default: "General",
      trim: true
    },
    archived: {
      type: Boolean,
      default: false
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    shareId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    aiSummary: {
      type: String,
      trim: true
    },
    actionItems: {
      type: [String],
      default: []
    },
    suggestedTitle: {
      type: String,
      trim: true
    },
    aiUsageCount: {
      type: Number,
      default: 0,
      min: 0
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

noteSchema.index({ userId: 1, updatedAt: -1 });
noteSchema.index({ userId: 1, archived: 1 });
noteSchema.index({ userId: 1, tags: 1 });
noteSchema.index({ userId: 1, category: 1 });

export const NoteModel = model<NoteDocument>("Note", noteSchema);
