import dotenv from 'dotenv'
import {app} from './app.js'
import {connectDB} from "./connectDB/congfig.db.js";

dotenv.config({
    path:'./.env'
})


connectDB()
    .then(() => {

        app.on('Error', (error) => {
            console.log('Error', error)
            throw error;

        })
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at Port : ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log("MongoDB  Connection failed", error);
    })
    const cors = require('cors');

    // Allow only your Vercel frontend URL
    const corsOptions = {
      origin: 'https://instantlawyer.vercel.app/', // replace with your actual URL
      credentials: true,
    };
    
    app.use(cors(corsOptions));