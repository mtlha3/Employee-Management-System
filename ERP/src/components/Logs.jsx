import { useEffect, useState } from "react"
import axios from "axios"
import {
  Loader2,
  LineChart,
  FolderOpen,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Briefcase,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
  Target,
  FileText,
  MessageSquare,
  Download,
} from "lucide-react"

const Logs = () => {
  const [projects, setProjects] = useState([])
  const [submissionLogs, setSubmissionLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedProject, setExpandedProject] = useState(null)

  const API = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const projectsResponse = await axios.get(`${API}/api/projects/projects`, {
          withCredentials: true,
        })
        setProjects(projectsResponse.data.projects)

        const submissionsResponse = await axios.get(`${API}/api/projects/admin/all-submissions`, {
          withCredentials: true,
        })
        const sortedSubmissions = (submissionsResponse.data.submissions || []).sort(
          (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
        )
        setSubmissionLogs(sortedSubmissions)
      } catch (error) {
        console.error("Error fetching data for logs:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAllData()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getProjectStatus = (startDate, endDate) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return { status: "upcoming", color: "bg-blue-100 text-blue-800 border-blue-200" }
    if (now > end) return { status: "completed", color: "bg-emerald-100 text-emerald-800 border-emerald-200" }
    return { status: "active", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "active":
        return <Clock className="w-4 h-4" />
      case "upcoming":
        return <Calendar className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getDeadlineInfo = (startDate, endDate) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    const remaining = end.getTime() - now.getTime()

    const daysRemaining = Math.ceil(remaining / (1000 * 60 * 60 * 24))

    let urgencyLevel, bgColor, textColor, icon, message, pulseClass

    if (now > end) {
      urgencyLevel = "overdue"
      bgColor = "bg-gradient-to-r from-red-500 to-red-600"
      textColor = "text-white"
      icon = <AlertTriangle className="w-4 h-4" />
      message = `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? "s" : ""}`
      pulseClass = "animate-pulse"
    } else if (daysRemaining <= 3) {
      urgencyLevel = "critical"
      bgColor = "bg-gradient-to-r from-orange-500 to-red-500"
      textColor = "text-white"
      icon = <Zap className="w-4 h-4" />
      message = `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} left!`
      pulseClass = "animate-pulse"
    } else if (daysRemaining <= 7) {
      urgencyLevel = "warning"
      bgColor = "bg-gradient-to-r from-yellow-400 to-orange-500"
      textColor = "text-white"
      icon = <Target className="w-4 h-4" />
      message = `${daysRemaining} days remaining`
      pulseClass = ""
    } else {
      urgencyLevel = "safe"
      bgColor = "bg-gradient-to-r from-emerald-500 to-teal-600"
      textColor = "text-white"
      icon = <CheckCircle className="w-4 h-4" />
      message = `${daysRemaining} days left`
      pulseClass = ""
    }

    return {
      urgencyLevel,
      bgColor,
      textColor,
      icon,
      message,
      daysRemaining,
      pulseClass,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    }
  }

  const getSubmissionStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "in progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "submitted":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-slate-100 text-slate-800 border-slate-200"
      case "revision":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getSubmissionStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "in progress":
        return <Clock className="w-4 h-4" />
      case "submitted":
        return <FileText className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "revision":
        return <MessageSquare className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const toggleProjectExpansion = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId)
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading Projects...</h2>
            <p className="text-slate-600">Please wait while we fetch all projects</p>
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
            <FolderOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            All Projects
          </h1>
          <p className="text-slate-600">View detailed logs and submissions for all projects</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {projects.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No Projects Found</h3>
              <p className="text-slate-500">There are no projects to display at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {projects.map((project) => {
                const projectStatus = getProjectStatus(project.start_date, project.end_date)
                const isExpanded = expandedProject === project.project_id
                const deadlineInfo = getDeadlineInfo(project.start_date, project.end_date)
                const projectSubmissions = submissionLogs.filter((log) => log.project_id === project.project_id)

                return (
                  <div key={project.project_id} className="transition-all duration-300">
                  
                    <div
                      onClick={() => toggleProjectExpansion(project.project_id)}
                      className="p-6 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors text-lg">
                              {project.project_name}
                            </h3>
                            <p className="text-sm text-slate-600 mb-1">Manager: {project.project_manager_name}</p>
                            <p className="text-xs font-mono text-slate-500">ID: {project.project_id}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600">
                                {formatDate(project.start_date)} - {formatDate(project.end_date)}
                              </span>
                            </div>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${projectStatus.color}`}
                            >
                              {getStatusIcon(projectStatus.status)}
                              <span className="ml-1 capitalize">{projectStatus.status}</span>
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-6 bg-slate-50/30 border-t border-slate-100">
                        <div className="pt-6 space-y-6">
                          
                          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                              <Briefcase className="w-5 h-5 text-emerald-600 mr-2" />
                              Project Overview
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                  Project Manager
                                </label>
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-slate-500" />
                                  <span className="text-slate-800 font-medium">{project.project_manager_name}</span>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Project ID</label>
                                <span className="font-mono text-slate-800 text-sm">{project.project_id}</span>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-slate-500" />
                                  <span className="text-slate-800">{formatDate(project.start_date)}</span>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-slate-500" />
                                  <span className="text-slate-800">{formatDate(project.end_date)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4">
                              <label className="block text-sm font-semibold text-slate-700 mb-1">Current Status</label>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${projectStatus.color}`}
                              >
                                {getStatusIcon(projectStatus.status)}
                                <span className="ml-2 capitalize">{projectStatus.status}</span>
                              </span>
                            </div>
                          </div>
                          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                              <LineChart className="w-5 h-5 text-blue-500 mr-2" />
                              Task Submission Logs ({projectSubmissions.length})
                            </h4>
                            {projectSubmissions.length === 0 ? (
                              <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No task submissions for this project yet.</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {projectSubmissions.map((submission, index) => (
                                  <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h5 className="font-semibold text-slate-800">{submission.task_title}</h5>
                                        <p className="text-sm text-slate-600">
                                          Submitted by: {submission.developer_name} (ID: {submission.developer_id})
                                        </p>
                                      </div>
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSubmissionStatusColor(
                                          submission.status,
                                        )}`}
                                      >
                                        {getSubmissionStatusIcon(submission.status)}
                                        <span className="ml-1 capitalize">{submission.status || "pending"}</span>
                                      </span>
                                    </div>
                                    <div className="flex items-center text-xs text-slate-500 mb-2">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      <span>Submitted: {formatDate(submission.submitted_at)}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 mb-2">
                                      <span className="font-medium">Comment:</span>{" "}
                                      {submission.submission_comment || "No comment provided."}
                                    </p>
                                    {submission.submission_file?.path && (
                                      <a
                                        href={submission.submission_file.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm text-blue-600 hover:underline"
                                      >
                                        <Download className="w-4 h-4 mr-1" />
                                        <span>Download Submitted File</span>
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Logs
