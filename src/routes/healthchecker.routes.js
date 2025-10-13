import { Router } from "express";
import healthChecker from "../controllers/healthChecker.controllers.js"; 

const router = Router();

router.route("/").get(healthChecker)

export default router