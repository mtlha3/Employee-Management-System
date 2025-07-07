const express = require("express");
const router = express.Router();
const { submitHrRequest, getAllHRRequests, updateHRRequestStatus, getMyHRRequests,getAllEmployees,resetEmployeePassword, updateEmployee } = require("../controller/hrController");
const verifyEmployeeAuth = require("../middleware/authMiddleware")

router.post("/request-hr", submitHrRequest);
router.get('/requests', getAllHRRequests);
router.put("/requests/:id/status", updateHRRequestStatus);
router.get("/my-requests", verifyEmployeeAuth, getMyHRRequests);
router.get("/employees", verifyEmployeeAuth, getAllEmployees);
router.put("/reset-password/:employeeId", verifyEmployeeAuth, resetEmployeePassword)
router.put("/update/:employeeId", verifyEmployeeAuth, updateEmployee)


module.exports = router;
