"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  Loader2,
  UserPlus,
  LineChart,
  FolderOpen,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

const ProjectProgress = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedProject, setExpandedProject] = useState(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/projects/projects`)
        setProjects(response.data.projects)
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <FolderOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            All Projects
          </h1>
          <p className="text-slate-600">Manage and track all your projects in one place</p>
        </div>

        {/* Projects List */}
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

                return (
                  <div key={project.project_id} className="transition-all duration-300">
                    {/* Project Header - Clickable */}
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

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-6 pb-6 bg-slate-50/30 border-t border-slate-100">
                        <div className="pt-6 space-y-6">
                          {/* Project Information Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Project Manager</label>
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-800 font-medium">{project.project_manager_name}</span>
                              </div>
                            </div>

                            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Project ID</label>
                              <span className="font-mono text-slate-800 text-sm">{project.project_id}</span>
                            </div>

                            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-800">{formatDate(project.start_date)}</span>
                              </div>
                            </div>

                            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                              <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-800">{formatDate(project.end_date)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Project Status */}
                          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Current Status</label>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${projectStatus.color}`}
                            >
                              {getStatusIcon(projectStatus.status)}
                              <span className="ml-2 capitalize">{projectStatus.status}</span>
                            </span>
                          </div>

                          {/* Action Button */}
                          <button
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation()
                              alert("Assign TL logic goes here")
                            }}
                          >
                            <span className="flex items-center justify-center">
                              <UserPlus className="w-5 h-5 mr-2" />
                              Assign Team Lead to Project
                            </span>
                          </button>

                          {/* Project Progress Section */}
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                            <h4 className="text-slate-700 font-semibold mb-3 flex items-center">
                              <LineChart className="w-5 h-5 text-blue-500 mr-2" />
                              Project Progress
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Overall Progress</span>
                                <span className="font-semibold text-slate-800">65%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: "65%" }}
                                ></div>
                              </div>
                              <p className="text-sm text-slate-600 mt-2">
                                Progress tracking and detailed metrics will be displayed here.
                              </p>
                            </div>
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

export default ProjectProgress
