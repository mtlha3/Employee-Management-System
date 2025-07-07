const db = require("../db");

const submitHrRequest = async (req, res) => {
  const { employeeId, title, requestQuery } = req.body;

  if (!employeeId || !title || !requestQuery) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    await db.query(
      `INSERT INTO hr_requests (employee_id, request_title, request_query) VALUES ($1, $2, $3)`,
      [employeeId, title, requestQuery]
    );

    res.status(201).json({ message: "Request submitted successfully!" });
  } catch (err) {
    console.error("Error submitting HR request:", err.message);
    res.status(500).json({ error: "Failed to submit HR request" });
  }
};

module.exports = {
  submitHrRequest,
};
