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

//====================


const getAllHRRequests = async (req, res) => {
  try {
    const query = `
      SELECT 
        hr.request_id AS id,
        hr.employee_id,
        e.name AS employee_name,
        hr.request_title AS title,
        hr.request_query,
        hr.status,
        hr.created_at
      FROM hr_requests hr
      LEFT JOIN employees e ON hr.employee_id = e.employee_id
      ORDER BY hr.created_at DESC;
    `

    const { rows } = await db.query(query)

    res.status(200).json({ requests: rows })
  } catch (error) {
    console.error('Error fetching HR requests:', error)
    res.status(500).json({ error: 'Failed to fetch HR requests' })
  }
}

//==========================

const updateHRRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status?.toLowerCase())) {
    return res.status(400).json({ error: "Invalid status. Must be 'approved' or 'rejected'." });
  }

  try {
    const query = `
      UPDATE hr_requests
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE request_id = $2
      RETURNING *;
    `;
    const values = [status.toLowerCase(), id];

    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json({ message: "Status updated successfully", request: rows[0] });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ error: "Failed to update request status" });
  }
};

// controller
const getMyHRRequests = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const query = `SELECT request_id, request_title, request_query, status FROM hr_requests WHERE employee_id = $1 ORDER BY created_at DESC`;
    const { rows } = await db.query(query, [employeeId]);
    res.status(200).json({ requests: rows });
  } catch (error) {
    console.error("Error getting HR requests:", error);
    res.status(500).json({ error: "Failed to get HR requests" });
  }
};


module.exports = {
  submitHrRequest, getAllHRRequests, updateHRRequestStatus, getMyHRRequests 
};
