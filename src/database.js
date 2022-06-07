import mongoose from "mongoose";
const mongoDB = process.env.MONGO_URI || "mongodb://localhost/loginPassportLocal";
(async () => {
    try {
        const db = await mongoose.connect(mongoDB);
        console.log('Conectado a mongoDB ' + db.connection.host + ':' + db.connection.port + '/' + db.connection.name);
    } catch (error) {
        console.log(error);
    }
})();
