const postModel = require("../models/postModel");
const userModel = require("../models/userModel");

const hello = (req, res, next) => {
  res.json({
    message: "Hello User! this is post route",
  });
};

// callback handler for creating a post
const createPost = (req, res, next) => {
  let post = new postModel({
    title: req.body.title,
    content: req.body.content,
    photoUrl: req.body.photoUrl,
    createdByUid: req.userId,
  });
  post
    .save()
    .then((response) => {
      res.status(201).json({
        status: true,
        data: {
          message: "Post created successfully",
          post: response,
        },
        error: null,
      });
    })

    .catch((error) => {
      next({
        status: error.status,
        message: error.message,
      });
    });
};

//callback handler for getting all the posts
const getAllPosts = async (req, res, next) => {
  try {
    const posts = await postModel.find();
    const users = await userModel.find();
    let data = [];

    posts.map((element) => {
      const {
        id,
        title,
        content,
        photoUrl,
        createdAt,
        createdByUid,
        likedByUid,
      } = element;
      let author = users.find((user) => user.id == createdByUid);
      if (!author) author = "";
      else author = author.name;
      data.push({
        id,
        title,
        content,
        photoUrl,
        createdAt,
        createdByUid,
        author,
        likedByUid,
      });
    });
    res.json({
      status: true,
      data: {
        message: "Fetch all the posts!",
        posts: data,
      },
      error: null,
    });
  } catch (error) {
    next({
      status: error.status,
      message: error.message,
    });
  }
};

//callback handler for updating a post
const updatePost = (req, res, next) => {
  let id = req.body.id;
  let updatedPost = req.body;
  postModel
    .findByIdAndUpdate(id, { $set: updatedPost }, { new: true })
    .then((response) => {
      if (!response) {
        next({
          status: 404,
          message: "Post not found!!",
        });
      } else {
        res.json({
          status: true,
          data: {
            message: "Post updated successfully!!",
            response,
          },
          error: null,
        });
      }
    })
    .catch((error) => {
      next({
        status: error.status,
        message: error.message,
      });
    });
};

//callback handler for deleting a post

const deletePost = (req, res, next) => {
  let id = req.body.id;
  postModel
    .findByIdAndDelete(id)
    .then((response) => {
      if (!response) {
        next({
          status: 404,
          message: "Post not found!!",
        });
      } else {
        res.json({
          status: true,
          data: "Post deleted successfully!!",
          error: null,
        });
      }
    })
    .catch((error) => {
      next({
        status: error.status,
        message: error.message,
      });
    });
};

const likeUnlike = async (req, res, next) => {
  try {
    const id = req.body.id;
    const userId = req.userId;
    const post = await postModel.findById(id);
    const user = await userModel.findById(userId);
    if (!user) {
      return next({
        status: 404,
        message: "User not found!",
      });
    }
    if (!post) {
      return next({
        status: 404,
        message: "Post not found!",
      });
    }

    if (post.likedByUid.includes(userId)) {
      post.likedByUid.pull({ _id: userId });
      await post.save();
      return res.json({
        status: true,
        data: "Post un-liked successfully!!",
        error: null,
      });
    } else {
      post.likedByUid.push(userId);
      await post.save();
      return res.json({
        status: true,
        message: "Post liked successfully!!",
        error: null,
      });
    }
  } catch (error) {
    next({
      status: error.status,
      message: error.message,
    });
  }
};

module.exports = {
  hello,
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
  likeUnlike,
};
