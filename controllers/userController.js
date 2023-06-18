const userModel = require("../models/userModel");
const postModel = require("../models/postModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;
var saltRound = process.env.SALT_ROUND;
saltRound = parseInt(saltRound);

const signUp = async (req, res, next) => {
  try {
    const { name, email, password, photoUrl } = req.body;
    //existing user check
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return next({
        status: 403,
        message: "User already exists!",
      });
    }
    //encrypt password

    const encryptedPassword = await bcrypt.hash(password, saltRound);
    //create user
    const result = await userModel.create({
      name: name,
      email: email,
      password: encryptedPassword,
      photoUrl: photoUrl,
      subscriberCount: 0,
      subscriptionList: [],
    });
    //generate token
    const token = jwt.sign({ email: email, id: result._id }, secretKey);
    return res.status(201).json({
      status: true,
      data: {
        message: "User created successfully!",
        user: result,
        token,
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

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //user existence check
    const existingUser = await userModel.findOne({ email: email });
    if (!existingUser) {
      return next({ status: 404, message: "User not found" });
    }
    //match passwords
    const matchPassword = await bcrypt.compare(password, existingUser.password);

    if (!matchPassword) {
      return next({ status: 401, message: "Wrong Password" });
    }

    //generate token
    const token = jwt.sign({ email: email, id: existingUser._id }, secretKey);

    return res.json({
      status: true,
      data: {
        message: "signed in successfully",
        user: existingUser,
        token,
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

const update = (req, res, next) => {
  try {
    const { name, email, photoUrl } = req.body;
    const id = req.userId;
    userModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            name,
            email,
            photoUrl,
          },
        },
        { new: true }
      )
      .then((response) => {
        if (response) {
          return res.json({
            status: true,
            data: {
              user: response,
            },
            error: null,
          });
        } else {
          next({
            status: 404,
            message: "User not found!!",
          });
        }
      })
      .catch((error) =>
        next({
          status: error.status,
          message: error.message,
        })
      );
  } catch (error) {
    next({
      status: error.status,
      message: error.message,
    });
  }
};

const updateSubscriptions = async (req, res, next) => {
  try {
    const { authorId } = req.body;
    const userId = req.userId;
    if (authorId === userId) {
      return next({
        status: 403,
        message: "You can't subscribe to yourself!!",
      });
    }

    const user = await userModel.findById(userId);
    const author = await userModel.findById(authorId);
    if (!author) {
      return next({
        status: 404,
        message: "Author not found!!",
      });
    }
    if (!user) {
      return next({
        status: 404,
        message: "User not found!!",
      });
    }
    const subscriptionList = user.subscriptionList;
    const isSubscribed = subscriptionList.includes(authorId);
    if (isSubscribed) {
      subscriptionList.pull(authorId);
      await user.save();
      author.subscriberCount = author.subscriberCount - 1;
      await author.save();
      return res.json({
        status: true,
        data: {
          message: "Unsubscribed successfully!!",
          user: user,
        },
        error: null,
      });
    } else {
      subscriptionList.push(authorId);
      await user.save();
      author.subscriberCount = author.subscriberCount + 1;
      await author.save();
      return res.json({
        status: true,
        data: {
          message: "Subscribed successfully!!",
          user: user,
        },
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

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.find();
    return res.json({
      status: true,
      data: {
        users,
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


module.exports = {
  signUp,
  signIn,
  update,
  updateSubscriptions,
  getAllUsers,
};
