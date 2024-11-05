const express = require('express');
const lzString = require("../public/lzstring/lz-string");
const path = require('path');

const dataLookupByStudent = {};
let antiDdosMultiplier = 1.0;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../client')));
app.use('/prism', express.static(path.join(__dirname, '../public/prism')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.header(
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  next();
});

// Redireccionar a login.html cuando se acceda a la raíz
app.get('/', function(req, res) {
  res.redirect('/login.html');
});

app.get('/data', function (req, res) {
  const uncompressedData = JSON.stringify([dataLookupByStudent, antiDdosMultiplier]);
  const compressedData = lzString.compressToUTF16(uncompressedData);
  res.end(compressedData);
});

app.post('/', function(req, res) {
  const name = req.body.name;
  const version = req.body.version;
  const dataModel = req.body.dataModel;

  if (!dataLookupByStudent.hasOwnProperty(name) || version > dataLookupByStudent[name][0]) {
    dataLookupByStudent[name] = [version, dataModel];
  }

  res.end('added to map');
});

app.post("/ddos", function (req, res) {
  const newVal = req.body.multiplier;
  if (newVal > 0.5 && newVal < 10) {
    antiDdosMultiplier = newVal;
    console.log("Updated anti-DDOS multiplier to", newVal);
  }
  res.end();
});

app.delete('/', function(req, res) {
  dataLookupByStudent = {};
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    // Validar el correo electrónico y la contraseña
    if (email === 'mikhailvelasque15@gmail.com' && password === 'contraseña') {
        res.send({ success: true });
    } else {
        res.status(401).send({ success: false, message: 'Credenciales incorrectas' });
    }
});

app.get('/check-auth', (req, res) => {
    // Aquí podrías verificar si la sesión del usuario está activa
    res.send({ authenticated: true }); // Cambia esto a 'false' si el usuario no está autenticado
});

app.listen(process.env.PORT || 3000, function() {
  console.log('server is running on port 3000');
});
