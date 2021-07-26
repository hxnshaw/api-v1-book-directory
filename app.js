const express = require("express");
require("./db/mongoose");
const app = express();

//Route files
const users = require("./routers/user");
const books = require("./routers/book");

//Mount routers
app.use(express.json());
app.use("/api/v1/users", users);
app.use("/api/v1/books", books);

const PORT = 1010;

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
