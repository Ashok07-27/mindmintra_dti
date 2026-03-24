const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    type: {
      type: String,
      enum: ["relate", "support"],
      required: true,
    },
  },
  { timestamps: true }
);

reactionSchema.index({ userId: 1, postId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Reaction", reactionSchema);



