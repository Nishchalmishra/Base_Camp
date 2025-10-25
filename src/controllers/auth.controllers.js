import { User } from "../model/user.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-error.js";
import { sendEmail, emailVerificationMailgenContent } from "../utils/mail.js  "
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

 
const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body

    const existedUser = await User.findOne({
        $or: [{ username }, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists", [])
    }


    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false
    })

    const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()
    
    user.emailVerificationToken = hashedToken
    user.emailVerificationTokenExpiry = tokenExpiry
    await user.save({ validateBeforeSave: false })


    await sendEmail({
        email: user?.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailgenContent(
            user?.username, 
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`
        ),
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry"
    )

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                "User created successfully",
                { user: createdUser })
        )

})

const login = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Email or username is required")
    }
    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordMatched(password)

    if (!isPasswordValid) {
        throw new ApiError(400, "Password is incorrect")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry"
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        
        )
    
}
)

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            },
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "User details fetched successfully"
            )
        )
})


const verifyEmail = asyncHandler(async (req, res) => {
    // const { verificationToken } = req.params
    
    // if(!verificationToken) {
    //     throw new ApiError(400, "Verification token is required")
    // }

    // let hashedToken = crypto
    //     .createHash("sha256")
    //     .update(verificationToken)
    //     .digest("hex")
    
    // const user = await User.findOne({
    //     emailVerificationToken: hashedToken,
    //     emailVerificationTokenExpiry: { $gt: Date.now() }
    // })

    // if (!user) {
    //     throw new ApiError(400, "Token is invalid or expired")
    // }

    // user.isEmailVerified = true
    // user.emailVerificationToken = undefined
    // user.emailVerificationTokenExpiry = undefined
    // await user.save({ validateBeforeSave: false })
    
    const { emailVerificationToken } = req.params
    
    if(!emailVerificationToken) {
        throw new ApiError(400, "Verification token is required")
    }

    let hashedToken = crypto
        .createHash("sha256")
        .update(emailVerificationToken)
        .digest("hex")
    
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: { $gt: Date.now() }
    })

    if (!user) {
        throw new ApiError(400, "Token is invalid or expired")
    }

    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationTokenExpiry = undefined
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isEmailVerified: true
                },
                "Email verified successfully"
            )
    )
})

const resendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    if (user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified")
    }

    const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken
    user.emailVerificationTokenExpiry = tokenExpiry
    await user.save({ validateBeforeSave: false })


    await sendEmail({
        email: user?.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailgenContent(
            user?.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`
        ),
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Verification email sent successfully"
        )
    )


})

const refreshAccessToken = asyncHandler(async (req, res) => {

    // pahle refresh token ko store krna hoga 
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh token is required")
    }

    try {
        // ab jo refreshToken aaya h use decode krna h
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        // decoded refreshToken ke basis pr db me user ko find krna h
        const user = await User.findById(decodedRefreshToken?._id)
        if (!user) {
            throw new ApiError(400, "Invalid refresh token")
        }

        // ab  found user ki refresh token ko incoming refresh token se compare krna h
        if(incomingRefreshToken!==user?.refreshToken) {
            throw new ApiError(400, "Invalid refresh token")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)
        
        user.refreshToken = newRefreshToken
        await user.save({ validateBeforeSave: false })

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access token refreshed successfully"
                )
            
            )

    } catch (error) {
        throw new ApiError(400, "Invalid refresh token")
    }

})

export {
    registerUser,
    login,
    logoutUser,
    getCurrentUser,
    forgetPassword,
    verifyEmail
}
