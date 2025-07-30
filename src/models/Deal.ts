// src/models/Deal.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDeal extends Document {
  _id: number;
  title: string;
  opportunity?: number;
  currencyId?: string;
  stageId?: string;
  assignedById?: number;
  companyId?: number;
  contactIds?: number[];
  dateCreate?: Date;
  lastUpdatedInB24: Date;
  syncedAt: Date;
  customFields: Map<string, unknown>; // Cambiado de 'any' a 'unknown'
}

const DealSchema: Schema<IDeal> = new Schema(
  {
    _id: { type: Number, required: true },
    title: { type: String, required: true },
    opportunity: Number,
    currencyId: String,
    stageId: String,
    assignedById: Number,
    companyId: Number,
    contactIds: [Number],
    dateCreate: Date,
    lastUpdatedInB24: { type: Date, required: true },
    syncedAt: { type: Date, default: Date.now },
    customFields: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    _id: false,
  }
);

const Deal: Model<IDeal> =
  mongoose.models.Deal || mongoose.model<IDeal>("Deal", DealSchema);

export default Deal;
