import bcrypt from 'bcrypt'

export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password)

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);