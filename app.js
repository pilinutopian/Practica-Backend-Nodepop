var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var indexRouter = require('./routes/index');

// conectar a base de datos y modelos
require('./lib/connectMongoose');
require('./routes/api/anuncios');
var app = express();

app.locals.title = 'NodePop';
 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/anuncios', require('./routes/api/anuncios'));

// WEB routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  
  // comprobar si es un error de validación
  if (err.array) {
    err.status = 422; // error de validacion
    const errorInfo = err.array({ onlyFirstError: true})[0];
    console.log(errorInfo);
    err.message = `Error in ${errorInfo.location}, param "${errorInfo.param}" ${errorInfo.msg}`;
  }
 
  // render the error page
  res.status(err.status || 500);

  // si es petición al API, responder en formato JSON
  if (req.originalUrl.startsWith('/api/')) {
    res.json({ error: err.message });
    return;
  } 

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
 
  res.render('error');
});

module.exports = app;
