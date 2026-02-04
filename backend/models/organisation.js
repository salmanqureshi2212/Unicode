import mongoose from "mongoose";

const organisationSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  organisation:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organisation",
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  jurisdiction_boundary: {
    type: {
      type: String,
      enum: ["Polygon"],
      required: true,
    },
    coordinates: {
      type: [[[Number]]], // GeoJSON Polygon
      required: true,
    },
  },
});

export default mongoose.model("Organisation", organisationSchema);
