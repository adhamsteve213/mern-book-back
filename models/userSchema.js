import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    googleId: {
        type: String,
    },
    facebookId: {
        type: String,
    },
    microsoftId: {
        type: String,
    },
});

export default mongoose.model("User", userSchema);
