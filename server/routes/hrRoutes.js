const express = require("express");
const router = express.Router();
const { submitHrRequest, getAllHRRequests, updateHRRequestStatus, getMyHRRequests } = require("../controller/hrController");
const verifyEmployeeAuth = require("../middleware/authMiddleware")

router.post("/request-hr", submitHrRequest);
router.get('/requests', getAllHRRequests);
router.put("/requests/:id/status", updateHRRequestStatus);
router.get("/my-requests", verifyEmployeeAuth, getMyHRRequests);

module.exports = router;
