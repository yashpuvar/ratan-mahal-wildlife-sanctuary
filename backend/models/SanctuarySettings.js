const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  day: { type: String, enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], required: true },
  closed: { type: Boolean, default: false },
  openTime: { type: String, default: "09:00" },
  closeTime: { type: String, default: "17:00" },
}, { _id: false });

const holidaySchema = new mongoose.Schema({
  date: { type: String, required: true },
  name: { type: String, trim: true, maxlength: 100, default: "" },
}, { _id: false });

const sanctuarySettingsSchema = new mongoose.Schema({
  _id: { type: String, default: "sanctuary" },
  scheduleConfigured: { type: Boolean, default: false },
  openingSoonMinutes: { type: Number, min: 1, max: 180, default: 60 },
  weeklyHours: { type: [daySchema], default: () => [
    "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
  ].map((day) => ({ day, closed: false, openTime: "09:00", closeTime: "17:00" })) },
  holidays: { type: [holidaySchema], default: [] },
  temporaryClosure: {
    active: { type: Boolean, default: false },
    reason: { type: String, trim: true, maxlength: 300, default: "" },
  },
  manualOverride: { type: String, enum: ["none", "open", "closed"], default: "none" },
  manualOverrideReason: { type: String, trim: true, maxlength: 300, default: "" },
  hotelOpen: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.models.SanctuarySettings || mongoose.model("SanctuarySettings", sanctuarySettingsSchema);
