import express from "express";
import {
  signupEmployee,
  loginEmployee,
  logoutEmployee,
  getCurrentEmployee,
  getAllEmployees
} from "../controller/employeeController.js";

const router = express.Router();

router.post("/signup", signupEmployee);
router.post("/login", loginEmployee);
router.post("/logout", logoutEmployee);
router.get("/me", getCurrentEmployee);
router.get("/all", getAllEmployees);

export default router;
