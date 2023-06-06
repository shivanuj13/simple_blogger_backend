const express = require("express");
const postController = require("../controllers/postController");
const tokenVerification = require("../middlewares/tokenVerification");

const router = express.Router();
router.use(tokenVerification);
router.get("/", postController.hello);
router.post("/create", postController.createPost);
router.get("/fetch", postController.getAllPosts);
router.post("/update", postController.updatePost);
router.delete("/delete", postController.deletePost);
router.post("/likeUnlike", postController.likeUnlike);
module.exports = router;
