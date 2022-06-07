import passport from "passport";
import { Strategy } from "passport-local";
import { verifyPassword, createHash } from './validate.js';
import User from "../models/User.js";

const LocalStrategy = Strategy;

export const login = new LocalStrategy(
    (username, password, done) => {
        const usuario = User.findOne({ username: username }, (err, usuario) => {
            if (err) {
                return done(err);
            }
            if (!usuario) {
                return done(null, false, { message: "Usuario no encontrado" });
            }
            if (!verifyPassword(usuario, password)) {
                return done(null, false, { message: "Contraseña incorrecta" });
            }
            return done(null, usuario);
        });
    }
);

export const signup = new LocalStrategy(
    {
        passReqToCallback: true
    },
    (req, username, password, done) => {

        const usuario = User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
          })
          usuario.save();
            return done(null, usuario);

        } 
);








passport.serializeUser((usuario, done) => {
    done(null, usuario);
})



passport.deserializeUser((id, done) => {
    done(null, id);
});