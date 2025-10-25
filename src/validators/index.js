import { body } from "express-validator"


const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be lowercase")
            .isLength({ min: 3, max: 20 })
            .withMessage("Username must be between 3 and 20 characters"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long")
            
    ]
}

const userLoginValidator = () => {
    return [
        body("email")
            .optional()
            .isEmail()
            .withMessage("Email is invalid")
            .notEmpty()
            .withMessage("Email is required"),
        body("username")
            .optional()
            .isLowercase()
            .withMessage("Username must be lowercase"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
    ]
}


export {
    userRegisterValidator,
    userLoginValidator
}
