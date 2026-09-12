const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const indexRouter = require('./src/routes/index');
app.use('/', indexRouter);

app.listen(PORT, () => {
  console.log(`Yaguar! corriendo en http://localhost:${PORT}`);
});

module.exports = app;