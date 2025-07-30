// src/models/UserCredentials.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserCredentials extends Document {
  userId: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
  portalUrl: string;
}

const UserCredentialsSchema: Schema<IUserCredentials> = new Schema({
  userId: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  accessTokenExpires: { type: Number, required: true },
  portalUrl: { type: String, required: true },
});

const UserCredentials: Model<IUserCredentials> =
  mongoose.models.UserCredentials ||
  mongoose.model<IUserCredentials>("UserCredentials", UserCredentialsSchema);

export default UserCredentials;
