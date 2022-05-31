import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";
import handlebars from "express-handlebars";
import generateRandomProduct from "./src/class/fakerContainer.js";
import MongoStore from 'connect-mongo';
import dotenv from "dotenv";
dotenv.config();

const app = express();


const listProducts = generateRandomProduct(5)

/*============================[Middlewares]============================*/

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// const MongoStore = connectMongo.create({
//   mongoUrl: process.env.MONGODB_URI,
//   collection: 'users',
//   ttl:600
// })

app.use(cookieParser());

app.use(session({
  store: MongoStore.create({
    mongoUrl: process.env.MONGO,
    collectionName: 'newUsers',
    ttl: 6
    // mongoOptions: {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // },

  }),
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  // cookie: {
  //   maxAge: 600000,
  // }
}))


/*=======================[Motor de Plantillas]=======================*/
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  defaultLayout: 'main.hbs',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
}))

app.set('view engine', 'hbs')
app.set('views', './views')

/*============================[Base de Datos]============================*/
const usuariosDB = []


/*============================[Rutas Info]============================*/
app.get('/info', (req, res) => {
  res.send({
    cokkies: req.cookies,
    session: req.session,
  });
})

app.get('/session', (req, res) => {
  if (req.session.contador) {
    req.session.contador++;
    res.send(`Ha visitado el sitio ${req.session.contador} veces`)
  } else {
    req.session.contador = 1;
    res.send(`Bienvenido! ${req.session.nombre}`);
  }
})


/*============================[Rutas Views]============================*/
const routerHandlebars = express.Router()

app.use(routerHandlebars)

routerHandlebars

  .get('/productos', (req, res) => {
    if (req.session.nombre) {
      const nombre = req.session.nombre
    res.render('faker', { listProducts, nombre })
    } else {
      res.render('/login')
    }
  })

  .get('/', (req, res) => {
    if (req.session.nombre) {
      res.render('ingreso', { listProducts })
    } else {
      res.redirect('/login')
    }
  })

  .get('/login', (req, res) => {
    res.render('login');
  })

  .post('/login', (req, res) => {
    const { nombre, email, password } = req.body;
    const usuario = usuariosDB.find(usuario => usuario.nombre == nombre && usuario.email == email && usuario.password == password);
    if (!usuario) {
      console.log('usuario no registrado');
      res.redirect('/login-error')
    } else {
      if (usuario.password != password) {
        res.redirect('/login-error');
      } else {
        req.session.nombre = nombre;
        req.session.contador = 0;
        req.session.contador++;
        res.render('ingreso', { nombre: req.session.nombre });
      }
    }
  })

  .get('/login-error', (req, res) => {
    res.render('login-error');
  })

  .get('/registro', (req, res) => {
    res.render('registro');
  })

  .post('/registro', (req, res) => {
    const { nombre, email, password } = req.body;
    const usuario = usuariosDB.find(usuario => usuario.nombre == nombre && usuario.email == email && usuario.password == password);
    if (usuario) {
      res.render('registro-error');
    } else {
      usuariosDB.push(req.body);
      console.log({ usuariosDB });
      res.redirect('/login');
    }
  })


  .get('/logout', (req, res) => {
    const nombre = req.session.nombre
    req.session.destroy((err) => {
      if (!err) {
        res.render('logout', { nombre });
      } else {
        res.json(err);
      }
    })
  })
  ;

/*============================[Servidor]============================*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en Puerto ${PORT} en http://localhost:${PORT}`);
});
app.on('error', (err) => {
  console.log(err);
});