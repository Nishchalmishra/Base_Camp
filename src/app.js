import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// Basic Configuration
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

// Cors Configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") || "https://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"]
}))

import healthcheckerRouter from "./routes/healthchecker.routes.js"
import authRouter from "./routes/auth.routes.js"

import mailtestRouter from "./routes/mailtest.routes.js"

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/healthcheck", healthcheckerRouter)
app.use("/api/v1/mailtest", healthcheckerRouter)


app.get("/", (req, res) => {
    res.send("Backend running successfully...")
})

export default app