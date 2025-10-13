import mongoose from "mongoose"


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("DATABASE CONNECTED")
    } catch (error) {
        console.log("MONGO CONNECTION ERROR"); 
       process.exit() 
    }   
}

export default connectDB