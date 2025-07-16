import express from "express";
import {
  signupEmployee,
  loginEmployee,
  logoutEmployee,
  getCurrentEmployee
} from "../controller/employeeController.js";

const router = express.Router();

router.post("/signup", signupEmployee);
router.post("/login", loginEmployee);
router.post("/logout", logoutEmployee);
router.get("/me", getCurrentEmployee);

export default router;
