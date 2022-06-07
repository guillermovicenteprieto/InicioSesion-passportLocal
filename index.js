import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";
import handlebars from "express-handlebars";
import passport from "passport";
import { PORT } from "./src/utils/port.js";
import { routerInfo, routerHandlebars } from "./src/routes/routes.js";

import dotenv from "dotenv";
dotenv.config();
import './src/database.js';
import { login, signup } from "./src/middlewares/passportLocal.js";

const app = express();

/*============================[Middlewares]============================*/
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 600000,
  }
}))

passport.use('login', login);
passport.use('signup', signup)

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

/*============================[Rutas Info]============================*/
app.use('/', routerInfo)
/*============================[Rutas Views]============================*/
app.use('/', routerHandlebars)

/*============================[Servidor]============================*/
app.listen(PORT, () => {
  console.log(`ServerPassport corriendo en Puerto ${PORT} en http://localhost:${PORT}`);
});
app.on('error', (err) => {
  console.log(err);
});