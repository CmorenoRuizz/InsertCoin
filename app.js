var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const sharedsession = require('express-socket.io-session'); // Nueva importación

var indexRouter = require('./routes/index');
const arcadeRouter = require('./routes/arcade');
const rankingRouter = require('./routes/ranking');
const contactRouter = require('./routes/contact');
const adminRouter = require('./routes/admin');
const configRouter = require('./routes/config');
const salaRouter = require('./routes/sala');
const usuarioRouter = require('./routes/usuario');

var app = express();

// Configuración de session antes de crear el servidor HTTP
const sessionMiddleware = session({
  secret: '2A25122DA6116',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
});

app.use(sessionMiddleware);

//Middleware global
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', arcadeRouter);
app.use('/', rankingRouter);
app.use('/', contactRouter);
app.use('/', adminRouter);
app.use('/', configRouter);
app.use('/', salaRouter);
app.use('/usuario', usuarioRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Crear servidor HTTP después de configurar Express
const http = require('http');
const server = http.createServer(app);

// Configurar Socket.IO para usar la misma sesión
const { Server } = require('socket.io');
const io = new Server(server);

// Compartir la sesión con Socket.IO usando la biblioteca especializada
io.use(sharedsession(sessionMiddleware, {
  autoSave: true
}));

const setupSocket = require('./routes/socket');
setupSocket(io);

module.exports = { app, server };

