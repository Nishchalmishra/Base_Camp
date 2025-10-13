import ApiError from "../utils/api-error";
import ApiResponse from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import User from "../model/user.model";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    const existedUser = await User.findOne(
        {
            $or: [{username}, {email}]
        }
    )

    if (existedUser) {
        throw new ApiError(409, "User already exists", [])
    }

    const user = await User.create({
        username, 
        email,
        password,
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
            unhashedToken
        )
    })

    const createdUser = await user.findById(user._id).select("-password")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user")
    }

    return res.status(201).json(
        new ApiResponse(201, "User created successfully", createdUser))
    

})