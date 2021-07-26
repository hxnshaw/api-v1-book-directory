const express = require("express");
const app = express();

const Book = require("../models/book");

//@description       create new book
//@route        POST /api/v1/books
//@access       Public
exports.createBook = async (req, res, next) => {
  const book = new Book({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await book.save();
    res.status(201).json({
      success: true,
      data: book,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@description       get all books
//@route        GET /api/v1/books
//@access       Public
exports.getAllBooks = async (req, res, next) => {
  let query;
  const reqQuery = { ...req.query };

  const removeFields = ["select", "sort", "page", "limit"];

  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);

  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  query = Book.find(JSON.parse(queryStr));

  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-title");
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Book.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  try {
    const books = await query;
    if (!books) {
      res.status(404).json({
        success: false,
        message: "Books not found",
      });
    }

    res.status(200).json({
      success: true,
      count: books.length,
      pagination,
      data: books,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//description       get single book
//@route        GET /api/v1/books/:id
//@access       Private
exports.getSingleBook = async (req, res, next) => {
  const _id = req.params.id;
  try {
    // const book = await Book.findById(req.params.id);
    const book = await Book.findOne({ _id, owner: req.user._id });
    if (!book) {
      res.status(404).json({
        success: false,
        message: `Book with id ${req.params.id} does not exist`,
      });
    }
    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@description       PUT single book
//@route        PUT /api/v1/books/:id
//@access       Private
exports.updateBook = async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "summary", "country"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    res.status(400).json({ success: false, error: "Invalid Update!" });
  }
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res
        .status(404)
        .json({ msg: `Book with id '${req.params.id}' does not exist` });
    }

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@description      DELETE single book
//@route        DELETE /api/v1/books/:id
//@access       Private
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res
        .status(404)
        .json({ msg: `Book with id ${req.params.id} does not exist` });
    }

    book.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Find a book by the title
app.get("/api/v1/books?search=", (req, res, next) => {
  let search_key = req.params("search");
  Book.find({ title: search_key })
    .then((book) =>
      res.json({
        success: true,
        data: book,
      })
    )
    .catch((err) => {
      res.status(404).json({ success: false });
    });
});
