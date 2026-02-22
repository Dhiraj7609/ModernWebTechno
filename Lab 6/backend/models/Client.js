import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    // Keep the same numeric id that the JSON file uses
    id: { type: Number, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    riskCategory: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High"],
    },
    createdDate: { type: String, required: true }, // yyyy-mm-dd
  },
  { timestamps: true }
);

export default mongoose.model("Client", ClientSchema);
