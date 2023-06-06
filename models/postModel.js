const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: String,
    content: String,
    photoUrl: String,
    createdByUid: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    likedByUid: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Posts", postSchema);

module.exports = Post;
