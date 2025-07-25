import bcrypt from "bcryptjs";
import HrRequest from "../models/hr_requests.js";
import Employee from "../models/employeeInfo.js";

//===================== HR REQUESTS =====================//

export const submitHrRequest = async (req, res) => {
  const { employeeId, requestTitle, requestQuery } = req.body;

  if (!employeeId || !requestTitle || !requestQuery) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    await HrRequest.create({
      employeeId,
      requestTitle,
      requestQuery,
    });


    res.status(201).json({ message: "Request submitted successfully!" });
  } catch (err) {
    console.error("Error submitting HR request:", err.message);
    res.status(500).json({ error: "Failed to submit HR request" });
  }
};

//=====================
export const getAllHRRequests = async (req, res) => {
  try {
    const requests = await HrRequest.find().sort({ createdAt: -1 });

    const formatted = requests.map((req) => ({
      id: req._id,
      employee_id: req.employeeId,
      title: req.requestTitle,
      request_query: req.requestQuery,
      status: req.status,
      created_at: req.createdAt,
    }));

    res.status(200).json({ requests: formatted });
  } catch (error) {
    console.error("Error fetching HR requests:", error);
    res.status(500).json({ error: "Failed to fetch HR requests" });
  }
};

//=========================

export const updateHRRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status?.toLowerCase())) {
    return res.status(400).json({ error: "Invalid status. Must be 'approved' or 'rejected'." });
  }

  try {
    const updated = await HrRequest.findByIdAndUpdate(
      id,
      { status: status.toLowerCase(), updated_at: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json({ message: "Status updated successfully", request: updated });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ error: "Failed to update request status" });
  }
};

export const getMyHRRequests = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const requests = await HrRequest.find({ employee_id: employeeId }).sort({ created_at: -1 });

    const formatted = requests.map((req) => ({
      id: req._id,
      title: req.requestTitle,
      request_query: req.requestQuery,
      status: req.status,
    }));

    res.status(200).json({ requests: formatted });
  } catch (error) {
    console.error("Error getting HR requests:", error);
    res.status(500).json({ error: "Failed to get HR requests" });
  }
};

//===================== EMPLOYEE OPERATIONS =====================//

export const getAllEmployees = async (req, res) => {
  const { search } = req.query;

  try {
    const query = search
      ? {
        $or: [
          { employee_id: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ],
      }
      : {};

    const employees = await Employee.find(query, "employee_id name email role status");
    res.status(200).json({ employees });
  } catch (err) {
    console.error("Error fetching employees:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resetEmployeePassword = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const defaultPassword = "employee123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const updated = await Employee.findOneAndUpdate(
      { employee_id: employeeId },
      { password: hashedPassword }
    );

    if (!updated) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Password reset successfully to 'employee123'" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

export const updateEmployee = async (req, res) => {
  const { employeeId } = req.params;
  const { name, email, role, status } = req.body;

  try {
    const updated = await Employee.findOneAndUpdate(
      { employee_id: employeeId },
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(status && { status }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Employee updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update employee" });
  }
};
