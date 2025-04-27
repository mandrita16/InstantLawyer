import dotenv from 'dotenv'
import {app} from './app.js'
import {connectDB} from "./connectDB/congfig.db.js"

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
        console.log("MongoDB Connection failed", error);
    })