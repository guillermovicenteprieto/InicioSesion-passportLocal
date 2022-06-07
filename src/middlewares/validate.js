import bcrypt from 'bcrypt'

export const createHash = (password) => {
    bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

export const verifyPassword = (usuario, password) => {
    if (usuario) {
        bcrypt.compare(password, usuario.password, function (err, result) {
            if (err) {
                console.log(err);
                return false;
            } else if (result) {
                console.log('Contraseña válida');
                return true;
            }
        })
    }
}