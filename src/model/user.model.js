import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import crpyto from "crypto"

const userSchema = new Schema(
    {
        avatar: {
            type: {
                url: String,
                localPath: String
            },
            default: {
                url: `https://placehold.co/200x200`,
                localPath: ""
            }
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        fullName: {
            type: String,
            trim: true
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            trim: true,

        },

        isEmailVerified: {
            type: Boolean,
            default: false
        },

        emailVerificationToken: {
            type: String
        },

        emailVerificationTokenExpiry: {
            type: Date
        },

        refreshToken: {
            type: String
        },

        forgotPasswordToken: {
            type: String
        },

        forgotPasswordTokenExpiry: {
            type: Date
        },

        // role: {
        //     type: String,
        //     enum: ["admin", "project_admin", "member"],
        //     default: "member"
        // },
    }, {
        timestamps: true
    }
)


userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordMatched = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
        _id: this._id,
        username: this.username,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
}



userSchema.methods.generateTemporaryToken = function () {
    const unhashedToken = crpyto.randomBytes(32).toString("hex")

    const hashedToken = crpyto.createHash("sha256").update(unhashedToken).digest("hex")

    const tokenExpiry = Date.now() + (20 * 60 * 1000)
    
    return {unhashedToken, hashedToken, tokenExpiry}
}


export const User = mongoose.model("User", userSchema)


