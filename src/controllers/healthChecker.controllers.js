import ApiResponse from "../utils/api-response.js";
import { asyncHandler} from "../utils/async-handler.js";

// const healthChecker = async (req, res, next) => {
//     try {
//         res.status(200).json(
//             new ApiResponse(200, {message: "Sucess"})
//         )
//     } catch (error) {
//         next(error)
//     }
// }

const healthChecker = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, {message: "Server is running"})
    )
})

export default healthChecker