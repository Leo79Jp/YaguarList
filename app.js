const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar EJS como motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
  res.render('pages/index', { title: 'Yaguar!' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});