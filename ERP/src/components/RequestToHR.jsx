import { useEffect, useState } from "react"
import axios from "axios"
import {
  MessageSquare,
  Send,
  User,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react"

const RequestToHR = () => {
  const [formData, setFormData] = useState({
    title: "",
    requestQuery: "",
    employeeId: "",
  })
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResponsesModal, setShowResponsesModal] = useState(false)
  const [employeeRequests, setEmployeeRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/employees/me`, {
          withCredentials: true,
        })
        setFormData((prev) => ({
          ...prev,
          employeeId: res.data.user?.employee_id || "",
        }))
      } catch (err) {
        console.error("Error fetching employee info:", err.message)
      }
    }

    fetchEmployee()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/employees/request-hr`,
        formData,
        {
          withCredentials: true,
        }
      )
      setMessage(response.data.message || "Request submitted successfully!")
      setIsError(false)
      setFormData((prev) => ({
        ...prev,
        title: "",
        requestQuery: "",
      }))
    } catch (error) {
      const msg = error.response?.data?.error || "Failed to submit request."
      setMessage(msg)
      setIsError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchEmployeeRequests = async () => {
    setLoadingRequests(true)
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/employees/my-requests`, {
        withCredentials: true,
      })
      setEmployeeRequests(res.data.requests || [])
    } catch (err) {
      console.error("Error fetching employee requests:", err.message)
    } finally {
      setLoadingRequests(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-right">
          <button
            onClick={() => {
              fetchEmployeeRequests()
              setShowResponsesModal(true)
            }}
            className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white py-2 px-4 rounded-xl shadow"
          >
            See Requests Response
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Request to HR
          </h1>
          <p className="text-slate-600">Submit your request or query to the HR department</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 relative">
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl border-l-4 ${isError
                  ? "bg-red-50 border-red-400 text-red-800"
                  : "bg-emerald-50 border-emerald-400 text-emerald-800"
                } shadow-sm relative z-10`}
            >
              <div className="flex items-center">
                {isError ? (
                  <XCircle className="w-5 h-5 mr-3 text-red-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 mr-3 text-emerald-400" />
                )}
                <span className="font-medium text-sm">{message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Request Title</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="title"
                  placeholder="Enter request title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 text-slate-700"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Request Details</label>
              <textarea
                name="requestQuery"
                placeholder="Describe your request..."
                value={formData.requestQuery}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 text-slate-700 resize-none"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Employee ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="employeeId"
                  value={formData.employeeId}
                  readOnly
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-gray-100 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl"
            >
              <span className="flex items-center justify-center">
                <Send className="w-5 h-5 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </span>
            </button>
          </form>
        </div>
      </div>

      {showResponsesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowResponsesModal(false)}
              className="absolute top-4 right-4 text-slate-600 hover:text-red-500"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Your Previous Requests</h2>

            {loadingRequests ? (
              <p className="text-slate-600">Loading...</p>
            ) : employeeRequests.length === 0 ? (
              <p className="text-slate-500">No requests submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {employeeRequests.map((req, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                  >
                    <h3 className="font-semibold text-slate-800">{req.title}</h3>
                    <p className="text-slate-600 text-sm mb-2 whitespace-pre-line">{req.request_query}</p>
                    <span
                      className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(req.status)}`}
                    >
                      {req.status || "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestToHR
