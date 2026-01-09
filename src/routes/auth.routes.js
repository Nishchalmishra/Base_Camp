import { Router } from "express";
import { registerUser, login, logoutUser, verifyEmail,forgotPassword, refreshAccessToken, resetForgotPassword, getCurrentUser, changeCurrentPassword, resendEmailVerification } from "../controllers/auth.controllers.js";
import { userLoginValidator, userRegisterValidator, userForgotPasswordValidator, userResetForgotPasswordValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router();

// unsecured route
router.route("/register").post(userRegisterValidator(), registerUser)
router.route("/login").post(userLoginValidator(), login)
router.route("/verify-email/:verificationToken").get( verifyEmail)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/forgot-password").post(userForgotPasswordValidator(),  forgotPassword)
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(),  resetForgotPassword)


// secured route
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/get-current-user").post(verifyJWT, getCurrentUser)
router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification)
router.route("/change-password").post(verifyJWT, userForgotPasswordValidator(), changeCurrentPassword)



export default router
