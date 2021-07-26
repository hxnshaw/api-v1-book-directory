const express = require("express");
const auth = require("../middleware/auth");

const {
  createBook,
  getAllBooks,
  getSingleBook,
  updateBook,
  deleteBook,
} = require("../controllers/book");

const router = new express.Router();

router.route("/").post(auth, createBook).get(getAllBooks);

router
  .route("/:id")
  .get(auth, getSingleBook)
  .put(updateBook)
  .delete(deleteBook);

module.exports = router;
