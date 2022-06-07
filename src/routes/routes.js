import { Router } from "express";
import passport from "passport";
import { Strategy } from "passport-local";
import { login, signup } from "../middlewares/passportLocal.js";
import { isAuth } from "../middlewares/isAuth.js";
import { info } from "../utils/info.js";
import User from "../models/User.js";
import generateRandomProduct from "../class/fakerContainer.js";
const listProducts = generateRandomProduct(10)

export const routerInfo = Router()
export const routerHandlebars = Router()


/*============================[Rutas Info]============================*/
routerInfo

  .get('/info', (req, res) => {
    res.json({ info: info() })
  })

  .get('/session', (req, res) => {
    if (req.session.contador) {
      req.session.contador++;
      res.send(`Ha visitado el sitio ${req.session.contador} veces`)
    } else {
      req.session.contador = 1;
      res.send(`Bienvenido!`);
    }
  })

  .get('/random', (req, res) => {

    const product = listProducts[Math.floor(Math.random() * listProducts.length)]
    res.json(product)
  })

/*============================[Rutas Views]============================*/
routerHandlebars

  .get('/productos', isAuth, (req, res) => {
    if (req.user.username) {
      const nombre = req.user.username
      const email = req.user.email
      res.render('faker', { listProducts, nombre, email })
    } else {
      res.redirect('/login')
    }
  })

  .get('/', (req, res) => {
    if (req.session.username) {
      const nombre = req.session.username
      res.render('ingreso', { listProducts, nombre })
    } else {
      res.redirect('/login')
    }
  })

  .get('/login', (req, res) => {
    res.render('login');
  })

  .post('/login', passport.authenticate('login',
    { failureRedirect: '/login-error' }), async (req, res) => {
      const usuario = await User.findOne({ username: req.body.username })
      if (usuario) {
        req.session.username = usuario.username;
        req.session.email = usuario.email;
        req.session.save();
        res.render('ingreso', { listProducts, nombre: req.session.username })
      } else {
        res.redirect('/login-error')
      }
    })

  .get('/login-error', (req, res) => {
    res.render('login-error');
  })

  .get('/registro', (req, res) => {
    res.render('registro');
  })


  // viejo post /registro
  /* 
    .post('/registro', async (req, res) => {
      try {
        const usuario = User({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password
        })
        const usuarioDB = await usuario.save();
        res.redirect('/login')
      } catch (error) {
        console.log(error)
      }
    })
  */

  // nuevo post /registro
  .post('/registro', passport.authenticate('signup',
    { failureRedirect: '/registro-error' }), (req, res) => {
      res.redirect('/login')
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

export default Router