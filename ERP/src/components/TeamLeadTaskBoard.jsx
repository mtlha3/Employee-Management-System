import { useEffect, useState } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import {
  Users,
  User,
  ChevronDown,
  ChevronUp,
  Plus,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Upload,
  Briefcase,
  Target,
  FolderOpen,
  Loader2,
  Send,
  MessageSquare,
  Download,
  Eye,
} from "lucide-react"

const TeamLeadTaskBoard = () => {
  const [projects, setProjects] = useState([])
  const [expandedProjectId, setExpandedProjectId] = useState(null)
  const [projectDevelopers, setProjectDevelopers] = useState({})
  const [selectedDeveloper, setSelectedDeveloper] = useState(null)
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    file: null,
  })
  const [openedTasks, setOpenedTasks] = useState({})
  const [developerTasks, setDeveloperTasks] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [selectedTaskForStatusUpdate, setSelectedTaskForStatusUpdate] = useState(null)
  const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false)
  const [reviewFeedback, setReviewFeedback] = useState("")
  const [reviewStatus, setReviewStatus] = useState("completed")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  const API = import.meta.env.VITE_API_BASE_URL

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API}/api/projects/team-lead/projects`, {
        withCredentials: true,
      })
      setProjects(res.data.projects)
    } catch (err) {
      console.error("Error fetching projects:", err)
      Swal.fire("Error", "Failed to load projects", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCardClick = async (projectId) => {
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null)
      return
    }
    try {
      const res = await axios.get(`${API}/api/projects/projects/${projectId}/developers`)
      setProjectDevelopers((prev) => ({
        ...prev,
        [projectId]: res.data.developers,
      }))
      setExpandedProjectId(projectId)
    } catch (err) {
      console.error("Error fetching developers:", err)
      Swal.fire("Error", "Failed to load developers", "error")
    }
  }

  const groupByRole = (developers) => {
    return developers.reduce((acc, dev) => {
      if (!acc[dev.role]) acc[dev.role] = []
      acc[dev.role].push(dev)
      return acc
    }, {})
  }

  const toggleTaskDropdown = async (projectId, developerId) => {
    const key = `${projectId}_${developerId}`
    setOpenedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))

    if (!openedTasks[key] || !developerTasks[key]) {
      try {
        const res = await axios.get(`${API}/api/projects/projects/${projectId}/developers/${developerId}/tasks`, {
          withCredentials: true,
        })
        const sortedTasks = (res.data.tasks || []).sort((a, b) => {
          const dateA = a.assigned_at ? new Date(a.assigned_at).getTime() : 0
          const dateB = b.assigned_at ? new Date(b.assigned_at).getTime() : 0
          return dateB - dateA
        })
        setDeveloperTasks((prev) => ({
          ...prev,
          [key]: sortedTasks,
        }))
      } catch (err) {
        console.error("Error fetching tasks:", err)
        Swal.fire("Error", "Could not fetch tasks", "error")
      }
    }
  }

  const openTaskAssignmentModal = (dev) => {
    setSelectedDeveloper(dev)
    setTaskFormData({
      title: "",
      description: "",
      file: null,
    })
    if (expandedProjectId) {
      setOpenedTasks((prev) => ({
        ...prev,
        [`${expandedProjectId}_${dev.employee_id}`]: true,
      }))
      toggleTaskDropdown(expandedProjectId, dev.employee_id)
    }
  }

  const closeTaskAssignmentModal = () => {
    setSelectedDeveloper(null)
  }

  const handleAssignmentChange = (field, value) => {
    setTaskFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAssignmentFileChange = (e) => {
    setTaskFormData((prev) => ({
      ...prev,
      file: e.target.files[0],
    }))
  }

  const handleSubmitTaskAssignment = async (e) => {
    e.preventDefault()
    const { title, description, file } = taskFormData
    const dev = selectedDeveloper

    if (!title || !description || !dev || !expandedProjectId) {
      return Swal.fire("Error", "Please fill in all fields", "error")
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append("developerId", dev.employee_id)
    formData.append("project_id", expandedProjectId)
    formData.append("title", title)
    formData.append("description", description)
    if (file) formData.append("file", file)

    try {
      await axios.post(`${API}/api/projects/tasks/assign`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      Swal.fire("Success", "Task assigned successfully!", "success")
      closeTaskAssignmentModal()
      const key = `${expandedProjectId}_${dev.employee_id}`
      const res = await axios.get(
        `${API}/api/projects/projects/${expandedProjectId}/developers/${dev.employee_id}/tasks`,
        { withCredentials: true },
      )
      const sortedTasks = (res.data.tasks || []).sort((a, b) => {
        const dateA = a.assigned_at ? new Date(a.assigned_at).getTime() : 0
        const dateB = b.assigned_at ? new Date(b.assigned_at).getTime() : 0
        return dateB - dateA
      })
      setDeveloperTasks((prev) => ({
        ...prev,
        [key]: sortedTasks,
      }))
    } catch (err) {
      console.error("Task assignment error:", err.response?.data || err.message)
      Swal.fire("Error", err.response?.data?.message || "Task assignment failed", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const openStatusUpdateModal = (project, developer, task) => {
    setSelectedTaskForStatusUpdate({ project_id: project.project_id, developer, task })
    setReviewFeedback(task.revision_feedback || "")
    setReviewStatus(task.status)
    setIsStatusUpdateModalOpen(true)
  }

  const closeStatusUpdateModal = () => {
    setSelectedTaskForStatusUpdate(null)
    setReviewFeedback("")
    setReviewStatus("completed")
    setIsStatusUpdateModalOpen(false)
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()

    if (!selectedTaskForStatusUpdate || !reviewStatus) {
      Swal.fire("Error", "Please select a status for review.", "error")
      return
    }

    if (reviewStatus === "revision" && !reviewFeedback.trim()) {
      Swal.fire("Error", "Please provide feedback for revision.", "error")
      return
    }

    setReviewSubmitting(true)
    try {
      await axios.put(
        `${API}/api/projects/project/updatetaskstatus`,
        {
          project_id: selectedTaskForStatusUpdate.project_id,
          developer_id: selectedTaskForStatusUpdate.developer.employee_id,
          task_id: selectedTaskForStatusUpdate.task.task_id,
          status: reviewStatus,
          feedback: reviewFeedback,
        },
        { withCredentials: true },
      )
      Swal.fire("Success", `Task status updated to '${reviewStatus}'!`, "success")
      closeStatusUpdateModal()
      const key = `${selectedTaskForStatusUpdate.project_id}_${selectedTaskForStatusUpdate.developer.employee_id}`
      const res = await axios.get(
        `${API}/api/projects/projects/${selectedTaskForStatusUpdate.project_id}/developers/${selectedTaskForStatusUpdate.developer.employee_id}/tasks`,
        { withCredentials: true },
      )
      const sortedTasks = (res.data.tasks || []).sort((a, b) => {
        const dateA = a.assigned_at ? new Date(a.assigned_at).getTime() : 0
        const dateB = b.assigned_at ? new Date(b.assigned_at).getTime() : 0
        return dateB - dateA
      })
      setDeveloperTasks((prev) => ({
        ...prev,
        [key]: sortedTasks,
      }))
    } catch (err) {
      console.error("Error updating task status:", err.response?.data || err.message)
      Swal.fire("Error", err.response?.data?.error || "Failed to update task status", "error")
    } finally {
      setReviewSubmitting(false)
    }
  }



const handleDownloadSubmissionFile = async (projectId, developerId, taskId) => {
  try {
    const downloadUrl = `${API}/api/projects/project/${projectId}/developer/${developerId}/task/${taskId}/download-submission`;

    const response = await axios.get(downloadUrl, {
      responseType: 'blob',
      withCredentials: true,
    });

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;

    // Try to extract filename
    const disposition = response.headers['content-disposition'];
    let filename = 'submission';
    if (disposition && disposition.includes('filename=')) {
      filename = disposition.split('filename=')[1].replace(/"/g, '');
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
    alert("Failed to download the file.");
  }
};



  const getTaskStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case "in progress":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-slate-500" />
      case "submitted":
        return <Send className="w-4 h-4 text-blue-500" />
      case "revision":
        return <MessageSquare className="w-4 h-4 text-orange-500" />
      default:
        return <Clock className="w-4 h-4 text-slate-500" />
    }
  }

  const getTaskStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "in progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "pending":
        return "bg-slate-100 text-slate-800 border-slate-200"
      case "submitted":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "revision":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading Task Board...</h2>
            <p className="text-slate-600">Please wait while we fetch your projects and tasks</p>
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
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Team Lead Task Board
          </h1>
          <p className="text-slate-600">Assign and manage tasks for your team members</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {projects.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="lg:text-lg font-semibold text-slate-600 mb-2">No Projects Available</h3>
              <p className="text-slate-500">You don't have any projects to manage tasks for.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {projects.map((project) => {
                const isExpanded = expandedProjectId === project.project_id
                const developers = projectDevelopers[project.project_id] || []
                const grouped = groupByRole(developers)

                return (
                  <div key={project.project_id} className="transition-all duration-300">
                    <div
                      className="p-6 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer group"
                      onClick={() => handleCardClick(project.project_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors text-lg">
                              {project.project_name}
                            </h2>
                            <p className="text-sm text-slate-600 mb-1">Manager: {project.project_manager_name}</p>
                            <p className="text-xs font-mono text-slate-500">ID: {project.project_id}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-xs text-slate-500 mb-1">
                              <Users className="w-3 h-3" />
                              <span>{developers.length} developers</span>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Target className="w-3 h-3 mr-1" />
                              Active
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
                        <div className="pt-6">
                          {developers.length > 0 ? (
                            <div className="space-y-6">
                              {Object.entries(grouped).map(([role, devs]) => (
                                <div
                                  key={role}
                                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-6"
                                >
                                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                                    <Briefcase className="w-5 h-5 text-emerald-600 mr-2" />
                                    {role} ({devs.length})
                                  </h3>
                                  <div className="space-y-4">
                                    {devs.map((dev) => {
                                      const key = `${project.project_id}_${dev.employee_id}`
                                      const isOpen = openedTasks[key]
                                      const tasks = developerTasks[key] || []

                                      return (
                                        <div
                                          key={dev.employee_id}
                                          className="bg-slate-50 rounded-xl border border-slate-200 p-4 transition-all duration-200"
                                        >
                                          <div className="flex justify-between items-center">
                                            <div
                                              className="cursor-pointer flex-1"
                                              onClick={() => toggleTaskDropdown(project.project_id, dev.employee_id)}
                                            >
                                              <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                                  <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                  <p className="font-semibold text-slate-800">{dev.name}</p>
                                                  <p className="text-sm text-slate-500 flex items-center">
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    Click to view tasks ({tasks.length})
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => openTaskAssignmentModal(dev)}
                                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center space-x-2"
                                            >
                                              <Plus className="w-4 h-4" />
                                              <span>Assign Task</span>
                                            </button>
                                          </div>

                                          {isOpen && (
                                            <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 max-h-60 overflow-y-auto">
                                              <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                                                <FileText className="w-4 h-4 text-emerald-600 mr-2" />
                                                Assigned Tasks
                                              </h4>
                                              {tasks.length > 0 ? (
                                                <div className="space-y-3">
                                                  {tasks.map((task) => (
                                                    <div
                                                      key={task.task_id}
                                                      className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow"
                                                    >
                                                      <div className="flex items-start justify-between mb-2">
                                                        <h5 className="font-semibold text-slate-800">{task.title}</h5>
                                                        <span
                                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(
                                                            task.status,
                                                          )}`}
                                                        >
                                                          {getTaskStatusIcon(task.status)}
                                                          <span className="ml-1 capitalize">{task.status}</span>
                                                        </span>
                                                      </div>
                                                      <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                                                      <div className="flex items-center text-xs text-slate-500 mb-2">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        <span>Assigned: {formatDate(task.assigned_at)}</span>
                                                      </div>

                                                      {task.submitted_at && task.submission_comment && (
                                                        <div className="mt-3 pt-3 border-t border-slate-100">
                                                          <h6 className="text-xs font-semibold text-slate-700 mb-1 flex items-center">
                                                            <Send className="w-3 h-3 mr-1 text-blue-500" />
                                                            Latest Submission:
                                                          </h6>
                                                          <p className="text-xs text-slate-600 mb-1">
                                                            <span className="font-medium">Comment:</span>{" "}
                                                            {task.submission_comment}
                                                          </p>
                                                          {task.submission_file?.data && (
                                                            <button
                                                              onClick={() =>
                                                                handleDownloadSubmissionFile(
                                                                  project.project_id,
                                                                  dev.employee_id,
                                                                  task.task_id,
                                                                )
                                                              }
                                                              className="inline-flex items-center text-xs text-blue-600 hover:underline mt-1 bg-transparent border-none p-0 cursor-pointer"
                                                            >
                                                              <Download className="w-3 h-3 mr-1" />
                                                              <span>Download File</span>
                                                            </button>
                                                          )}
                                                          <div className="flex items-center text-xs text-slate-500 mt-1">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            <span>Submitted: {formatDate(task.submitted_at)}</span>
                                                          </div>
                                                          {task.revision_feedback && (
                                                            <div className="mt-2 p-2 bg-orange-50 rounded-md border border-orange-200">
                                                              <p className="text-xs font-medium text-orange-800">
                                                                Feedback: {task.revision_feedback}
                                                              </p>
                                                            </div>
                                                          )}
                                                        </div>
                                                      )}
                                                      <button
                                                        onClick={() => openStatusUpdateModal(project, dev, task)}
                                                        className={`mt-3 w-full ${
                                                          task.status === "submitted"
                                                            ? "bg-blue-600 hover:bg-blue-700"
                                                            : "bg-slate-600 hover:bg-slate-700"
                                                        } text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm flex items-center justify-center space-x-2 text-xs`}
                                                      >
                                                        {task.status === "submitted" ? (
                                                          <>
                                                            <Eye className="w-3 h-3" />
                                                            <span>Review Submission</span>
                                                          </>
                                                        ) : (
                                                          <>
                                                            <CheckCircle className="w-3 h-3" />
                                                            <span>Update Status</span>
                                                          </>
                                                        )}
                                                      </button>
                                                    </div>
                                                  ))}
                                                </div>
                                              ) : (
                                                <div className="text-center py-6">
                                                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                  <p className="text-slate-500">No tasks assigned yet.</p>
                                                  <p className="text-sm text-slate-400">
                                                    Click "Assign Task" to get started.
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                              <h3 className="lg:text-lg font-semibold text-slate-600 mb-2">No Developers Found</h3>
                              <p className="text-slate-500">This project doesn't have any developers assigned yet.</p>
                            </div>
                          )}
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

      {selectedDeveloper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/20">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Assign Task</h2>
                    <p className="text-sm text-slate-600">Create a new task for {selectedDeveloper.name}</p>
                  </div>
                </div>
                <button
                  onClick={closeTaskAssignmentModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitTaskAssignment} className="p-6 space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{selectedDeveloper.name}</p>
                    <p className="text-sm text-slate-600">{selectedDeveloper.role}</p>
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Task Title</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter task title"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700"
                    value={taskFormData.title}
                    onChange={(e) => handleAssignmentChange("title", e.target.value)}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Task Description</label>
                <textarea
                  placeholder="Describe the task in detail..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700 resize-none"
                  value={taskFormData.description}
                  onChange={(e) => handleAssignmentChange("description", e.target.value)}
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Attach File (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Upload className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="file"
                    onChange={handleAssignmentFileChange}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeTaskAssignmentModal}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Assign Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStatusUpdateModalOpen && selectedTaskForStatusUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/20">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Update Task Status</h2>
                    <p className="text-sm text-slate-600">
                      For task: {selectedTaskForStatusUpdate.task.title} by {selectedTaskForStatusUpdate.developer.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeStatusUpdateModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            <form onSubmit={handleStatusUpdate} className="p-6 space-y-6">
              {selectedTaskForStatusUpdate.task.submitted_at && selectedTaskForStatusUpdate.task.submission_comment && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-slate-600" />
                    Developer's Comment
                  </h3>
                  <p className="text-sm text-slate-700 mb-3 whitespace-pre-wrap">
                    {selectedTaskForStatusUpdate.task.submission_comment || "No comment provided."}
                  </p>
                  {selectedTaskForStatusUpdate.task.submission_file?.data && (
                    <button
                      onClick={() =>
                        handleDownloadSubmissionFile(
                          selectedTaskForStatusUpdate.project_id,
                          selectedTaskForStatusUpdate.developer.employee_id,
                          selectedTaskForStatusUpdate.task.task_id,
                        )
                      }
                      className="inline-flex items-center text-sm text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      <span>Download Submitted File</span>
                    </button>
                  )}
                  <div className="flex items-center text-xs text-slate-500 mt-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Submitted on: {formatDate(selectedTaskForStatusUpdate.task.submitted_at)}</span>
                  </div>
                </div>
              )}

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Feedback (Optional)</label>
                <textarea
                  placeholder="Provide feedback for the developer..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700 resize-none"
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Update Task Status</label>
                <div className="relative">
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 appearance-none cursor-pointer"
                  >
                    <option value="completed">Completed</option>
                    <option value="revision">Needs Revision</option>
                    <option value="rejected">Rejected</option>
                    <option value="in progress">In Progress (Revert)</option>
                    <option value="pending">Pending (Revert)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeStatusUpdateModal}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {reviewSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Update Status</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamLeadTaskBoard

// import { useEffect, useState } from "react"
// import axios from "axios"
// import Swal from "sweetalert2"
// import {
//   Users,
//   User,
//   ChevronDown,
//   ChevronUp,
//   Plus,
//   FileText,
//   Calendar,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   X,
//   Upload,
//   Briefcase,
//   Target,
//   FolderOpen,
//   Loader2,
//   Send,
//   MessageSquare,
//   Download,
//   Eye,
// } from "lucide-react"

// const TeamLeadTaskBoard = () => {
//   const [projects, setProjects] = useState([])
//   const [expandedProjectId, setExpandedProjectId] = useState(null)
//   const [projectDevelopers, setProjectDevelopers] = useState({})
//   const [selectedDeveloper, setSelectedDeveloper] = useState(null)
//   const [taskFormData, setTaskFormData] = useState({
//     title: "",
//     description: "",
//     file: null,
//   })
//   const [openedTasks, setOpenedTasks] = useState({})
//   const [developerTasks, setDeveloperTasks] = useState({}) 
//   const [loading, setLoading] = useState(true)
//   const [submitting, setSubmitting] = useState(false) 

//   const [selectedTaskForStatusUpdate, setSelectedTaskForStatusUpdate] = useState(null)
//   const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false)
//   const [reviewFeedback, setReviewFeedback] = useState("")
//   const [reviewStatus, setReviewStatus] = useState("completed")
//   const [reviewSubmitting, setReviewSubmitting] = useState(false) 

//   const API = import.meta.env.VITE_API_BASE_URL

//   const fetchProjects = async () => {
//     try {
//       const res = await axios.get(`${API}/api/projects/team-lead/projects`, {
//         withCredentials: true,
//       })
//       setProjects(res.data.projects)
//     } catch (err) {
//       console.error("Error fetching projects:", err)
//       Swal.fire("Error", "Failed to load projects", "error")
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchProjects()
//   }, [])

//   const handleCardClick = async (projectId) => {
//     if (expandedProjectId === projectId) {
//       setExpandedProjectId(null)
//       return
//     }
//     try {
//       const res = await axios.get(`${API}/api/projects/projects/${projectId}/developers`)
//       setProjectDevelopers((prev) => ({
//         ...prev,
//         [projectId]: res.data.developers,
//       }))
//       setExpandedProjectId(projectId)
//     } catch (err) {
//       console.error("Error fetching developers:", err)
//       Swal.fire("Error", "Failed to load developers", "error")
//     }
//   }

//   const groupByRole = (developers) => {
//     return developers.reduce((acc, dev) => {
//       if (!acc[dev.role]) acc[dev.role] = []
//       acc[dev.role].push(dev)
//       return acc
//     }, {})
//   }

//   const toggleTaskDropdown = async (projectId, developerId) => {
//     const key = `${projectId}_${developerId}`
 
//     setOpenedTasks((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }))

//     if (!openedTasks[key] || !developerTasks[key]) {
//       try {
//         const res = await axios.get(`${API}/api/projects/projects/${projectId}/developers/${developerId}/tasks`, {
//           withCredentials: true,
//         })
//         const sortedTasks = (res.data.tasks || []).sort(
//           (a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime(),
//         )
//         setDeveloperTasks((prev) => ({
//           ...prev,
//           [key]: sortedTasks,
//         }))
//       } catch (err) {
//         console.error("Error fetching tasks:", err)
//         Swal.fire("Error", "Could not fetch tasks", "error")
//       }
//     }
//   }

//   const openTaskAssignmentModal = (dev) => {
//     setSelectedDeveloper(dev)
//     setTaskFormData({
//       title: "",
//       description: "",
//       file: null,
//     })
//     if (expandedProjectId) {
//       toggleTaskDropdown(expandedProjectId, dev.employee_id)
//     }
//   }

//   const closeTaskAssignmentModal = () => {
//     setSelectedDeveloper(null)
//   }

//   const handleAssignmentChange = (field, value) => {
//     setTaskFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }))
//   }

//   const handleAssignmentFileChange = (e) => {
//     setTaskFormData((prev) => ({
//       ...prev,
//       file: e.target.files[0],
//     }))
//   }

//   const handleSubmitTaskAssignment = async (e) => {
//     e.preventDefault()
//     const { title, description, file } = taskFormData
//     const dev = selectedDeveloper

//     if (!title || !description || !dev || !expandedProjectId) {
//       return Swal.fire("Error", "Please fill in all fields", "error")
//     }

//     setSubmitting(true)
//     const formData = new FormData()
//     formData.append("developerId", dev.employee_id)
//     formData.append("project_id", expandedProjectId)
//     formData.append("title", title)
//     formData.append("description", description)
//     if (file) formData.append("file", file)

//     try {
//       await axios.post(`${API}/api/projects/tasks/assign`, formData, {
//         withCredentials: true,
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       })
//       Swal.fire("Success", "Task assigned successfully!", "success")
//       closeTaskAssignmentModal()
//       const key = `${expandedProjectId}_${dev.employee_id}`
//       const res = await axios.get(
//         `${API}/api/projects/projects/${expandedProjectId}/developers/${dev.employee_id}/tasks`,
//         { withCredentials: true },
//       )
      
//       const sortedTasks = (res.data.tasks || []).sort(
//         (a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime(),
//       )
//       setDeveloperTasks((prev) => ({
//         ...prev,
//         [key]: sortedTasks,
//       }))
//     } catch (err) {
//       console.error("Task assignment error:", err.response?.data || err.message)
//       Swal.fire("Error", err.response?.data?.message || "Task assignment failed", "error")
//     } finally {
//       setSubmitting(false)
//     }
//   }

  
//   const openStatusUpdateModal = (project, developer, task) => {
//     setSelectedTaskForStatusUpdate({ project_id: project.project_id, developer, task })
//     setReviewFeedback(task.revision_feedback || "") 
//     setReviewStatus(task.status) 
//     setIsStatusUpdateModalOpen(true)
//   }

//   const closeStatusUpdateModal = () => {
//     setSelectedTaskForStatusUpdate(null)
//     setReviewFeedback("")
//     setReviewStatus("completed") 
//     setIsStatusUpdateModalOpen(false)
//   }

//   const handleStatusUpdate = async (e) => {
//     e.preventDefault()

//     if (!selectedTaskForStatusUpdate || !reviewStatus) {
//       Swal.fire("Error", "Please select a status for review.", "error")
//       return
//     }

//     if (reviewStatus === "revision" && !reviewFeedback.trim()) {
//       Swal.fire("Error", "Please provide feedback for revision.", "error")
//       return
//     }

//     setReviewSubmitting(true)
//     try {
//       await axios.put(
//         `${API}/api/projects/project/updatetaskstatus`,
//         {
//           project_id: selectedTaskForStatusUpdate.project_id, 
//           developer_id: selectedTaskForStatusUpdate.developer.employee_id,
//           task_id: selectedTaskForStatusUpdate.task.task_id,
//           status: reviewStatus,
//           feedback: reviewFeedback, 
//         },
//         { withCredentials: true },
//       )
//       Swal.fire("Success", `Task status updated to '${reviewStatus}'!`, "success")
//       closeStatusUpdateModal()
//       const key = `${selectedTaskForStatusUpdate.project_id}_${selectedTaskForStatusUpdate.developer.employee_id}`
//       const res = await axios.get(
//         `${API}/api/projects/projects/${selectedTaskForStatusUpdate.project_id}/developers/${selectedTaskForStatusUpdate.developer.employee_id}/tasks`,
//         { withCredentials: true },
//       )
//       const sortedTasks = (res.data.tasks || []).sort(
//         (a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime(),
//       )
//       setDeveloperTasks((prev) => ({
//         ...prev,
//         [key]: sortedTasks,
//       }))
//     } catch (err) {
//       console.error("Error updating task status:", err.response?.data || err.message)
//       Swal.fire("Error", err.response?.data?.error || "Failed to update task status", "error")
//     } finally {
//       setReviewSubmitting(false)
//     }
//   }

//   const getTaskStatusIcon = (status) => {
//     switch (status?.toLowerCase()) {
//       case "completed":
//         return <CheckCircle className="w-4 h-4 text-emerald-500" />
//       case "in progress":
//         return <Clock className="w-4 h-4 text-yellow-500" />
//       case "pending":
//         return <AlertCircle className="w-4 h-4 text-slate-500" />
//       case "submitted":
//         return <Send className="w-4 h-4 text-blue-500" />
//       case "revision": 
//         return <MessageSquare className="w-4 h-4 text-orange-500" />
//       default:
//         return <Clock className="w-4 h-4 text-slate-500" />
//     }
//   }

//   const getTaskStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case "completed":
//         return "bg-emerald-100 text-emerald-800 border-emerald-200"
//       case "in progress":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200"
//       case "pending":
//         return "bg-slate-100 text-slate-800 border-slate-200"
//       case "submitted":
//         return "bg-blue-100 text-blue-800 border-blue-200"
//       case "revision": 
//         return "bg-orange-100 text-orange-800 border-orange-200"
//       default:
//         return "bg-slate-100 text-slate-800 border-slate-200"
//     }
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A"
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     })
//   }

//   if (loading) {
//     return (
//       <div className="p-6 lg:p-8">
//         <div className="flex items-center justify-center h-64">
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
//               <Loader2 className="w-8 h-8 text-white animate-spin" />
//             </div>
//             <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading Task Board...</h2>
//             <p className="text-slate-600">Please wait while we fetch your projects and tasks</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6 lg:p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
//             <Target className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
//             Team Lead Task Board
//           </h1>
//           <p className="text-slate-600">Assign and manage tasks for your team members</p>
//         </div>

//         <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
//           {projects.length === 0 ? (
//             <div className="p-12 text-center">
//               <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//               <h3 className="lg:text-lg font-semibold text-slate-600 mb-2">No Projects Available</h3>
//               <p className="text-slate-500">You don't have any projects to manage tasks for.</p>
//             </div>
//           ) : (
//             <div className="divide-y divide-slate-100">
//               {projects.map((project) => {
//                 const isExpanded = expandedProjectId === project.project_id
//                 const developers = projectDevelopers[project.project_id] || []
//                 const grouped = groupByRole(developers)

//                 return (
//                   <div key={project.project_id} className="transition-all duration-300">
                    
//                     <div
//                       className="p-6 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer group"
//                       onClick={() => handleCardClick(project.project_id)}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-4">
//                           <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
//                             <Briefcase className="w-6 h-6 text-white" />
//                           </div>
//                           <div>
//                             <h2 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors text-lg">
//                               {project.project_name}
//                             </h2>
//                             <p className="text-sm text-slate-600 mb-1">Manager: {project.project_manager_name}</p>
//                             <p className="text-xs font-mono text-slate-500">ID: {project.project_id}</p>
//                           </div>
//                         </div>

//                         <div className="flex items-center space-x-4">
//                           <div className="text-right">
//                             <div className="flex items-center space-x-1 text-xs text-slate-500 mb-1">
//                               <Users className="w-3 h-3" />
//                               <span>{developers.length} developers</span>
//                             </div>
//                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
//                               <Target className="w-3 h-3 mr-1" />
//                               Active
//                             </span>
//                           </div>
//                           {isExpanded ? (
//                             <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
//                           ) : (
//                             <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {isExpanded && (
//                       <div className="px-6 pb-6 bg-slate-50/30 border-t border-slate-100">
//                         <div className="pt-6">
//                           {developers.length > 0 ? (
//                             <div className="space-y-6">
//                               {Object.entries(grouped).map(([role, devs]) => (
//                                 <div
//                                   key={role}
//                                   className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-6"
//                                 >
//                                   <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
//                                     <Briefcase className="w-5 h-5 text-emerald-600 mr-2" />
//                                     {role} ({devs.length})
//                                   </h3>
//                                   <div className="space-y-4">
//                                     {devs.map((dev) => {
//                                       const key = `${project.project_id}_${dev.employee_id}`
//                                       const isOpen = openedTasks[key]
//                                       const tasks = developerTasks[key] || []

//                                       return (
//                                         <div
//                                           key={dev.employee_id}
//                                           className="bg-slate-50 rounded-xl border border-slate-200 p-4 transition-all duration-200"
//                                         >
//                                           <div className="flex justify-between items-center">
//                                             <div
//                                               className="cursor-pointer flex-1"
//                                               onClick={() => toggleTaskDropdown(project.project_id, dev.employee_id)}
//                                             >
//                                               <div className="flex items-center space-x-3">
//                                                 <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
//                                                   <User className="w-5 h-5 text-white" />
//                                                 </div>
//                                                 <div>
//                                                   <p className="font-semibold text-slate-800">{dev.name}</p>
//                                                   <p className="text-sm text-slate-500 flex items-center">
//                                                     <FileText className="w-3 h-3 mr-1" />
//                                                     Click to view tasks ({tasks.length})
//                                                   </p>
//                                                 </div>
//                                               </div>
//                                             </div>
//                                             <button
//                                               onClick={() => openTaskAssignmentModal(dev)}
//                                               className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center space-x-2"
//                                             >
//                                               <Plus className="w-4 h-4" />
//                                               <span>Assign Task</span>
//                                             </button>
//                                           </div>

//                                           {isOpen && (
//                                             <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 max-h-60 overflow-y-auto">
//                                               <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
//                                                 <FileText className="w-4 h-4 text-emerald-600 mr-2" />
//                                                 Assigned Tasks
//                                               </h4>
//                                               {tasks.length > 0 ? (
//                                                 <div className="space-y-3">
//                                                   {tasks.map((task) => (
//                                                     <div
//                                                       key={task.task_id}
//                                                       className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow"
//                                                     >
//                                                       <div className="flex items-start justify-between mb-2">
//                                                         <h5 className="font-semibold text-slate-800">{task.title}</h5>
//                                                         <span
//                                                           className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(
//                                                             task.status,
//                                                           )}`}
//                                                         >
//                                                           {getTaskStatusIcon(task.status)}
//                                                           <span className="ml-1 capitalize">{task.status}</span>
//                                                         </span>
//                                                       </div>
//                                                       <p className="text-sm text-slate-600 mb-2">{task.description}</p>
//                                                       <div className="flex items-center text-xs text-slate-500 mb-2">
//                                                         <Calendar className="w-3 h-3 mr-1" />
//                                                         <span>Assigned: {formatDate(task.assigned_at)}</span>
//                                                       </div>

//                                                       {task.submitted_at && task.submission_comment && (
//                                                         <div className="mt-3 pt-3 border-t border-slate-100">
//                                                           <h6 className="text-xs font-semibold text-slate-700 mb-1 flex items-center">
//                                                             <Send className="w-3 h-3 mr-1 text-blue-500" />
//                                                             Latest Submission:
//                                                           </h6>
//                                                           <p className="text-xs text-slate-600 mb-1">
//                                                             <span className="font-medium">Comment:</span>{" "}
//                                                             {task.submission_comment}
//                                                           </p>
//                                                           {task.submission_file?.path && (
//                                                             <a
//                                                               href={task.submission_file.path}
//                                                               target="_blank"
//                                                               rel="noopener noreferrer"
//                                                               className="inline-flex items-center text-xs text-blue-600 hover:underline mt-1"
//                                                             >
//                                                               <Download className="w-3 h-3 mr-1" />
//                                                               <span>Download File</span>
//                                                             </a>
//                                                           )}
//                                                           <div className="flex items-center text-xs text-slate-500 mt-1">
//                                                             <Calendar className="w-3 h-3 mr-1" />
//                                                             <span>Submitted: {formatDate(task.submitted_at)}</span>
//                                                           </div>
//                                                           {task.revision_feedback && (
//                                                             <div className="mt-2 p-2 bg-orange-50 rounded-md border border-orange-200">
//                                                               <p className="text-xs font-medium text-orange-800">
//                                                                 Feedback: {task.revision_feedback}
//                                                               </p>
//                                                             </div>
//                                                           )}
//                                                         </div>
//                                                       )}
//                                                       <button
//                                                         onClick={() => openStatusUpdateModal(project, dev, task)}
//                                                         className={`mt-3 w-full ${
//                                                           task.status === "submitted"
//                                                             ? "bg-blue-600 hover:bg-blue-700"
//                                                             : "bg-slate-600 hover:bg-slate-700"
//                                                         } text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm flex items-center justify-center space-x-2 text-xs`}
//                                                       >
//                                                         {task.status === "submitted" ? (
//                                                           <>
//                                                             <Eye className="w-3 h-3" />
//                                                             <span>Review Submission</span>
//                                                           </>
//                                                         ) : (
//                                                           <>
//                                                             <CheckCircle className="w-3 h-3" />
//                                                             <span>Update Status</span>
//                                                           </>
//                                                         )}
//                                                       </button>
//                                                     </div>
//                                                   ))}
//                                                 </div>
//                                               ) : (
//                                                 <div className="text-center py-6">
//                                                   <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//                                                   <p className="text-slate-500">No tasks assigned yet.</p>
//                                                   <p className="text-sm text-slate-400">
//                                                     Click "Assign Task" to get started.
//                                                   </p>
//                                                 </div>
//                                               )}
//                                             </div>
//                                           )}
//                                         </div>
//                                       )
//                                     })}
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           ) : (
//                             <div className="text-center py-8">
//                               <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                               <h3 className="lg:text-lg font-semibold text-slate-600 mb-2">No Developers Found</h3>
//                               <p className="text-slate-500">This project doesn't have any developers assigned yet.</p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {selectedDeveloper && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/20">
       
//             <div className="p-6 border-b border-slate-100">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
//                     <Plus className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-slate-800">Assign Task</h2>
//                     <p className="text-sm text-slate-600">Create a new task for {selectedDeveloper.name}</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={closeTaskAssignmentModal}
//                   className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                 >
//                   <X className="w-5 h-5 text-slate-600" />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmitTaskAssignment} className="p-6 space-y-6">
             
//               <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
//                     <User className="w-5 h-5 text-white" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-slate-800">{selectedDeveloper.name}</p>
//                     <p className="text-sm text-slate-600">{selectedDeveloper.role}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Task Title</label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <FileText className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Enter task title"
//                     required
//                     className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700"
//                     value={taskFormData.title}
//                     onChange={(e) => handleAssignmentChange("title", e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Task Description</label>
//                 <textarea
//                   placeholder="Describe the task in detail..."
//                   required
//                   rows={4}
//                   className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700 resize-none"
//                   value={taskFormData.description}
//                   onChange={(e) => handleAssignmentChange("description", e.target.value)}
//                 />
//               </div>

//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Attach File (Optional)</label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <Upload className="h-4 w-4 text-slate-400" />
//                   </div>
//                   <input
//                     type="file"
//                     onChange={handleAssignmentFileChange}
//                     className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
//                   />
//                 </div>
//               </div>

//               <div className="flex space-x-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={closeTaskAssignmentModal}
//                   className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none flex items-center justify-center space-x-2"
//                 >
//                   {submitting ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       <span>Assigning...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Send className="w-4 h-4" />
//                       <span>Assign Task</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {isStatusUpdateModalOpen && selectedTaskForStatusUpdate && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/20">
           
//             <div className="p-6 border-b border-slate-100">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
//                     <Eye className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-slate-800">Update Task Status</h2>
//                     <p className="text-sm text-slate-600">
//                       For task: {selectedTaskForStatusUpdate.task.title} by {selectedTaskForStatusUpdate.developer.name}
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={closeStatusUpdateModal}
//                   className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                 >
//                   <X className="w-5 h-5 text-slate-600" />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleStatusUpdate} className="p-6 space-y-6">
            
//               {selectedTaskForStatusUpdate.task.submitted_at && selectedTaskForStatusUpdate.task.submission_comment && (
//                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
//                   <h3 className="font-semibold text-slate-800 mb-2 flex items-center">
//                     <MessageSquare className="w-4 h-4 mr-2 text-slate-600" />
//                     Developer's Comment
//                   </h3>
//                   <p className="text-sm text-slate-700 mb-3 whitespace-pre-wrap">
//                     {selectedTaskForStatusUpdate.task.submission_comment || "No comment provided."}
//                   </p>
//                   {selectedTaskForStatusUpdate.task.submission_file?.path && (
//                     <a
//                       href={selectedTaskForStatusUpdate.task.submission_file.path}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center text-sm text-blue-600 hover:underline"
//                     >
//                       <Download className="w-4 h-4 mr-1" />
//                       <span>Download Submitted File</span>
//                     </a>
//                   )}
//                   <div className="flex items-center text-xs text-slate-500 mt-2">
//                     <Calendar className="w-3 h-3 mr-1" />
//                     <span>Submitted on: {formatDate(selectedTaskForStatusUpdate.task.submitted_at)}</span>
//                   </div>
//                 </div>
//               )}

//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Your Feedback (Optional)</label>
//                 <textarea
//                   placeholder="Provide feedback for the developer..."
//                   rows={3}
//                   className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700 resize-none"
//                   value={reviewFeedback}
//                   onChange={(e) => setReviewFeedback(e.target.value)}
//                 />
//               </div>

//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Update Task Status</label>
//                 <div className="relative">
//                   <select
//                     value={reviewStatus}
//                     onChange={(e) => setReviewStatus(e.target.value)}
//                     required
//                     className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 appearance-none cursor-pointer"
//                   >
//                     <option value="completed">Completed</option>
//                     <option value="revision">Needs Revision</option>
//                     <option value="rejected">Rejected</option>
//                     <option value="in progress">In Progress (Revert)</option>
//                     <option value="pending">Pending (Revert)</option>
//                   </select>
//                   <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
//                     <ChevronDown className="h-5 w-5 text-slate-400" />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex space-x-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={closeStatusUpdateModal}
//                   className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={reviewSubmitting}
//                   className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none flex items-center justify-center space-x-2"
//                 >
//                   {reviewSubmitting ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       <span>Updating...</span>
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle className="w-4 h-4" />
//                       <span>Update Status</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default TeamLeadTaskBoard


// import { useEffect, useState } from "react"
// import axios from "axios"
// import Swal from "sweetalert2"
// import {
//   Users,
//   User,
//   ChevronDown,
//   ChevronUp,
//   Plus,
//   FileText,
//   Calendar,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   X,
//   Upload,
//   Briefcase,
//   Target,
//   FolderOpen,
//   Loader2,
//   Send,
//   MessageSquare,
//   Download,
//   Eye,
// } from "lucide-react"

// const TeamLeadTaskBoard = () => {
//   const [projects, setProjects] = useState([])
//   const [expandedProjectId, setExpandedProjectId] = useState(null)
//   const [projectDevelopers, setProjectDevelopers] = useState({})
//   const [selectedDeveloper, setSelectedDeveloper] = useState(null) 
//   const [taskFormData, setTaskFormData] = useState({
//     title: "",
//     description: "",
//     file: null,
//   })
//   const [openedTasks, setOpenedTasks] = useState({})
//   const [developerTasks, setDeveloperTasks] = useState({})
//   const [loading, setLoading] = useState(true)
//   const [submitting, setSubmitting] = useState(false)

//   const [selectedTaskForStatusUpdate, setSelectedTaskForStatusUpdate] = useState(null)
//   const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false)
//   const [reviewFeedback, setReviewFeedback] = useState("")
//   const [reviewStatus, setReviewStatus] = useState("completed")
//   const [reviewSubmitting, setReviewSubmitting] = useState(false) 

//   const API = import.meta.env.VITE_API_BASE_URL

//   const fetchProjects = async () => {
//     try {
//       const res = await axios.get(`${API}/api/projects/team-lead/projects`, {
//         withCredentials: true,
//       })
//       setProjects(res.data.projects)
//     } catch (err) {
//       console.error("Error fetching projects:", err)
//       Swal.fire("Error", "Failed to load projects", "error")
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchProjects()
//   }, [])

//   const handleCardClick = async (projectId) => {
//     if (expandedProjectId === projectId) {
//       setExpandedProjectId(null)
//       return
//     }
//     try {
//       const res = await axios.get(`${API}/api/projects/projects/${projectId}/developers`)
//       setProjectDevelopers((prev) => ({
//         ...prev,
//         [projectId]: res.data.developers,
//       }))
//       setExpandedProjectId(projectId)
//     } catch (err) {
//       console.error("Error fetching developers:", err)
//       Swal.fire("Error", "Failed to load developers", "error")
//     }
//   }

//   const groupByRole = (developers) => {
//     return developers.reduce((acc, dev) => {
//       if (!acc[dev.role]) acc[dev.role] = []
//       acc[dev.role].push(dev)
//       return acc
//     }, {})
//   }

//   const toggleTaskDropdown = async (projectId, developerId) => {
//     const key = `${projectId}_${developerId}`
//     setOpenedTasks((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }))
//     if (!developerTasks[key]) {
//       try {
//         const res = await axios.get(`${API}/api/projects/projects/${projectId}/developers/${developerId}/tasks`, {
//           withCredentials: true,
//         })
//         setDeveloperTasks((prev) => ({
//           ...prev,
//           [key]: res.data.tasks,
//         }))
//       } catch (err) {
//         console.error("Error fetching tasks:", err)
//         Swal.fire("Error", "Could not fetch tasks", "error")
//       }
//     }
//   }

//   const openTaskAssignmentModal = (dev) => {
//     setSelectedDeveloper(dev)
//     setTaskFormData({
//       title: "",
//       description: "",
//       file: null,
//     })
//   }

//   const closeTaskAssignmentModal = () => {
//     setSelectedDeveloper(null)
//   }

//   const handleAssignmentChange = (field, value) => {
//     setTaskFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }))
//   }

//   const handleAssignmentFileChange = (e) => {
//     setTaskFormData((prev) => ({
//       ...prev,
//       file: e.target.files[0],
//     }))
//   }

//   const handleSubmitTaskAssignment = async (e) => {
//     e.preventDefault()
//     const { title, description, file } = taskFormData
//     const dev = selectedDeveloper

//     if (!title || !description || !dev || !expandedProjectId) {
//       return Swal.fire("Error", "Please fill in all fields", "error")
//     }

//     setSubmitting(true)
//     const formData = new FormData()
//     formData.append("developerId", dev.employee_id)
//     formData.append("project_id", expandedProjectId)
//     formData.append("title", title)
//     formData.append("description", description)
//     if (file) formData.append("file", file)

//     try {
//       await axios.post(`${API}/api/projects/tasks/assign`, formData, {
//         withCredentials: true,
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       })
//       Swal.fire("Success", "Task assigned successfully!", "success")
//       closeTaskAssignmentModal()
//       const key = `${expandedProjectId}_${dev.employee_id}`
//       const res = await axios.get(
//         `${API}/api/projects/projects/${expandedProjectId}/developers/${dev.employee_id}/tasks`,
//         { withCredentials: true },
//       )
//       setDeveloperTasks((prev) => ({
//         ...prev,
//         [key]: res.data.tasks,
//       }))
//     } catch (err) {
//       console.error("Task assignment error:", err.response?.data || err.message)
//       Swal.fire("Error", err.response?.data?.message || "Task assignment failed", "error")
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const openStatusUpdateModal = (project, developer, task) => {
//     setSelectedTaskForStatusUpdate({ project_id: project.project_id, developer, task })
//     setReviewFeedback(task.revision_feedback || "") 
//     setReviewStatus(task.status) 
//     setIsStatusUpdateModalOpen(true)
//   }

//   const closeStatusUpdateModal = () => {
//     setSelectedTaskForStatusUpdate(null)
//     setReviewFeedback("")
//     setReviewStatus("completed") 
//     setIsStatusUpdateModalOpen(false)
//   }

//   const handleStatusUpdate = async (e) => {
//     e.preventDefault()

//     if (!selectedTaskForStatusUpdate || !reviewStatus) {
//       Swal.fire("Error", "Please select a status for review.", "error")
//       return
//     }

//     if (reviewStatus === "revision" && !reviewFeedback.trim()) {
//       Swal.fire("Error", "Please provide feedback for revision.", "error")
//       return
//     }

//     setReviewSubmitting(true)
//     try {
//       await axios.put(
//         `${API}/api/projects/project/updatetaskstatus`,
//         {
//           project_id: selectedTaskForStatusUpdate.project_id,
//           developer_id: selectedTaskForStatusUpdate.developer.employee_id, 
//           task_id: selectedTaskForStatusUpdate.task.task_id,
//           status: reviewStatus,
//           feedback: reviewFeedback,
//         },
//         { withCredentials: true },
//       )
//       Swal.fire("Success", `Task status updated to '${reviewStatus}'!`, "success")
//       closeStatusUpdateModal()
//       const key = `${selectedTaskForStatusUpdate.project_id}_${selectedTaskForStatusUpdate.developer.employee_id}`
//       const res = await axios.get(
//         `${API}/api/projects/projects/${selectedTaskForStatusUpdate.project_id}/developers/${selectedTaskForStatusUpdate.developer.employee_id}/tasks`,
//         { withCredentials: true },
//       )
//       setDeveloperTasks((prev) => ({
//         ...prev,
//         [key]: res.data.tasks,
//       }))
//     } catch (err) {
//       console.error("Error updating task status:", err.response?.data || err.message)
//       Swal.fire("Error", err.response?.data?.error || "Failed to update task status", "error")
//     } finally {
//       setReviewSubmitting(false)
//     }
//   }

//   const getTaskStatusIcon = (status) => {
//     switch (status?.toLowerCase()) {
//       case "completed":
//         return <CheckCircle className="w-4 h-4 text-emerald-500" />
//       case "in progress":
//         return <Clock className="w-4 h-4 text-yellow-500" />
//       case "pending":
//         return <AlertCircle className="w-4 h-4 text-slate-500" />
//       case "submitted": 
//         return <Send className="w-4 h-4 text-blue-500" />
//       case "revision":
//         return <MessageSquare className="w-4 h-4 text-orange-500" />
//       default:
//         return <Clock className="w-4 h-4 text-slate-500" />
//     }
//   }

//   const getTaskStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case "completed":
//         return "bg-emerald-100 text-emerald-800 border-emerald-200"
//       case "in progress":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200"
//       case "pending":
//         return "bg-slate-100 text-slate-800 border-slate-200"
//       case "submitted": 
//         return "bg-blue-100 text-blue-800 border-blue-200"
//       case "revision":
//         return "bg-orange-100 text-orange-800 border-orange-200"
//       default:
//         return "bg-slate-100 text-slate-800 border-slate-200"
//     }
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A"
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     })
//   }

//   if (loading) {
//     return (
//       <div className="p-6 lg:p-8">
//         <div className="flex items-center justify-center h-64">
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
//               <Loader2 className="w-8 h-8 text-white animate-spin" />
//             </div>
//             <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading Task Board...</h2>
//             <p className="text-slate-600">Please wait while we fetch your projects and tasks</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6 lg:p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
//             <Target className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
//             Team Lead Task Board
//           </h1>
//           <p className="text-slate-600">Assign and manage tasks for your team members</p>
//         </div>

//         <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
//           {projects.length === 0 ? (
//             <div className="p-12 text-center">
//               <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//               <h3 className="lg:text-lg font-semibold text-slate-600 mb-2">No Projects Available</h3>
//               <p className="text-slate-500">You don't have any projects to manage tasks for.</p>
//             </div>
//           ) : (
//             <div className="divide-y divide-slate-100">
//               {projects.map((project) => {
//                 const isExpanded = expandedProjectId === project.project_id
//                 const developers = projectDevelopers[project.project_id] || []
//                 const grouped = groupByRole(developers)

//                 return (
//                   <div key={project.project_id} className="transition-all duration-300">
                 
//                     <div
//                       className="p-6 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer group"
//                       onClick={() => handleCardClick(project.project_id)}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-4">
//                           <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
//                             <Briefcase className="w-6 h-6 text-white" />
//                           </div>
//                           <div>
//                             <h2 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors text-lg">
//                               {project.project_name}
//                             </h2>
//                             <p className="text-sm text-slate-600 mb-1">Manager: {project.project_manager_name}</p>
//                             <p className="text-xs font-mono text-slate-500">ID: {project.project_id}</p>
//                           </div>
//                         </div>

//                         <div className="flex items-center space-x-4">
//                           <div className="text-right">
//                             <div className="flex items-center space-x-1 text-xs text-slate-500 mb-1">
//                               <Users className="w-3 h-3" />
//                               <span>{developers.length} developers</span>
//                             </div>
//                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
//                               <Target className="w-3 h-3 mr-1" />
//                               Active
//                             </span>
//                           </div>
//                           {isExpanded ? (
//                             <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
//                           ) : (
//                             <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {isExpanded && (
//                       <div className="px-6 pb-6 bg-slate-50/30 border-t border-slate-100">
//                         <div className="pt-6">
//                           {developers.length > 0 ? (
//                             <div className="space-y-6">
//                               {Object.entries(grouped).map(([role, devs]) => (
//                                 <div
//                                   key={role}
//                                   className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-6"
//                                 >
//                                   <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
//                                     <Briefcase className="w-5 h-5 text-emerald-600 mr-2" />
//                                     {role} ({devs.length})
//                                   </h3>
//                                   <div className="space-y-4">
//                                     {devs.map((dev) => {
//                                       const key = `${project.project_id}_${dev.employee_id}`
//                                       const isOpen = openedTasks[key]
//                                       const tasks = developerTasks[key] || []

//                                       return (
//                                         <div
//                                           key={dev.employee_id}
//                                           className="bg-slate-50 rounded-xl border border-slate-200 p-4 transition-all duration-200"
//                                         >
//                                           <div className="flex justify-between items-center">
//                                             <div
//                                               className="cursor-pointer flex-1"
//                                               onClick={() => toggleTaskDropdown(project.project_id, dev.employee_id)}
//                                             >
//                                               <div className="flex items-center space-x-3">
//                                                 <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
//                                                   <User className="w-5 h-5 text-white" />
//                                                 </div>
//                                                 <div>
//                                                   <p className="font-semibold text-slate-800">{dev.name}</p>
//                                                   <p className="text-sm text-slate-500 flex items-center">
//                                                     <FileText className="w-3 h-3 mr-1" />
//                                                     Click to view tasks ({tasks.length})
//                                                   </p>
//                                                 </div>
//                                               </div>
//                                             </div>
//                                             <button
//                                               onClick={() => openTaskAssignmentModal(dev)}
//                                               className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center space-x-2"
//                                             >
//                                               <Plus className="w-4 h-4" />
//                                               <span>Assign Task</span>
//                                             </button>
//                                           </div>

//                                           {isOpen && (
//                                             <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
//                                               <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
//                                                 <FileText className="w-4 h-4 text-emerald-600 mr-2" />
//                                                 Assigned Tasks
//                                               </h4>
//                                               {tasks.length > 0 ? (
//                                                 <div className="space-y-3">
//                                                   {tasks.map((task) => (
//                                                     <div
//                                                       key={task.task_id}
//                                                       className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow"
//                                                     >
//                                                       <div className="flex items-start justify-between mb-2">
//                                                         <h5 className="font-semibold text-slate-800">{task.title}</h5>
//                                                         <span
//                                                           className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(
//                                                             task.status,
//                                                           )}`}
//                                                         >
//                                                           {getTaskStatusIcon(task.status)}
//                                                           <span className="ml-1 capitalize">{task.status}</span>
//                                                         </span>
//                                                       </div>
//                                                       <p className="text-sm text-slate-600 mb-2">{task.description}</p>
//                                                       <div className="flex items-center text-xs text-slate-500 mb-2">
//                                                         <Calendar className="w-3 h-3 mr-1" />
//                                                         <span>Assigned: {formatDate(task.assigned_at)}</span>
//                                                       </div>

//                                                       {task.submitted_at && task.submission_comment && (
//                                                         <div className="mt-3 pt-3 border-t border-slate-100">
//                                                           <h6 className="text-xs font-semibold text-slate-700 mb-1 flex items-center">
//                                                             <Send className="w-3 h-3 mr-1 text-blue-500" />
//                                                             Latest Submission:
//                                                           </h6>
//                                                           <p className="text-xs text-slate-600 mb-1">
//                                                             <span className="font-medium">Comment:</span>{" "}
//                                                             {task.submission_comment}
//                                                           </p>
//                                                           {task.submission_file?.path && (
//                                                             <a
//                                                               href={task.submission_file.path}
//                                                               target="_blank"
//                                                               rel="noopener noreferrer"
//                                                               className="inline-flex items-center text-xs text-blue-600 hover:underline mt-1"
//                                                             >
//                                                               <Download className="w-3 h-3 mr-1" />
//                                                               <span>Download File</span>
//                                                             </a>
//                                                           )}
//                                                           <div className="flex items-center text-xs text-slate-500 mt-1">
//                                                             <Calendar className="w-3 h-3 mr-1" />
//                                                             <span>Submitted: {formatDate(task.submitted_at)}</span>
//                                                           </div>
//                                                           {task.revision_feedback && (
//                                                             <div className="mt-2 p-2 bg-orange-50 rounded-md border border-orange-200">
//                                                               <p className="text-xs font-medium text-orange-800">
//                                                                 Feedback: {task.revision_feedback}
//                                                               </p>
//                                                             </div>
//                                                           )}
//                                                         </div>
//                                                       )}
//                                                       <button
//                                                         onClick={() => openStatusUpdateModal(project, dev, task)}
//                                                         className={`mt-3 w-full ${
//                                                           task.status === "submitted"
//                                                             ? "bg-blue-600 hover:bg-blue-700"
//                                                             : "bg-slate-600 hover:bg-slate-700"
//                                                         } text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm flex items-center justify-center space-x-2 text-xs`}
//                                                       >
//                                                         {task.status === "submitted" ? (
//                                                           <>
//                                                             <Eye className="w-3 h-3" />
//                                                             <span>Review Submission</span>
//                                                           </>
//                                                         ) : (
//                                                           <>
//                                                             <CheckCircle className="w-3 h-3" />
//                                                             <span>Update Status</span>
//                                                           </>
//                                                         )}
//                                                       </button>
//                                                     </div>
//                                                   ))}
//                                                 </div>
//                                               ) : (
//                                                 <div className="text-center py-6">
//                                                   <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//                                                   <p className="text-slate-500">No tasks assigned yet.</p>
//                                                   <p className="text-sm text-slate-400">
//                                                     Click "Assign Task" to get started.
//                                                   </p>
//                                                 </div>
//                                               )}
//                                             </div>
//                                           )}
//                                         </div>
//                                       )
//                                     })}
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           ) : (
//                             <div className="text-center py-8">
//                               <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                               <h3 className="lg:text-lg font-semibold text-slate-600 mb-2">No Developers Found</h3>
//                               <p className="text-slate-500">This project doesn't have any developers assigned yet.</p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {selectedDeveloper && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/20">
           
//             <div className="p-6 border-b border-slate-100">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
//                     <Plus className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-slate-800">Assign Task</h2>
//                     <p className="text-sm text-slate-600">Create a new task for {selectedDeveloper.name}</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={closeTaskAssignmentModal}
//                   className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                 >
//                   <X className="w-5 h-5 text-slate-600" />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmitTaskAssignment} className="p-6 space-y-6">
             
//               <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
//                     <User className="w-5 h-5 text-white" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-slate-800">{selectedDeveloper.name}</p>
//                     <p className="text-sm text-slate-600">{selectedDeveloper.role}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Task Title</label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <FileText className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Enter task title"
//                     required
//                     className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700"
//                     value={taskFormData.title}
//                     onChange={(e) => handleAssignmentChange("title", e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Task Description</label>
//                 <textarea
//                   placeholder="Describe the task in detail..."
//                   required
//                   rows={4}
//                   className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700 resize-none"
//                   value={taskFormData.description}
//                   onChange={(e) => handleAssignmentChange("description", e.target.value)}
//                 />
//               </div>

//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Attach File (Optional)</label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <Upload className="h-4 w-4 text-slate-400" />
//                   </div>
//                   <input
//                     type="file"
//                     onChange={handleAssignmentFileChange}
//                     className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
//                   />
//                 </div>
//               </div>

//               <div className="flex space-x-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={closeTaskAssignmentModal}
//                   className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none flex items-center justify-center space-x-2"
//                 >
//                   {submitting ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       <span>Assigning...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Send className="w-4 h-4" />
//                       <span>Assign Task</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {isStatusUpdateModalOpen && selectedTaskForStatusUpdate && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/20">
          
//             <div className="p-6 border-b border-slate-100">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
//                     <Eye className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-slate-800">Update Task Status</h2>
//                     <p className="text-sm text-slate-600">
//                       For task: {selectedTaskForStatusUpdate.task.title} by {selectedTaskForStatusUpdate.developer.name}
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={closeStatusUpdateModal}
//                   className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                 >
//                   <X className="w-5 h-5 text-slate-600" />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleStatusUpdate} className="p-6 space-y-6">
//               {selectedTaskForStatusUpdate.task.submitted_at && selectedTaskForStatusUpdate.task.submission_comment && (
//                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
//                   <h3 className="font-semibold text-slate-800 mb-2 flex items-center">
//                     <MessageSquare className="w-4 h-4 mr-2 text-slate-600" />
//                     Developer's Comment
//                   </h3>
//                   <p className="text-sm text-slate-700 mb-3 whitespace-pre-wrap">
//                     {selectedTaskForStatusUpdate.task.submission_comment || "No comment provided."}
//                   </p>
//                   {selectedTaskForStatusUpdate.task.submission_file?.path && (
//                     <a
//                       href={selectedTaskForStatusUpdate.task.submission_file.path}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center text-sm text-blue-600 hover:underline"
//                     >
//                       <Download className="w-4 h-4 mr-1" />
//                       <span>Download Submitted File</span>
//                     </a>
//                   )}
//                   <div className="flex items-center text-xs text-slate-500 mt-2">
//                     <Calendar className="w-3 h-3 mr-1" />
//                     <span>Submitted on: {formatDate(selectedTaskForStatusUpdate.task.submitted_at)}</span>
//                   </div>
//                 </div>
//               )}

//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Your Feedback (Optional)</label>
//                 <textarea
//                   placeholder="Provide feedback for the developer..."
//                   rows={3}
//                   className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700 resize-none"
//                   value={reviewFeedback}
//                   onChange={(e) => setReviewFeedback(e.target.value)}
//                 />
//               </div>

//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Update Task Status</label>
//                 <div className="relative">
//                   <select
//                     value={reviewStatus}
//                     onChange={(e) => setReviewStatus(e.target.value)}
//                     required
//                     className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 appearance-none cursor-pointer"
//                   >
//                     <option value="completed">Completed</option>
//                     <option value="revision">Needs Revision</option>
//                     <option value="rejected">Rejected</option>
//                     <option value="in progress">In Progress (Revert)</option>
//                     <option value="pending">Pending (Revert)</option>
//                   </select>
//                   <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
//                     <ChevronDown className="h-5 w-5 text-slate-400" />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex space-x-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={closeStatusUpdateModal}
//                   className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={reviewSubmitting}
//                   className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none flex items-center justify-center space-x-2"
//                 >
//                   {reviewSubmitting ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       <span>Updating...</span>
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle className="w-4 h-4" />
//                       <span>Update Status</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default TeamLeadTaskBoard



// "use client"

// import { useEffect, useState } from "react"
// import axios from "axios"
// import Swal from "sweetalert2"
// import {
//   Users,
//   User,
//   ChevronDown,
//   ChevronUp,
//   Plus,
//   FileText,
//   Calendar,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   X,
//   Upload,
//   Briefcase,
//   Target,
//   FolderOpen,
//   Loader2,
//   Send,
//   MessageSquare,
//   Download,
//   Eye,
// } from "lucide-react"

// const TeamLeadTaskBoard = () => {
//   const [projects, setProjects] = useState([])
//   const [expandedProjectId, setExpandedProjectId] = useState(null)
//   const [projectDevelopers, setProjectDevelopers] = useState({})
//   const [selectedDeveloper, setSelectedDeveloper] = useState(null) // For assigning new tasks
//   const [taskFormData, setTaskFormData] = useState({
//     title: "",
//     description: "",
//     file: null,
//   })
//   const [openedTasks, setOpenedTasks] = useState({})
//   const [developerTasks, setDeveloperTasks] = useState({}) // Stores tasks for expanded developers
//   const [loading, setLoading] = useState(true)
//   const [submitting, setSubmitting] = useState(false) // For assigning new tasks

//   // Renamed states for generic task status update modal
//   const [selectedTaskForStatusUpdate, setSelectedTaskForStatusUpdate] = useState(null)
//   const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false)
//   const [reviewFeedback, setReviewFeedback] = useState("")
//   const [reviewStatus, setReviewStatus] = useState("completed") // Default status for review action
//   const [reviewSubmitting, setReviewSubmitting] = useState(false) // For submitting review action

//   const API = import.meta.env.VITE_API_BASE_URL

//   // Fetch projects on component mount
//   const fetchProjects = async () => {
//     try {
//       const res = await axios.get(`${API}/api/projects/team-lead/projects`, {
//         withCredentials: true,
//       })
//       setProjects(res.data.projects)
//     } catch (err) {
//       console.error("Error fetching projects:", err)
//       Swal.fire("Error", "Failed to load projects", "error")
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchProjects()
//   }, [])

//   const handleCardClick = async (projectId) => {
//     if (expandedProjectId === projectId) {
//       setExpandedProjectId(null)
//       return
//     }
//     try {
//       const res = await axios.get(`${API}/api/projects/projects/${projectId}/developers`)
//       setProjectDevelopers((prev) => ({
//         ...prev,
//         [projectId]: res.data.developers,
//       }))
//       setExpandedProjectId(projectId)
//     } catch (err) {
//       console.error("Error fetching developers:", err)
//       Swal.fire("Error", "Failed to load developers", "error")
//     }
//   }

//   const groupByRole = (developers) => {
//     return developers.reduce((acc, dev) => {
//       if (!acc[dev.role]) acc[dev.role] = []
//       acc[dev.role].push(dev)
//       return acc
//     }, {})
//   }

//   const toggleTaskDropdown = async (projectId, developerId) => {
//     const key = `${projectId}_${developerId}`
//     setOpenedTasks((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }))
//     if (!developerTasks[key]) {
//       try {
//         // This endpoint should now return tasks with submission details if available
//         const res = await axios.get(`${API}/api/projects/projects/${projectId}/developers/${developerId}/tasks`, {
//           withCredentials: true, // Ensure authentication for task details
//         })
//         setDeveloperTasks((prev) => ({
//           ...prev,
//           [key]: res.data.tasks,
//         }))
//       } catch (err) {
//         console.error("Error fetching tasks:", err)
//         Swal.fire("Error", "Could not fetch tasks", "error")
//       }
//     }
//   }

//   const openTaskAssignmentModal = (dev) => {
//     setSelectedDeveloper(dev)
//     setTaskFormData({
//       title: "",
//       description: "",
//       file: null,
//     })
//   }

//   const closeTaskAssignmentModal = () => {
//     setSelectedDeveloper(null)
//   }

//   const handleAssignmentChange = (field, value) => {
//     setTaskFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }))
//   }

//   const handleAssignmentFileChange = (e) => {
//     setTaskFormData((prev) => ({
//       ...prev,
//       file: e.target.files[0],
//     }))
//   }

//   const handleSubmitTaskAssignment = async (e) => {
//     e.preventDefault()
//     const { title, description, file } = taskFormData
//     const dev = selectedDeveloper

//     if (!title || !description || !dev || !expandedProjectId) {
//       return Swal.fire("Error", "Please fill in all fields", "error")
//     }

//     setSubmitting(true)
//     const formData = new FormData()
//     formData.append("developerId", dev.employee_id)
//     formData.append("project_id", expandedProjectId)
//     formData.append("title", title)
//     formData.append("description", description)
//     if (file) formData.append("file", file)

//     try {
//       await axios.post(`${API}/api/projects/tasks/assign`, formData, {
//         withCredentials: true,
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       })
//       Swal.fire("Success", "Task assigned successfully!", "success")
//       closeTaskAssignmentModal()
//       const key = `${expandedProjectId}_${dev.employee_id}`
//       // Re-fetch tasks for the specific developer to show the newly assigned task
//       const res = await axios.get(
//         `${API}/api/projects/projects/${expandedProjectId}/developers/${dev.employee_id}/tasks`,
//         { withCredentials: true },
//       )
//       setDeveloperTasks((prev) => ({
//         ...prev,
//         [key]: res.data.tasks,
//       }))
//     } catch (err) {
//       console.error("Task assignment error:", err.response?.data || err.message)
//       Swal.fire("Error", err.response?.data?.message || "Task assignment failed", "error")
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   // Function to open the generic status update modal
//   const openStatusUpdateModal = (project, developer, task) => {
//     setSelectedTaskForStatusUpdate({ project_id: project.project_id, developer, task })
//     setReviewFeedback(task.revision_feedback || "") // Pre-fill if exists
//     setReviewStatus(task.status) // Set initial status to current task status
//     setIsStatusUpdateModalOpen(true)
//   }

//   // Function to close the generic status update modal
//   const closeStatusUpdateModal = () => {
//     setSelectedTaskForStatusUpdate(null)
//     setReviewFeedback("")
//     setReviewStatus("completed") // Reset to default
//     setIsStatusUpdateModalOpen(false)
//   }

//   const handleStatusUpdate = async (e) => {
//     e.preventDefault()

//     if (!selectedTaskForStatusUpdate || !reviewStatus) {
//       Swal.fire("Error", "Please select a status for review.", "error")
//       return
//     }

//     if (reviewStatus === "revision" && !reviewFeedback.trim()) {
//       Swal.fire("Error", "Please provide feedback for revision.", "error")
//       return
//     }

//     setReviewSubmitting(true)
//     try {
//       await axios.put(
//         `${API}/api/task-submissions/projects/${selectedTaskForStatusUpdate.project_id}/developers/${selectedTaskForStatusUpdate.developer.employee_id}/tasks/${selectedTaskForStatusUpdate.task.task_id}/status`,
//         {
//           status: reviewStatus,
//           feedback: reviewFeedback,
//         },
//         { withCredentials: true },
//       )
//       Swal.fire("Success", `Task status updated to '${reviewStatus}'!`, "success")
//       closeStatusUpdateModal()
//       // Refresh developerTasks for the specific developer to update task status
//       const key = `${selectedTaskForStatusUpdate.project_id}_${selectedTaskForStatusUpdate.developer.employee_id}`
//       const res = await axios.get(
//         `${API}/api/projects/projects/${selectedTaskForStatusUpdate.project_id}/developers/${selectedTaskForStatusUpdate.developer.employee_id}/tasks`,
//         { withCredentials: true },
//       )
//       setDeveloperTasks((prev) => ({
//         ...prev,
//         [key]: res.data.tasks,
//       }))
//     } catch (err) {
//       console.error("Error updating task status:", err.response?.data || err.message)
//       Swal.fire("Error", err.response?.data?.error || "Failed to update task status", "error")
//     } finally {
//       setReviewSubmitting(false)
//     }
//   }

//   const getTaskStatusIcon = (status) => {
//     switch (status?.toLowerCase()) {
//       case "completed":
//         return <CheckCircle className="w-4 h-4 text-emerald-500" />
//       case "in progress":
//         return <Clock className="w-4 h-4 text-yellow-500" />
//       case "pending":
//         return <AlertCircle className="w-4 h-4 text-slate-500" />
//       case "submitted": // Status for submitted tasks awaiting review
//         return <Send className="w-4 h-4 text-blue-500" />
//       case "revision": // Status for tasks needing revision
//         return <MessageSquare className="w-4 h-4 text-orange-500" />
//       default:
//         return <Clock className="w-4 h-4 text-slate-500" />
//     }
//   }

//   const getTaskStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case "completed":
//         return "bg-emerald-100 text-emerald-800 border-emerald-200"
//       case "in progress":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200"
//       case "pending":
//         return "bg-slate-100 text-slate-800 border-slate-200"
//       case "submitted": // Status for submitted tasks awaiting review
//         return "bg-blue-100 text-blue-800 border-blue-200"
//       case "revision": // Status for tasks needing revision
//         return "bg-orange-100 text-orange-800 border-orange-200"
//       default:
//         return "bg-slate-100 text-slate-800 border-slate-200"
//     }
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A"
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     })
//   }

//   if (loading) {
//     return (
//       <div className="p-6 lg:p-8">
//         <div className="flex items-center justify-center h-64">
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
//               <Loader2 className="w-8 h-8 text-white animate-spin" />
//             </div>
//             <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading Task Board...</h2>
//             <p className="text-slate-600">Please wait while we fetch your projects and tasks</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6 lg:p-8">
//       <div className="max-w-6xl mx-auto">
//         {/* Header Section */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
//             <Target className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
//             Team Lead Task Board
//           </h1>
//           <p className="text-slate-600">Assign and manage tasks for your team members</p>
//         </div>

//         {/* Projects List */}
//         <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
//           {projects.length === 0 ? (
//             <div className="p-12 text-center">
//               <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//               <h3 className="lg:text-lg font-semibold text-slate-600 mb-2">No Projects Available</h3>
//               <p className="text-slate-500">You don't have any projects to manage tasks for.</p>
//             </div>
//           ) : (
//             <div className="divide-y divide-slate-100">
//               {projects.map((project) => {
//                 const isExpanded = expandedProjectId === project.project_id
//                 const developers = projectDevelopers[project.project_id] || []
//                 const grouped = groupByRole(developers)

//                 return (
//                   <div key={project.project_id} className="transition-all duration-300">
//                     {/* Project Header - Clickable */}
//                     <div
//                       className="p-6 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer group"
//                       onClick={() => handleCardClick(project.project_id)}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-4">
//                           <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
//                             <Briefcase className="w-6 h-6 text-white" />
//                           </div>
//                           <div>
//                             <h2 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors text-lg">
//                               {project.project_name}
//                             </h2>
//                             <p className="text-sm text-slate-600 mb-1">Manager: {project.project_manager_name}</p>
//                             <p className="text-xs font-mono text-slate-500">ID: {project.project_id}</p>
//                           </div>
//                         </div>

//                         <div className="flex items-center space-x-4">
//                           <div className="text-right">
//                             <div className="flex items-center space-x-1 text-xs text-slate-500 mb-1">
//                               <Users className="w-3 h-3" />
//                               <span>{developers.length} developers</span>
//                             </div>
//                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
//                               <Target className="w-3 h-3 mr-1" />
//                               Active
//                             </span>
//                           </div>
//                           {isExpanded ? (
//                             <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
//                           ) : (
//                             <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Expanded Developer List */}
//                     {isExpanded && (
//                       <div className="px-6 pb-6 bg-slate-50/30 border-t border-slate-100">
//                         <div className="pt-6">
//                           {developers.length > 0 ? (
//                             <div className="space-y-6">
//                               {Object.entries(grouped).map(([role, devs]) => (
//                                 <div
//                                   key={role}
//                                   className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-6"
//                                 >
//                                   <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
//                                     <Briefcase className="w-5 h-5 text-emerald-600 mr-2" />
//                                     {role} ({devs.length})
//                                   </h3>
//                                   <div className="space-y-4">
//                                     {devs.map((dev) => {
//                                       const key = `${project.project_id}_${dev.employee_id}`
//                                       const isOpen = openedTasks[key]
//                                       const tasks = developerTasks[key] || []

//                                       return (
//                                         <div
//                                           key={dev.employee_id}
//                                           className="bg-slate-50 rounded-xl border border-slate-200 p-4 transition-all duration-200"
//                                         >
//                                           <div className="flex justify-between items-center">
//                                             <div
//                                               className="cursor-pointer flex-1"
//                                               onClick={() => toggleTaskDropdown(project.project_id, dev.employee_id)}
//                                             >
//                                               <div className="flex items-center space-x-3">
//                                                 <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
//                                                   <User className="w-5 h-5 text-white" />
//                                                 </div>
//                                                 <div>
//                                                   <p className="font-semibold text-slate-800">{dev.name}</p>
//                                                   <p className="text-sm text-slate-500 flex items-center">
//                                                     <FileText className="w-3 h-3 mr-1" />
//                                                     Click to view tasks ({tasks.length})
//                                                   </p>
//                                                 </div>
//                                               </div>
//                                             </div>
//                                             <button
//                                               onClick={() => openTaskAssignmentModal(dev)}
//                                               className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center space-x-2"
//                                             >
//                                               <Plus className="w-4 h-4" />
//                                               <span>Assign Task</span>
//                                             </button>
//                                           </div>

//                                           {/* Tasks Dropdown */}
//                                           {isOpen && (
//                                             <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
//                                               <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
//                                                 <FileText className="w-4 h-4 text-emerald-600 mr-2" />
//                                                 Assigned Tasks
//                                               </h4>
//                                               {tasks.length > 0 ? (
//                                                 <div className="space-y-3">
//                                                   {tasks.map((task) => (
//                                                     <div
//                                                       key={task.task_id}
//                                                       className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow"
//                                                     >
//                                                       <div className="flex items-start justify-between mb-2">
//                                                         <h5 className="font-semibold text-slate-800">{task.title}</h5>
//                                                         <span
//                                                           className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(
//                                                             task.status,
//                                                           )}`}
//                                                         >
//                                                           {getTaskStatusIcon(task.status)}
//                                                           <span className="ml-1 capitalize">{task.status}</span>
//                                                         </span>
//                                                       </div>
//                                                       <p className="text-sm text-slate-600 mb-2">{task.description}</p>
//                                                       <div className="flex items-center text-xs text-slate-500 mb-2">
//                                                         <Calendar className="w-3 h-3 mr-1" />
//                                                         <span>Assigned: {formatDate(task.assigned_at)}</span>
//                                                       </div>

//                                                       {/* Display Submission Details if available */}
//                                                       {task.submitted_at && task.submission_comment && (
//                                                         <div className="mt-3 pt-3 border-t border-slate-100">
//                                                           <h6 className="text-xs font-semibold text-slate-700 mb-1 flex items-center">
//                                                             <Send className="w-3 h-3 mr-1 text-blue-500" />
//                                                             Latest Submission:
//                                                           </h6>
//                                                           <p className="text-xs text-slate-600 mb-1">
//                                                             <span className="font-medium">Comment:</span>{" "}
//                                                             {task.submission_comment}
//                                                           </p>
//                                                           {task.submission_file?.path && (
//                                                             <a
//                                                               href={task.submission_file.path}
//                                                               target="_blank"
//                                                               rel="noopener noreferrer"
//                                                               className="inline-flex items-center text-xs text-blue-600 hover:underline mt-1"
//                                                             >
//                                                               <Download className="w-3 h-3 mr-1" />
//                                                               <span>Download File</span>
//                                                             </a>
//                                                           )}
//                                                           <div className="flex items-center text-xs text-slate-500 mt-1">
//                                                             <Calendar className="w-3 h-3 mr-1" />
//                                                             <span>Submitted: {formatDate(task.submitted_at)}</span>
//                                                           </div>
//                                                           {task.revision_feedback && (
//                                                             <div className="mt-2 p-2 bg-orange-50 rounded-md border border-orange-200">
//                                                               <p className="text-xs font-medium text-orange-800">
//                                                                 Feedback: {task.revision_feedback}
//                                                               </p>
//                                                             </div>
//                                                           )}
//                                                         </div>
//                                                       )}
//                                                       {/* Universal Status Update Button */}
//                                                       <button
//                                                         onClick={() => openStatusUpdateModal(project, dev, task)}
//                                                         className={`mt-3 w-full ${
//                                                           task.status === "submitted"
//                                                             ? "bg-blue-600 hover:bg-blue-700"
//                                                             : "bg-slate-600 hover:bg-slate-700"
//                                                         } text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm flex items-center justify-center space-x-2 text-xs`}
//                                                       >
//                                                         {task.status === "submitted" ? (
//                                                           <>
//                                                             <Eye className="w-3 h-3" />
//                                                             <span>Review Submission</span>
//                                                           </>
//                                                         ) : (
//                                                           <>
//                                                             <CheckCircle className="w-3 h-3" />
//                                                             <span>Update Status</span>
//                                                           </>
//                                                         )}
//                                                       </button>
//                                                     </div>
//                                                   ))}
//                                                 </div>
//                                               ) : (
//                                                 <div className="text-center py-6">
//                                                   <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//                                                   <p className="text-slate-500">No tasks assigned yet.</p>
//                                                   <p className="text-sm text-slate-400">
//                                                     Click "Assign Task" to get started.
//                                                   </p>
//                                                 </div>
//                                               )}
//                                             </div>
//                                           )}
//                                         </div>
//                                       )
//                                     })}
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           ) : (
//                             <div className="text-center py-8">
//                               <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                               <h3 className="lg:text-lg font-semibold text-slate-600 mb-2">No Developers Found</h3>
//                               <p className="text-slate-500">This project doesn't have any developers assigned yet.</p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Task Assignment Modal */}
//       {selectedDeveloper && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/20">
//             {/* Modal Header */}
//             <div className="p-6 border-b border-slate-100">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
//                     <Plus className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-slate-800">Assign Task</h2>
//                     <p className="text-sm text-slate-600">Create a new task for {selectedDeveloper.name}</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={closeTaskAssignmentModal}
//                   className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                 >
//                   <X className="w-5 h-5 text-slate-600" />
//                 </button>
//               </div>
//             </div>

//             {/* Modal Content */}
//             <form onSubmit={handleSubmitTaskAssignment} className="p-6 space-y-6">
//               {/* Developer Info */}
//               <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
//                     <User className="w-5 h-5 text-white" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-slate-800">{selectedDeveloper.name}</p>
//                     <p className="text-sm text-slate-600">{selectedDeveloper.role}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Task Title */}
//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Task Title</label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <FileText className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Enter task title"
//                     required
//                     className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700"
//                     value={taskFormData.title}
//                     onChange={(e) => handleAssignmentChange("title", e.target.value)}
//                   />
//                 </div>
//               </div>

//               {/* Task Description */}
//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Task Description</label>
//                 <textarea
//                   placeholder="Describe the task in detail..."
//                   required
//                   rows={4}
//                   className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700 resize-none"
//                   value={taskFormData.description}
//                   onChange={(e) => handleAssignmentChange("description", e.target.value)}
//                 />
//               </div>

//               {/* File Upload */}
//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Attach File (Optional)</label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <Upload className="h-4 w-4 text-slate-400" />
//                   </div>
//                   <input
//                     type="file"
//                     onChange={handleAssignmentFileChange}
//                     className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
//                   />
//                 </div>
//               </div>

//               {/* Modal Actions */}
//               <div className="flex space-x-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={closeTaskAssignmentModal}
//                   className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none flex items-center justify-center space-x-2"
//                 >
//                   {submitting ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       <span>Assigning...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Send className="w-4 h-4" />
//                       <span>Assign Task</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Generic Task Status Update Modal */}
//       {isStatusUpdateModalOpen && selectedTaskForStatusUpdate && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/20">
//             {/* Modal Header */}
//             <div className="p-6 border-b border-slate-100">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
//                     <Eye className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-slate-800">Update Task Status</h2>
//                     <p className="text-sm text-slate-600">
//                       For task: {selectedTaskForStatusUpdate.task.title} by {selectedTaskForStatusUpdate.developer.name}
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={closeStatusUpdateModal}
//                   className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                 >
//                   <X className="w-5 h-5 text-slate-600" />
//                 </button>
//               </div>
//             </div>

//             {/* Modal Content */}
//             <form onSubmit={handleStatusUpdate} className="p-6 space-y-6">
//               {/* Conditional Submission Details */}
//               {selectedTaskForStatusUpdate.task.submitted_at && selectedTaskForStatusUpdate.task.submission_comment && (
//                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
//                   <h3 className="font-semibold text-slate-800 mb-2 flex items-center">
//                     <MessageSquare className="w-4 h-4 mr-2 text-slate-600" />
//                     Developer's Comment
//                   </h3>
//                   <p className="text-sm text-slate-700 mb-3 whitespace-pre-wrap">
//                     {selectedTaskForStatusUpdate.task.submission_comment || "No comment provided."}
//                   </p>
//                   {selectedTaskForStatusUpdate.task.submission_file?.path && (
//                     <a
//                       href={selectedTaskForStatusUpdate.task.submission_file.path}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center text-sm text-blue-600 hover:underline"
//                     >
//                       <Download className="w-4 h-4 mr-1" />
//                       <span>Download Submitted File</span>
//                     </a>
//                   )}
//                   <div className="flex items-center text-xs text-slate-500 mt-2">
//                     <Calendar className="w-3 h-3 mr-1" />
//                     <span>Submitted on: {formatDate(selectedTaskForStatusUpdate.task.submitted_at)}</span>
//                   </div>
//                 </div>
//               )}

//               {/* Review Feedback */}
//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Your Feedback (Optional)</label>
//                 <textarea
//                   placeholder="Provide feedback for the developer..."
//                   rows={3}
//                   className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700 resize-none"
//                   value={reviewFeedback}
//                   onChange={(e) => setReviewFeedback(e.target.value)}
//                 />
//               </div>

//               {/* Status Update */}
//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Update Task Status</label>
//                 <div className="relative">
//                   <select
//                     value={reviewStatus}
//                     onChange={(e) => setReviewStatus(e.target.value)}
//                     required
//                     className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 appearance-none cursor-pointer"
//                   >
//                     <option value="completed">Completed</option>
//                     <option value="revision">Needs Revision</option>
//                     <option value="rejected">Rejected</option>
//                     <option value="in progress">In Progress (Revert)</option>
//                     <option value="pending">Pending (Revert)</option>
//                   </select>
//                   <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
//                     <ChevronDown className="h-5 w-5 text-slate-400" />
//                   </div>
//                 </div>
//               </div>

//               {/* Modal Actions */}
//               <div className="flex space-x-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={closeStatusUpdateModal}
//                   className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={reviewSubmitting}
//                   className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none flex items-center justify-center space-x-2"
//                 >
//                   {reviewSubmitting ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       <span>Updating...</span>
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle className="w-4 h-4" />
//                       <span>Update Status</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default TeamLeadTaskBoard


