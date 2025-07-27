import { useEffect, useState } from "react"
import axios from "axios"
import { User, Search, RotateCcw, Pencil, Save } from "lucide-react"
import Swal from "sweetalert2"

const ViewEditEmployees = () => {
  const [employees, setEmployees] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [editingEmployeeId, setEditingEmployeeId] = useState(null)
  const [editData, setEditData] = useState({})
    const API = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API}/api/employees/employees`, {
        withCredentials: true,
      })
      setEmployees(res.data.employees || [])
    } catch (err) {
      console.error("Error fetching employees:", err.message)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (employeeId) => {
    try {
      const result = await Swal.fire({
        title: 'Reset Password?',
        text: `Do you want to reset the password for employee ID: ${employeeId}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, reset it!',
      })

      if (!result.isConfirmed) return

      await axios.put(
        `${API}/api/employees/reset-password/${employeeId}`,
        {},
        { withCredentials: true }
      )

      Swal.fire('Reset!', 'Password has been reset successfully.', 'success')
    } catch (err) {
      console.error(err)
      Swal.fire('Error', 'Failed to reset password', 'error')
    }
  }

  const handleEditClick = (emp) => {
    setEditingEmployeeId(emp.employee_id)
    setEditData({ ...emp })
  }

  const handleChange = (e, field) => {
    setEditData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleUpdate = async (id) => {
    try {
      await axios.put(
        `${API}/api/employees/update/${id}`,
        editData,
        { withCredentials: true }
      )
      Swal.fire('Updated!', 'Employee data updated successfully.', 'success')
      setEditingEmployeeId(null)
      fetchEmployees()
    } catch (err) {
      console.error(err)
      Swal.fire('Error', 'Failed to update employee data.', 'error')
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            View & Edit Employees
          </h1>
          <p className="text-slate-600">Search and manage employee records</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Employee ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading employees...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No employees found.</div>
          ) : (
            <table className="min-w-full text-sm text-left table-auto">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="px-6 py-3">Employee ID</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEmployees.map((emp, i) => {
                  const isEditing = editingEmployeeId === emp.employee_id
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-all">
                      <td className="px-6 py-4 font-medium">{emp.employee_id}</td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            value={editData.name}
                            onChange={(e) => handleChange(e, 'name')}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          emp.name
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            value={editData.email}
                            onChange={(e) => handleChange(e, 'email')}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          emp.email
                        )}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {isEditing ? (
                          <select
                            value={editData.role}
                            onChange={(e) => handleChange(e, 'role')}
                            className="border rounded px-2 py-1"
                          >
                            <option value="hr">HR</option>
                            <option value="frontend developer">Frontend Developer</option>
                            <option value="backend developer">Backend Developer</option>
                            <option value="full stack developer">Full Stack Developer</option>
                            <option value="devops">DevOps</option>
                            <option value="team lead">Team Lead</option>
                            <option value="project manager">Project Manager</option>
                          </select>
                        ) : (
                          emp.role
                        )}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {isEditing ? (
                          <select
                            value={editData.status}
                            onChange={(e) => handleChange(e, 'status')}
                            className="border rounded px-2 py-1"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          emp.status
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => isEditing ? handleUpdate(emp.employee_id) : handleEditClick(emp)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${isEditing ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              }`}
                          >
                            {isEditing ? <Save className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                            <span>{isEditing ? "Save" : "Edit"}</span>
                          </button>

                          <button
                            onClick={() => handleResetPassword(emp.employee_id)}
                            className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Reset Password</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewEditEmployees
