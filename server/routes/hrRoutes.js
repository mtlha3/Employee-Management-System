import express from "express";
import {
  submitHrRequest,
  getAllHRRequests,
  updateHRRequestStatus,
  getMyHRRequests,
  getAllEmployees,
  resetEmployeePassword,
  updateEmployee
} from "../controller/hrController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/request-hr", submitHrRequest);
router.get("/requests", getAllHRRequests);
router.put("/requests/:id/status", updateHRRequestStatus);
router.get("/my-requests", authenticateToken, getMyHRRequests);
router.get("/employees", authenticateToken, getAllEmployees);
router.put("/reset-password/:employeeId", authenticateToken, resetEmployeePassword);
router.put("/update/:employeeId", authenticateToken, updateEmployee);

export default router;
