const express = require("express");
const auth = require("../middleware/auth");

const {
  myProfile,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
  logoutAllUser,
} = require("../controllers/user");
const router = new express.Router();

router.route("/").post(createUser);

router
  .route("/me")
  .get(auth, myProfile)
  .delete(auth, deleteUser)
  .patch(auth, updateUser);

router.route("/login").post(loginUser);
router.route("/logout").post(auth, logoutUser);
router.route("/logoutAll").post(auth, logoutAllUser);

module.exports = router;
