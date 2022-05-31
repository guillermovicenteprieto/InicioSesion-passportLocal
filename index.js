import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";
import handlebars from "express-handlebars";
import generateRandomProduct from "./src/class/fakerContainer.js";
import MongoStore from 'connect-mongo';
import dotenv from "dotenv";
dotenv.config();

import bcrypt from 'bcrypt'

import passport from "passport";
import { Strategy } from "passport-local";
const LocalStrategy = Strategy;

const app = express();
const listProducts = generateRandomProduct(5)

/*============================[Base de Datos]============================*/
const usuariosDB = []

/*==========================[Passport-local]==========================*/

passport.use(new LocalStrategy(
  async (username, password, done) => {
    const usuario = usuariosDB.find(usuario => username == username);
    console.log({ usuario })
    if (usuario) {
      bcrypt.compare(password, usuario.password, (err, res) => {
        if (err) {
          console.log(err);
          return done(null, false, { message: 'Error al autenticar' });
        }
        if (res) {
          return done(null, usuario);
        }
      })
    }

    if (await verifyPassword(usuario, password)) {
      console.log('Contraseña inválida')
      return done(null, false);
    }

    return done(null, usuario);

  }

));

/*============================[Middlewares]============================*/

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

app.use(session({
  store: MongoStore.create({
    mongoUrl: process.env.MONGO,
    collectionName: 'madrugadaSession',
    ttl: 600000
  }),
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 600000,
  }
}))

passport.serializeUser((usuario, done) => {
  done(null, usuario);
})

passport.deserializeUser((usuario, done) => {
  done(null, usuario);
});

app.use(passport.initialize());
app.use(passport.session());


/*============================[Metodos Autenticación]============================*/
async function createHash(password) {
  const saltRounds = 10;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.log(error)
  }
}

async function verifyPassword(usuario, password) {
  const saltRounds = 10;
  if (usuario) {
    console.log('Contraseña Anterior: ', usuario.password);
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(usuario.password, salt);
      console.log('Nuevo Hash password: ', hash);
      bcrypt.compare(usuario.password, hash, function (err, result) {
        if (result) {
          console.log("Coincidencia de Password")
          return true;
        }
        else {
          console.log("Comparación de Password incorrecta!");
          return false;
        }
      });
    } catch (error) {
      console.log(error)
    }
  }
}

/*=======================[Motor de Plantillas]=======================*/
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  defaultLayout: 'main.hbs',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
}))

app.set('view engine', 'hbs')
app.set('views', './views')

/*============================[Función isAuth]============================*/

function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/login')
  }
}

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
    res.send(`Bienvenido!`);
  }
})

/*============================[Rutas Views]============================*/
const routerHandlebars = express.Router()

app.use(routerHandlebars)

routerHandlebars

  .get('/productos', isAuth, (req, res) => {
    if (req.session.username) {
      const nombre = req.session.username
      const email = req.session.email
      console.log({ nombre, email })

      res.render('faker', { listProducts, nombre, email })
    } else {
      res.redirect('/login')
    }
  })

  .get('/', (req, res) => {
    if (req.session.username) {
      res.render('ingreso', { listProducts })
    } else {
      res.redirect('/login')
    }
  })

  .get('/login', (req, res) => {
    res.render('login');
  })

  .post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    const { username, email, password } = req.body;
    const usuario = usuariosDB.find(usuario => usuario.username == username);
    if (!usuario) {
      console.log('usuario no registrado');
      res.redirect('/login-error')
    } else {
    //   if (usuario.password != password) {
    //     res.redirect('/login-error');
    //   } else {
      req.session.contador = 0;
      req.session.contador++;
      req.session.username = username;
      req.session.email = email;
      res.render('ingreso', { nombre: usuario.username, email: usuario.email, listProducts })
      }
    // }
  })

  .get('/login-error', (req, res) => {
    res.render('login-error');
  })

  .get('/registro', (req, res) => {
    res.render('registro');
  })

  .post('/registro', async (req, res) => {
    const { username, email, password } = req.body;
    const usuario = usuariosDB.find(usuario => usuario.nombre === username);
    if (usuario) {
      res.render('/registro-error');
    } else {
      usuariosDB.push({ username, email, password: await createHash(password) });
      console.log({ usuariosDB });
      res.redirect('/login');
    }
  })

  .get('/logout', (req, res) => {
    const nombre = req.session.username
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
  console.log(`ServerPassport corriendo en Puerto ${PORT} en http://localhost:${PORT}`);
});
app.on('error', (err) => {
  console.log(err);
});