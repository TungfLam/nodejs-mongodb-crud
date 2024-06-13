const express = require("express");
const crypto = require("crypto");
const morgan = require("morgan");
const faviconMiddleware = require("./middlewares/faviconMiddleware");
const cors = require("cors");
var session = require("express-session");

const app = express();
const port = 3000;

const apiRouter = require("./routes/api");

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.set("view engine", "ejs");
app.use(faviconMiddleware);
app.use(morgan("dev"));
app.use(cors());

const secret = crypto.randomBytes(64).toString("hex");
app.use(
  session({
    secret: secret,
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.send("running");
});

app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status | 1 | 500);
  if (req.originalUrl.indexOf("/api") == 0) {
    res.json({
      status: 0,
      msg: err.message,
    });
  } else {
    res.render("error");
  }
});

app.listen(port, () => {
  console.log(`server runing port ${port} `);
});

