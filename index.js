import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";
import handlebars from "express-handlebars";
import passport from "passport";
import dotenv from "dotenv";
dotenv.config();
import './src/database.js';
import { PORT } from "./src/utils/port.js";
import { routerInfo, routerHandlebars } from "./src/routes/routes.js";
import { loginStrategy, signupStrategy } from "./src/middlewares/passportLocal.js";

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

passport.use('login', loginStrategy);
passport.use('signup', signupStrategy)

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
app.use('/api', routerInfo)
/*============================[Rutas Views]============================*/
app.use('/', routerHandlebars)

/*============================[Servidor]============================*/
app.listen(PORT, () => {
  console.log(`Server corriendo en Puerto ${PORT}: http://localhost:${PORT}`);
});
app.on('error', (err) => {
  console.log(err);
});