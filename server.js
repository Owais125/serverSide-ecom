import express from 'express'
import colors from 'colors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoute.js'
import categoryRoutes from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoute.js'
import cors from 'cors'
// import path from 'path'
// import { fileURLToPath } from 'url'


const app = express()
dotenv.config()
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
// app.use(express.static(path.join(__dirname,'./client/build')))


// const __filename = fileURLToPath(import.meta.url)

// const __dirname = path.dirname(__filename)


app.get('/',(req,res)=>{
    res.send("<h1>Welcome to E Commerce App</h1>")
})

// app.use('*',function(req,res){
// res.sendFile(path.join(__dirname,'./client/build/index.html'))
// })



app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/category',categoryRoutes)
app.use('/api/v1/product',productRoutes)



const PORT = process.env.PORT || 8080
const DEV_MODE = process.env.DEV_MODE 
connectDB()
app.listen(PORT ,()=>{
    console.log(`Server is Runing on ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan.white)
})