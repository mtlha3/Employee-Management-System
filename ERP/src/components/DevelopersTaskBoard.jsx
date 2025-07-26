// "use client"

// import { useEffect, useState } from "react"
// import axios from "axios"
// import Swal from "sweetalert2"
// import {
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   FileText,
//   Calendar,
//   User,
//   Send,
//   Upload,
//   X,
//   MessageSquare,
//   Target,
//   Briefcase,
//   Loader2,
//   CheckSquare,
//   FolderOpen,
//   Users,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react"

// const DevelopersTaskBoard = () => {
//   const [projectsAndTasks, setProjectsAndTasks] = useState([])
//   const [expandedProjects, setExpandedProjects] = useState({})
//   const [selectedTask, setSelectedTask] = useState(null)
//   const [submissionData, setSubmissionData] = useState({
//     comments: "",
//     file: null,
//   })
//   const [loading, setLoading] = useState(true)
//   const [submitting, setSubmitting] = useState(false)
//   const [error, setError] = useState(null)

//   const fetchProjectsAndTasks = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/api/projects/developers/projects-and-tasks", {
//         withCredentials: true,
//       })
//       setProjectsAndTasks(response.data)
//     } catch (err) {
//       console.error("Error fetching projects and tasks:", err)
//       setError("Failed to load tasks.")
//       Swal.fire("Error", "Failed to load your projects and tasks", "error")
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchProjectsAndTasks()
//   }, [])

//   const toggleProject = (projectId) => {
//     setExpandedProjects((prev) => ({
//       ...prev,
//       [projectId]: !prev[projectId],
//     }))
//   }

//   const getTaskStatusIcon = (status) => {
//     switch (status?.toLowerCase()) {
//       case "completed":
//         return <CheckCircle className="w-4 h-4 text-emerald-500" />
//       case "in progress":
//         return <Clock className="w-4 h-4 text-yellow-500" />
//       case "submitted":
//         return <CheckSquare className="w-4 h-4 text-blue-500" />
//       case "pending":
//         return <AlertCircle className="w-4 h-4 text-slate-500" />
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
//       case "submitted":
//         return "bg-blue-100 text-blue-800 border-blue-200"
//       case "pending":
//         return "bg-slate-100 text-slate-800 border-slate-200"
//       default:
//         return "bg-slate-100 text-slate-800 border-slate-200"
//     }
//   }

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     })
//   }

//   const openSubmissionModal = (task) => {
//     setSelectedTask(task)
//     setSubmissionData({
//       comments: "",
//       file: null,
//     })
//   }

//   const closeSubmissionModal = () => {
//     setSelectedTask(null)
//     setSubmissionData({
//       comments: "",
//       file: null,
//     })
//   }

//   const handleInputChange = (field, value) => {
//     setSubmissionData((prev) => ({
//       ...prev,
//       [field]: value,
//     }))
//   }

//   const handleFileChange = (e) => {
//     setSubmissionData((prev) => ({
//       ...prev,
//       file: e.target.files[0],
//     }))
//   }

//   const handleSubmitTask = async (e) => {
//     e.preventDefault()

//     if (!submissionData.comments.trim()) {
//       Swal.fire("Error", "Please add comments about your task completion", "error")
//       return
//     }

//     setSubmitting(true)
//     const formData = new FormData()
//     formData.append("comment", submissionData.comments) // Changed from "comments" to "comment"
//     if (submissionData.file) {
//       formData.append("file", submissionData.file)
//     }

//     // Add debugging to see what's being sent
//     console.log("Sending submission data:", {
//       taskId: selectedTask.task_id,
//       comment: submissionData.comments,
//       hasFile: !!submissionData.file,
//     })

//     try {
//       // Get the developer ID from the project data (assuming it's available in the selected task's project context)
//       const developerId = projectsAndTasks.find((project) =>
//         project.developer?.tasks?.some((task) => task.task_id === selectedTask.task_id),
//       )?.developer?.employee_id

//       if (!developerId) {
//         throw new Error("Developer ID not found")
//       }

//       await axios.post(
//         `http://localhost:5000/api/projects/developers/${developerId}/tasks/${selectedTask.task_id}/submit`,
//         formData,
//         {
//           withCredentials: true,
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         },
//       )

//       Swal.fire("Success", "Task submitted successfully! Status changed to 'Submitted' - awaiting review.", "success")
//       closeSubmissionModal()
//       fetchProjectsAndTasks() // Refresh the data
//     } catch (error) {
//       console.error("Task submission error:", error)
//       Swal.fire("Error", error.response?.data?.message || "Failed to submit task", "error")
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const canSubmitTask = (status) => {
//     const submittableStatuses = ["pending", "in progress", "in_progress"]
//     return submittableStatuses.includes(status?.toLowerCase())
//   }

//   if (loading) {
//     return (
//       <div className="p-6 lg:p-8">
//         <div className="flex items-center justify-center h-64">
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
//               <Loader2 className="w-8 h-8 text-white animate-spin" />
//             </div>
//             <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading Your Projects...</h2>
//             <p className="text-slate-600">Please wait while we fetch your assigned projects and tasks</p>
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
//             <CheckSquare className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
//             My Projects & Tasks
//           </h1>
//           <p className="text-slate-600">View and manage your assigned projects and tasks</p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 p-4 rounded-xl border-l-4 bg-red-50 border-red-400 text-red-800 shadow-sm">
//             <div className="flex items-center">
//               <AlertCircle className="flex-shrink-0 w-5 h-5 mr-3 text-red-400" />
//               <span className="font-medium text-sm">{error}</span>
//             </div>
//           </div>
//         )}

//         {/* Projects List */}
//         <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
//           {projectsAndTasks.length === 0 ? (
//             <div className="p-12 text-center">
//               <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//               <h3 className="text-lg font-semibold text-slate-600 mb-2">No Projects Found</h3>
//               <p className="text-slate-500">You don't have any projects assigned to you yet.</p>
//             </div>
//           ) : (
//             <div className="divide-y divide-slate-100">
//               {projectsAndTasks.map((project) => {
//                 const isExpanded = expandedProjects[project.project_id]
//                 const tasks = project.developer?.tasks || []

//                 return (
//                   <div key={project.project_id} className="transition-all duration-300">
//                     {/* Project Header - Clickable */}
//                     <div
//                       onClick={() => toggleProject(project.project_id)}
//                       className="p-6 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer group"
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-4">
//                           <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
//                             <Briefcase className="w-6 h-6 text-white" />
//                           </div>
//                           <div>
//                             <h3 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors text-lg">
//                               {project.project_name}
//                             </h3>
//                             <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
//                               <div className="flex items-center space-x-1">
//                                 <Calendar className="w-3 h-3" />
//                                 <span>
//                                   {formatDate(project.start_date)} - {formatDate(project.end_date)}
//                                 </span>
//                               </div>
//                               <div className="flex items-center space-x-1">
//                                 <FileText className="w-3 h-3" />
//                                 <span>
//                                   {tasks.length} task{tasks.length !== 1 ? "s" : ""}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="flex items-center space-x-4">
//                           <div className="text-right">
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

//                     {/* Expanded Project Details */}
//                     {isExpanded && (
//                       <div className="px-6 pb-6 bg-slate-50/30 border-t border-slate-100">
//                         <div className="pt-6 space-y-6">
//                           {/* Project Information */}
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
//                               <label className="block text-sm font-semibold text-slate-700 mb-2">Project Manager</label>
//                               <div className="flex items-center space-x-2">
//                                 <User className="w-4 h-4 text-slate-500" />
//                                 <span className="text-slate-800 font-medium">
//                                   {project.project_manager_name || "N/A"}
//                                 </span>
//                               </div>
//                             </div>

//                             <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
//                               <label className="block text-sm font-semibold text-slate-700 mb-2">Team Lead</label>
//                               <div className="flex items-center space-x-2">
//                                 <Users className="w-4 h-4 text-slate-500" />
//                                 <span className="text-slate-800 font-medium">
//                                   {project.team_lead?.name || "N/A"}
//                                   {project.team_lead?.role && ` (${project.team_lead.role})`}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Developer Info */}
//                           <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
//                             <label className="block text-sm font-semibold text-slate-700 mb-3">Your Role</label>
//                             <div className="flex items-center space-x-3">
//                               <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
//                                 <User className="w-5 h-5 text-white" />
//                               </div>
//                               <div>
//                                 <p className="font-semibold text-slate-800">{project.developer?.name}</p>
//                                 <p className="text-sm text-slate-600">{project.developer?.role}</p>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Tasks Section */}
//                           <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-6">
//                             <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
//                               <FileText className="w-5 h-5 text-emerald-600 mr-2" />
//                               Your Tasks ({tasks.length})
//                             </h4>

//                             {tasks.length === 0 ? (
//                               <div className="text-center py-8">
//                                 <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//                                 <p className="text-slate-500">No tasks assigned yet.</p>
//                               </div>
//                             ) : (
//                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 {tasks.map((task) => (
//                                   <div
//                                     key={task.task_id}
//                                     className="bg-slate-50 rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-all duration-200"
//                                   >
//                                     {/* Task Header */}
//                                     <div className="flex items-start justify-between mb-3">
//                                       <div className="flex items-center space-x-2">
//                                         <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-md flex items-center justify-center">
//                                           <FileText className="w-3 h-3 text-white" />
//                                         </div>
//                                         <span className="text-xs font-mono text-slate-500">#{task.task_id}</span>
//                                       </div>
//                                       <span
//                                         className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(
//                                           task.status,
//                                         )}`}
//                                       >
//                                         {getTaskStatusIcon(task.status)}
//                                         <span className="ml-1 capitalize">{task.status || "pending"}</span>
//                                       </span>
//                                     </div>

//                                     {/* Task Content */}
//                                     <h5 className="font-semibold text-slate-800 mb-2">{task.title}</h5>
//                                     <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>

//                                     {/* Task Actions */}
//                                     {canSubmitTask(task.status) ? (
//                                       <button
//                                         onClick={() => openSubmissionModal(task)}
//                                         className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm flex items-center justify-center space-x-2 text-sm"
//                                       >
//                                         <Send className="w-3 h-3" />
//                                         <span>Submit Task</span>
//                                       </button>
//                                     ) : (
//                                       <div className="text-center py-2">
//                                         <span className="text-xs text-slate-500 font-medium">
//                                           {task.status === "completed"
//                                             ? "Task Completed"
//                                             : task.status === "submitted"
//                                               ? "Submitted - Awaiting Review"
//                                               : "Cannot Submit"}
//                                         </span>
//                                       </div>
//                                     )}
//                                   </div>
//                                 ))}
//                               </div>
//                             )}
//                           </div>
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

//       {/* Task Submission Modal */}
//       {selectedTask && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/20">
//             {/* Modal Header */}
//             <div className="p-6 border-b border-slate-100">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
//                     <Send className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-slate-800">Submit Task</h2>
//                     <p className="text-sm text-slate-600">Complete your task submission</p>
//                   </div>
//                 </div>
//                 <button onClick={closeSubmissionModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
//                   <X className="w-5 h-5 text-slate-600" />
//                 </button>
//               </div>
//             </div>

//             {/* Modal Content */}
//             <form onSubmit={handleSubmitTask} className="p-6 space-y-6">
//               {/* Task Info */}
//               <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
//                 <div className="flex items-center space-x-3 mb-2">
//                   <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
//                     <FileText className="w-4 h-4 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-slate-800">{selectedTask.title}</h3>
//                     <p className="text-xs text-slate-500">Task ID: #{selectedTask.task_id}</p>
//                   </div>
//                 </div>
//                 <p className="text-sm text-slate-600 mt-2">{selectedTask.description}</p>
//               </div>

//               {/* Comments */}
//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Completion Comments *</label>
//                 <div className="relative">
//                   <div className="absolute top-3 left-3 pointer-events-none">
//                     <MessageSquare className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
//                   </div>
//                   <textarea
//                     placeholder="Describe what you've completed, any challenges faced, or additional notes..."
//                     required
//                     rows={4}
//                     className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700 resize-none"
//                     value={submissionData.comments}
//                     onChange={(e) => handleInputChange("comments", e.target.value)}
//                   />
//                 </div>
//               </div>

//               {/* File Upload */}
//               <div className="group">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Attach Deliverable (Optional)</label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <Upload className="h-4 w-4 text-slate-400" />
//                   </div>
//                   <input
//                     type="file"
//                     onChange={handleFileChange}
//                     className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
//                   />
//                 </div>
//                 <p className="text-xs text-slate-500 mt-1">
//                   Upload your completed work, screenshots, or any relevant files
//                 </p>
//               </div>

//               {/* Modal Actions */}
//               <div className="flex space-x-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={closeSubmissionModal}
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
//                       <span>Submitting...</span>
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle className="w-4 h-4" />
//                       <span>Submit Task</span>
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

// export default DevelopersTaskBoard


"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  User,
  Send,
  Upload,
  X,
  MessageSquare,
  Target,
  Briefcase,
  Loader2,
  CheckSquare,
  FolderOpen,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

const DevelopersTaskBoard = () => {
  const [projectsAndTasks, setProjectsAndTasks] = useState([])
  const [expandedProjects, setExpandedProjects] = useState({})
  const [selectedTask, setSelectedTask] = useState(null)
  const [submissionData, setSubmissionData] = useState({
    comments: "",
    file: null,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const fetchProjectsAndTasks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/projects/developers/projects-and-tasks", {
        withCredentials: true,
      })
      setProjectsAndTasks(response.data)
    } catch (err) {
      console.error("Error fetching projects and tasks:", err)
      setError("Failed to load tasks.")
      Swal.fire("Error", "Failed to load your projects and tasks", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectsAndTasks()
  }, [])

  const toggleProject = (projectId) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }))
  }

  const getTaskStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case "in progress":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "submitted":
        return <CheckSquare className="w-4 h-4 text-blue-500" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-slate-500" />
      case "revision": // Added revision status icon
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
      case "submitted":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-slate-100 text-slate-800 border-slate-200"
      case "revision": // Added revision status color
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const openSubmissionModal = (task) => {
    setSelectedTask(task)
    setSubmissionData({
      comments: "",
      file: null,
    })
  }

  const closeSubmissionModal = () => {
    setSelectedTask(null)
    setSubmissionData({
      comments: "",
      file: null,
    })
  }

  const handleInputChange = (field, value) => {
    setSubmissionData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e) => {
    setSubmissionData((prev) => ({
      ...prev,
      file: e.target.files[0],
    }))
  }

  const handleSubmitTask = async (e) => {
    e.preventDefault()

    if (!submissionData.comments.trim()) {
      Swal.fire("Error", "Please add comments about your task completion", "error")
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append("comment", submissionData.comments)
    if (submissionData.file) {
      formData.append("file", submissionData.file)
    }

    console.log("Sending submission data:", {
      taskId: selectedTask.task_id,
      comment: submissionData.comments,
      hasFile: !!submissionData.file,
    })

    try {
      const developerId = projectsAndTasks.find((project) =>
        project.developer?.tasks?.some((task) => task.task_id === selectedTask.task_id),
      )?.developer?.employee_id

      if (!developerId) {
        throw new Error("Developer ID not found")
      }

      await axios.post(
        `http://localhost:5000/api/projects/developers/${developerId}/tasks/${selectedTask.task_id}/submit`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )

      Swal.fire("Success", "Task submitted successfully! Status changed to 'Submitted' - awaiting review.", "success")
      closeSubmissionModal()
      fetchProjectsAndTasks() // Refresh the data
    } catch (error) {
      console.error("Task submission error:", error)
      Swal.fire("Error", error.response?.data?.message || "Failed to submit task", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmitTask = (status) => {
    const submittableStatuses = ["pending", "in progress", "in_progress", "revision"] // Added 'revision'
    return submittableStatuses.includes(status?.toLowerCase())
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading Your Projects...</h2>
            <p className="text-slate-600">Please wait while we fetch your assigned projects and tasks</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <CheckSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            My Projects & Tasks
          </h1>
          <p className="text-slate-600">View and manage your assigned projects and tasks</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border-l-4 bg-red-50 border-red-400 text-red-800 shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="flex-shrink-0 w-5 h-5 mr-3 text-red-400" />
              <span className="font-medium text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {projectsAndTasks.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No Projects Found</h3>
              <p className="text-slate-500">You don't have any projects assigned to you yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {projectsAndTasks.map((project) => {
                const isExpanded = expandedProjects[project.project_id]
                const tasks = project.developer?.tasks || []

                return (
                  <div key={project.project_id} className="transition-all duration-300">
                    {/* Project Header - Clickable */}
                    <div
                      onClick={() => toggleProject(project.project_id)}
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
                            <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {formatDate(project.start_date)} - {formatDate(project.end_date)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FileText className="w-3 h-3" />
                                <span>
                                  {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
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

                    {/* Expanded Project Details */}
                    {isExpanded && (
                      <div className="px-6 pb-6 bg-slate-50/30 border-t border-slate-100">
                        <div className="pt-6 space-y-6">
                          {/* Project Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Project Manager</label>
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-800 font-medium">
                                  {project.project_manager_name || "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Team Lead</label>
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-800 font-medium">
                                  {project.team_lead?.name || "N/A"}
                                  {project.team_lead?.role && ` (${project.team_lead.role})`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Developer Info */}
                          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Your Role</label>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">{project.developer?.name}</p>
                                <p className="text-sm text-slate-600">{project.developer?.role}</p>
                              </div>
                            </div>
                          </div>

                          {/* Tasks Section */}
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-6">
                            <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                              <FileText className="w-5 h-5 text-emerald-600 mr-2" />
                              Your Tasks ({tasks.length})
                            </h4>

                            {tasks.length === 0 ? (
                              <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No tasks assigned yet.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tasks.map((task) => (
                                  <div
                                    key={task.task_id}
                                    className="bg-slate-50 rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-all duration-200"
                                  >
                                    {/* Task Header */}
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-md flex items-center justify-center">
                                          <FileText className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-xs font-mono text-slate-500">#{task.task_id}</span>
                                      </div>
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(
                                          task.status,
                                        )}`}
                                      >
                                        {getTaskStatusIcon(task.status)}
                                        <span className="ml-1 capitalize">{task.status || "pending"}</span>
                                      </span>
                                    </div>

                                    {/* Task Content */}
                                    <h5 className="font-semibold text-slate-800 mb-2">{task.title}</h5>
                                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>

                                    {/* Task Actions */}
                                    {canSubmitTask(task.status) ? (
                                      <button
                                        onClick={() => openSubmissionModal(task)}
                                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm flex items-center justify-center space-x-2 text-sm"
                                      >
                                        <Send className="w-3 h-3" />
                                        <span>
                                          {task.status?.toLowerCase() === "revision" ? "Resubmit Task" : "Submit Task"}
                                        </span>
                                      </button>
                                    ) : (
                                      <div className="text-center py-2">
                                        <span className="text-xs text-slate-500 font-medium">
                                          {task.status?.toLowerCase() === "completed"
                                            ? "Task Completed"
                                            : task.status?.toLowerCase() === "submitted"
                                              ? "Submitted - Awaiting Review"
                                              : "Cannot Submit"}
                                        </span>
                                      </div>
                                    )}

                                    {/* Display Revision Feedback if status is 'revision' */}
                                    {task.status?.toLowerCase() === "revision" && task.revision_feedback && (
                                      <div className="mt-3 p-2 bg-orange-50 rounded-md border border-orange-200">
                                        <h6 className="text-xs font-semibold text-orange-800 mb-1 flex items-center">
                                          <MessageSquare className="w-3 h-3 mr-1" />
                                          Revision Feedback:
                                        </h6>
                                        <p className="text-xs text-orange-700">{task.revision_feedback}</p>
                                      </div>
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

      {/* Task Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/20">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Submit Task</h2>
                    <p className="text-sm text-slate-600">Complete your task submission</p>
                  </div>
                </div>
                <button onClick={closeSubmissionModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmitTask} className="p-6 space-y-6">
              {/* Task Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{selectedTask.title}</h3>
                    <p className="text-xs text-slate-500">Task ID: #{selectedTask.task_id}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2">{selectedTask.description}</p>
              </div>

              {/* Display Revision Feedback if status is 'revision' in the modal */}
              {selectedTask.status?.toLowerCase() === "revision" && selectedTask.revision_feedback && (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-orange-600" />
                    Team Lead Feedback for Revision:
                  </h3>
                  <p className="text-sm text-orange-700 whitespace-pre-wrap">{selectedTask.revision_feedback}</p>
                </div>
              )}

              {/* Comments */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Completion Comments *</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MessageSquare className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <textarea
                    placeholder="Describe what you've completed, any challenges faced, or additional notes..."
                    required
                    rows={4}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700 resize-none"
                    value={submissionData.comments}
                    onChange={(e) => handleInputChange("comments", e.target.value)}
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Attach Deliverable (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Upload className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Upload your completed work, screenshots, or any relevant files
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeSubmissionModal}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Submit Task</span>
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

export default DevelopersTaskBoard
