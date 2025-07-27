import { useState, useEffect } from "react"
import axios from "axios"
import { FileText, User, Eye, Check, X, Clock, Search, Filter } from "lucide-react"

const HR_request_response = () => {
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const API = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API}/api/employees/requests`, {
        withCredentials: true,
      })
      setRequests(response.data.requests || [])
    } catch (error) {
      console.error("Failed to fetch requests:", error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }


  const handleRequestClick = (request) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

const handleApprove = async () => {
  try {
    await axios.put(
      `${API}/api/employees/requests/${selectedRequest.id}/status`,
      { status: "approved" },
      { withCredentials: true }
    )
    setMessage("Request approved successfully!")
    setIsError(false)
    setIsModalOpen(false)
    fetchRequests()
  } catch (error) {
    setMessage("Failed to approve request")
    setIsError(true)
  }
}

const handleReject = async () => {
  try {
    await axios.put(
      `${API}/api/employees/requests/${selectedRequest.id}/status`,
      { status: "rejected" },
      { withCredentials: true }
    )
    setMessage("Request rejected successfully!")
    setIsError(false)
    setIsModalOpen(false)
    fetchRequests()
  } catch (error) {
    setMessage("Failed to reject request")
    setIsError(true)
  }
}


  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <Check className="w-4 h-4" />
      case "rejected":
        return <X className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || request.status?.toLowerCase() === filterStatus

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg animate-pulse">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading Requests...</h2>
            <p className="text-slate-600">Please wait while we fetch employee requests</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Employee Requests
          </h1>
          <p className="text-slate-600">Review and respond to employee requests</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border-l-4 ${
              isError ? "bg-red-50 border-red-400 text-red-800" : "bg-emerald-50 border-emerald-400 text-emerald-800"
            } shadow-sm`}
          >
            <div className="flex items-center">
              {isError ? (
                <X className="flex-shrink-0 w-5 h-5 mr-3 text-red-400" />
              ) : (
                <Check className="flex-shrink-0 w-5 h-5 mr-3 text-emerald-400" />
              )}
              <span className="font-medium text-sm">{message}</span>
            </div>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Employee ID, Name, or Title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700"
                />
              </div>
            </div>

            <div className="md:w-48">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No Requests Found</h3>
              <p className="text-slate-500">There are no employee requests to display.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRequests.map((request, index) => (
                <div
                  key={index}
                  onClick={() => handleRequestClick(request)}
                  className="p-6 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                          Request From Employee ID: {request.employee_id}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">{request.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          request.status,
                        )}`}
                      >
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status || "Pending"}</span>
                      </span>
                      <Eye className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
           
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Employee Request Details</h2>
                    <p className="text-sm text-slate-600">Employee ID: {selectedRequest.employeeId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
           
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-800 font-medium">{selectedRequest.title}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Request Details</label>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 min-h-[120px]">
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedRequest.request_query}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
              
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Status</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        selectedRequest.status,
                      )}`}
                    >
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1 capitalize">{selectedRequest.status || "Pending"}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {selectedRequest.status?.toLowerCase() === "pending" && (
              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="flex space-x-4">
                  <button
                    onClick={handleApprove}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                  >
                    <span className="flex items-center justify-center">
                      <Check className="w-5 h-5 mr-2" />
                      Approve Request
                    </span>
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                  >
                    <span className="flex items-center justify-center">
                      <X className="w-5 h-5 mr-2" />
                      Reject Request
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default HR_request_response
