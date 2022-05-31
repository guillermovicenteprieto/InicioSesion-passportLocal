
// import express from "express";
import { Router } from "express";

import generateRandomProduct from "./controllers/fakerContainer.js";
import passport from "passport";

const listProducts = generateRandomProduct(5)
const router = Router()
import bcrypt from 'bcrypt'
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
    console.log('Contraseña Anterior: ', usuario.password);
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
      console.log('Nuevo Hash password: ', hash);
      bcrypt.compare(usuario.password, hash, function (err, result) {  
        if (result) {
          console.log("Coincidencia de password")
          return true;
        }
        else {
          console.log("Invalid password!");
          return false;
        }
      });
  
    } catch (error) {
      console.log(error)
    }
    }




    
/*============================[Función isAuth]============================*/

function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
      next()
    } else {
      res.redirect('/login')
    }
  }
  
  /*============================[Rutas Info]============================*/
  router.get('/info', (req, res) => {
    res.send({
      cokkies: req.cookies,
      session: req.session,
    });
  })
  
  router.get('/session', (req, res) => {
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
  
  routerHandlebars
  

    .get('/productos', isAuth, (req, res) => {
      if (req.session.username) {
        const nombre = req.session.username
        console.log(req.session.username)
        console.log({ nombre })
  
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
  
    .post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
      const { username, password } = req.body;
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
        res.render('registro-error');
      } else {
        usuariosDB.push({username, email, password: await createHash(password)});
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
    export default router