const User = require("../models/user");
//@description       create new user
//@route        POST /api/v1/users
//@access       Public
exports.createUser = async (req, res, next) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).json({
      success: true,
      data: user,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Login User
exports.loginUser = async (req, res, next) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).json({ success: false, error: "Unable to login" });
  }
};

//Logout User
exports.logoutUser = async (req, res, next) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//logoutAll user
exports.logoutAllUser = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@description      Read my profile
//@route        POST /api/v1/users
//@access       Private
exports.myProfile = async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

//@description       PUT single user
//@route        PUT /api/v1/users/:id
//@access       Private
exports.updateUser = async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({ success: false, error: "Invalid Updates!" });
  }
  try {
    // const user = await User.findById(req.params.id);

    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@description      DELETE single user
//@route        DELETE /api/v1/users/:id
//@access       Private
exports.deleteUser = async (req, res, next) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);

    // if (!user) {
    //   return res
    //     .status(404)
    //     .json({ msg: `User with id ${req.params.id} does not exist` });
    // }

    await req.user.remove();

    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
