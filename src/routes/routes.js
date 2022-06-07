import { Router } from "express";
import passport from "passport";
import { isAuth } from "../middlewares/isAuth.js";
import { info } from "../utils/info.js";
import { fork } from "child_process";
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
    //const product = listProducts[Math.floor(Math.random() * listProducts.length)]
    //res.json(product)
    let cant = req.query.cant || 1000000;
    let passCant = ['' + cant + '']
    const child = fork('./src/utils/random.js');
    child.send(passCant);
    child.on('message', (operation) => {
      res.json(operation);
    })
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
      const nombre = req.user.username
      const email = req.user.email
      res.render('ingreso', { listProducts, nombre, email })
    } else {
      res.redirect('/login')
    }
  })
  .get('/login', (req, res) => {
    res.render('login');
  })
  .post('/login', passport.authenticate('login',
    { failureRedirect: '/login-error' }), (req, res) => {
      res.render('ingreso', { listProducts, nombre: req.user.username, email: req.user.email })
    })
  .get('/login-error', (req, res) => {
    res.render('login-error');
  })
  .get('/registro', (req, res) => {
    res.render('registro');
  })
  .post('/registro', passport.authenticate('signup',
    { failureRedirect: '/registro-error' }), (req, res) => {
      res.redirect('/login')
  })
  .get('/logout', (req, res) => {
    const nombre = req.user.username
    req.session.destroy((err) => {
      if (!err) {
        res.render('logout', { nombre });
      } else {
        res.json(err);
      }
    })
  })

export default Router