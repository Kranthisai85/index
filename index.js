import 'dotenv/config';
import { db } from './models';
import { restRouter } from './api';
import config from './config';
import express from "express";
import appManager from './app';
import kue from './kue';
import './errors';
import scheduler from './scheduler';
import path from 'path';
import cors from 'cors';
global.appRoot = path.resolve(__dirname);
global.__basedir = __dirname + "/..";


const PORT = config.app.port;
const app = appManager.setup(config);

/*cors handling*/
app.use(cors({
  origin: true,
  credentials: true
}));
app.options('*', cors());


// Making Build Folder as Public
app.use(express.static(path.join(__dirname, 'build')));

// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

app.get('/', function (req, res) {
  res.send('<h1>Welcome to Buluckart Node.js Backend Server</h1>')
});


/* Route handling */
app.use('/api', restRouter);


app.use((req, res, next) => {
  next(new RequestError('Invalid route', 404));
});

app.use((error, req, res, next) => {
  if (!(error instanceof RequestError)) {
    error = new RequestError('Some Error Occurred', 500, error.message);
  }
  error.status = error.status || 500;
  res.status(error.status);
  let contype = req.headers['content-type'];
  var json = !(!contype || contype.indexOf('application/json') !== 0);
  if (json) {
    return res.json({ errors: error.errorList });
  } else {
    res.render(error.status.toString(), { layout: null })
  }
});

kue.init();
/* Database Connection */
db.sequelize.authenticate().then(function () {
  console.log('Nice! Database looks fine');
  scheduler.init();
}).catch(function (err) {
  console.log(err, "Something went wrong with the Database Update!")
});

/* Start Listening service */
var server = app.listen(PORT, () => {
  console.log(`Server is running at PORT http://localhost:${PORT}`);
});



// soccket here connections
module.exports = server
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  },
})

io.on("connection", function (socket) {
  // console.log("Socket Server connected");
  console.log("AdminPannel connected" + " " + socket.id);
  socket.on("toserver", (arg) => {
    socket.broadcast.emit("toadminpanel", arg);
    console.log(arg);
  });
});
