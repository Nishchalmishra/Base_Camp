import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/database.js";


dotenv.config();

const PORT = process.env.PORT || 5000;


connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("MONGO CONNECTION ERROR");
        process.exit()
    })


