// src/models/Deal.ts
import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Interfaz de TypeScript para nuestro documento Deal
export interface IDeal extends Document {
  _id: number; // Usaremos el ID de Bitrix24 como clave primaria
  title: string;
  opportunity?: number;
  currencyId?: string;
  stageId?: string;
  assignedById?: number;
  companyId?: number;
  contactIds?: number[];
  dateCreate?: Date;
  lastUpdatedInB24: Date; // Para saber cuándo se modificó por última vez en Bitrix24
  syncedAt: Date; // Para saber cuándo lo sincronizamos nosotros
  customFields: Map<string, any>; // Para guardar todos los campos personalizados
}

// 2. Schema de Mongoose
const DealSchema: Schema<IDeal> = new Schema(
  {
    _id: { type: Number, required: true }, //
    title: { type: String, required: true }, //
    opportunity: Number, //
    currencyId: String, //
    stageId: String, //
    assignedById: Number, //
    companyId: Number, //
    contactIds: [Number], //
    dateCreate: Date, //
    lastUpdatedInB24: { type: Date, required: true }, //
    syncedAt: { type: Date, default: Date.now }, //
    customFields: {
      //
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    // Le decimos a Mongoose que no genere su propio _id, ya que usaremos el de Bitrix24
    _id: false, //
  }
);

// 3. Exportación del Modelo
// Esta línea previene que el modelo se compile múltiples veces en el entorno de desarrollo de Next.js
const Deal: Model<IDeal> =
  mongoose.models.Deal || mongoose.model<IDeal>("Deal", DealSchema); //

export default Deal;
