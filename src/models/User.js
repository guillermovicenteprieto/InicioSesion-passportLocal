import mongoose from "mongoose"

export const User = mongoose.model('User', new mongoose.Schema({
    name: String, 
    username: String,
    email: String,
    password: String
}));