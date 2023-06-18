const express = require("express");
const {
  signUp,
  signIn,
  update,
  updateSubscriptions,
  getAllUsers,
} = require("../controllers/userController");
const tokenVerification = require("../middlewares/tokenVerification");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("This is User Route!");
});

router.post("/signUp", signUp);
router.post("/signIn", signIn);
router.post("/update", tokenVerification, update);
router.post("/updateSubscriptions", tokenVerification, updateSubscriptions);
router.get("/getAllUsers", getAllUsers);

module.exports = router;
