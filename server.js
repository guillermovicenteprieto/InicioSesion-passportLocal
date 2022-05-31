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
/*
passport.use(new LocalStrategy(
  {
    usernameField: 'nombre',
    emailField: 'email',
    passwordField: 'password'
  },
  (nombre, email, password, done) => {
    const user = usuariosDB.findOne(user => user.nombre === nombre)
    console.log(user)
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' })
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return done(null, false, { message: 'Incorrect password.' })
    }
    return done(null, user)
  }
  ))
  
  
  */
passport.use(new LocalStrategy(
  (username, password, done) => {
    const usuario = usuariosDB.find(usuario => username == username);
    console.log(`usuario: ${usuario}`)
    // bcrypt.compare(password, existeUsuario.password, (err, res) => {
    //   if (err) {
    //     console.log(err);
    //     return done(null, false, { message: 'Error al autenticar' });
    //   }
    //   if (res) {
    //     return done(null, existeUsuario);
    //   }
    // })

    if (!usuario) {
      console.log('Usuario no encontrado')
      return done(null, false);
    } else {
      console.log(`usuario: ${usuario}`)
      if (usuario.password == password) {
        console.log('Usuario encontrado')
        return done(null, usuario);
      } else {
        console.log('Contraseña incorrecta')
        return done(null, false);
      }
    }
  }
));





//     if (!(usuario.password == password)) {
//       console.log('Password inválido')
//       return done(null, false);
//     }

//     return done(null, username);
//   }
// ))

/*
 
passport.serializeUser((user, done) => {
  console.log(`Serializando usuario ${user.nombre}`)
  done(null, user.id);
});
 
passport.deserializeUser((id, done) => {
  const user = usuariosDB.findOne({ id: id });
  console.log(user)
  console.log(`Deserializando usuario ${user.nombre}`)
  done(null, user);
});
 
*/
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

app.use(session({
  store: MongoStore.create({
    mongoUrl: process.env.MONGO,
    collectionName: 'mandarina',
    ttl: 600000
  }),
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  // cookie: {
  //   maxAge: 60000,
  // }
}))

passport.serializeUser((usuario, done) => {

  done(null, usuario);
})

passport.deserializeUser((usuario, done) => {
  //const usuario = usuariosDB.find(usuario => usuario.nombre == nombre);
  // console.log(`Deserializando usuario ${usuario.nombre}`)
  done(null, usuario);
});

app.use(passport.initialize());
app.use(passport.session());


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

  .get('/productos', (req, res) => {
    if (req.session.username) {
      const nombre = req.session.username
      res.render('faker', { listProducts, nombre })
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


  // .post('/login', (req, res) => {
  //   res.render('ingreso');
  // })

  .post('/login', passport.authenticate('local', {
    failureRedirect: '/login'
  }), (req, res) => {

    const { username, email, password } = req.body;
    const usuario = usuariosDB.find(usuario => usuario.username == username);
    if (!usuario) {
      console.log('usuario no registrado');
      res.redirect('/login-error')
    } else {
      if (usuario.password != password) {
        res.redirect('/login-error');
      } else {
        req.session.contador = 0;
        req.session.contador++;
        req.session.username = username;
        res.render('ingreso', { nombre: usuario.username, listProducts }) 
      }
    }

  })






  /*
    .post('/login', (req, res) => {
  
      const { nombre, email, password } = req.body;
      const usuario = usuariosDB.find(usuario => usuario.nombre == nombre && usuario.email == email && usuario.password == password);
  
      // const user = usuariosDB.findOne({ nombre, email, password })
      // console.log(user)
  
      // const usuario = user
      // const usuario = usuariosDB.findOne({ nombre, email, password }, (err, usuario) => {
      //   if (err) {
      //     console.log(err);
      //     return res.status(500).send('Error en la petición');
      //   }
      // })
  
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
  */
  .get('/login-error', (req, res) => {
    res.render('login-error');
  })

  .get('/registro', (req, res) => {
    res.render('registro');
  })

  // .get('/registro', (req, res) => {
  //   console.log('datos req.user', req.user)
  //   console.log('datos req.user', req.session.passport.usario)

  //   res.render('registro', { nombre: req.user.nombre });
  // })

  .post('/registro', (req, res) => {
    const { username, email, password } = req.body;
    const usuario = usuariosDB.find(usuario => usuario.nombre === username);
    if (usuario) {
      res.render('registro-error');
    } else {
      usuariosDB.push(req.body);
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
  console.log(`Servidor corriendo en Puerto ${PORT} en http://localhost:${PORT}`);
});
app.on('error', (err) => {
  console.log(err);
});