import { useEffect, useState } from "react"
import axios from "axios"
import {
  Users,
  UserPlus,
  Calendar,
  User,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Briefcase,
  CheckCircle,
  Clock,
  FolderOpen,
  Loader2,
  AlertTriangle,
  Zap,
  Target,
} from "lucide-react"

const TeamLeadDashboard = () => {
  const [projects, setProjects] = useState([])
  const [employees, setEmployees] = useState([])
  const [expandedProjectId, setExpandedProjectId] = useState(null)
  const [modalProjectId, setModalProjectId] = useState(null)
  const [selectedDevelopers, setSelectedDevelopers] = useState({})
  const [projectDevelopers, setProjectDevelopers] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)

  const API = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    fetchProjects()
    fetchEmployees()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API}/api/projects/team-lead/projects`, {
        withCredentials: true,
      })
      setProjects(res.data.projects)
    } catch (err) {
      console.error("Error fetching projects:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API}/api/employees/all`)
      setEmployees(res.data.employees)
    } catch (err) {
      console.error("Error fetching employees:", err)
    }
  }

  const fetchDevelopersForProject = async (projectId) => {
    try {
      const res = await axios.get(`${API}/api/projects/projects/${projectId}/developers`)
      setProjectDevelopers((prev) => ({ ...prev, [projectId]: res.data.developers }))
    } catch (err) {
      console.error("Error fetching developers:", err)
    }
  }

  const toggleProjectCard = (projectId) => {
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null)
    } else {
      setExpandedProjectId(projectId)
      fetchDevelopersForProject(projectId)
    }
  }

  const handleCheckboxChange = (projectId, employee) => {
    const current = selectedDevelopers[projectId] || []
    const updated = current.some((dev) => dev.employee_id === employee.employee_id)
      ? current.filter((dev) => dev.employee_id !== employee.employee_id)
      : [...current, employee]
    setSelectedDevelopers({ ...selectedDevelopers, [projectId]: updated })
  }

  const handleAssignDevelopers = async (projectId) => {
    const developers = selectedDevelopers[projectId] || []
    setAssigning(true)
    try {
      await axios.put(`${API}/api/projects/${projectId}/assign-developers`, { developers }, { withCredentials: true })
      setModalProjectId(null)
      setSelectedDevelopers((prev) => ({ ...prev, [projectId]: [] }))
      fetchProjects()
      fetchDevelopersForProject(projectId)
    } catch (err) {
      console.error("Error assigning developers:", err)
    } finally {
      setAssigning(false)
    }
  }

  const groupDevelopersByRole = (developers) => {
    return developers.reduce((acc, dev) => {
      if (!acc[dev.role]) acc[dev.role] = []
      acc[dev.role].push(dev)
      return acc
    }, {})
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDeadlineInfo = (startDate, endDate) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    const totalDuration = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    const remaining = end.getTime() - now.getTime()

    const daysRemaining = Math.ceil(remaining / (1000 * 60 * 60 * 24))
    const progressPercentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100))

    let urgencyLevel, bgColor, textColor, borderColor, icon, message, pulseClass

    if (now > end) {
      urgencyLevel = "overdue"
      bgColor = "bg-gradient-to-r from-red-500 to-red-600"
      textColor = "text-white"
      borderColor = "border-red-300"
      icon = <AlertTriangle className="w-4 h-4" />
      message = `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? "s" : ""}`
      pulseClass = "animate-pulse"
    } else if (daysRemaining <= 3) {
      urgencyLevel = "critical"
      bgColor = "bg-gradient-to-r from-orange-500 to-red-500"
      textColor = "text-white"
      borderColor = "border-orange-300"
      icon = <Zap className="w-4 h-4" />
      message = `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} left!`
      pulseClass = "animate-pulse"
    } else if (daysRemaining <= 7) {
      urgencyLevel = "warning"
      bgColor = "bg-gradient-to-r from-yellow-400 to-orange-500"
      textColor = "text-white"
      borderColor = "border-yellow-300"
      icon = <Target className="w-4 h-4" />
      message = `${daysRemaining} days remaining`
      pulseClass = ""
    } else {
      urgencyLevel = "safe"
      bgColor = "bg-gradient-to-r from-emerald-500 to-teal-600"
      textColor = "text-white"
      borderColor = "border-emerald-300"
      icon = <CheckCircle className="w-4 h-4" />
      message = `${daysRemaining} days left`
      pulseClass = ""
    }

    return {
      urgencyLevel,
      bgColor,
      textColor,
      borderColor,
      icon,
      message,
      daysRemaining,
      progressPercentage,
      pulseClass,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    }
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

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading Projects...</h2>
            <p className="text-slate-600">Please wait while we fetch your assigned projects</p>
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
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Team Lead Dashboard
          </h1>
          <p className="text-slate-600">Manage your assigned projects and team members</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {projects.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No Projects Assigned</h3>
              <p className="text-slate-500">You don't have any projects assigned to you yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {projects.map((project) => {
                const isExpanded = expandedProjectId === project.project_id
                const team = projectDevelopers[project.project_id] || []
                const groupedTeam = groupDevelopersByRole(team)
                const projectStatus = getProjectStatus(project.start_date, project.end_date)
                const deadlineInfo = getDeadlineInfo(project.start_date, project.end_date)

                return (
                  <div key={project.project_id} className="transition-all duration-300">

                    <div
                      onClick={() => toggleProjectCard(project.project_id)}
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
                            <p className="text-sm text-slate-600 mb-2">Manager: {project.project_manager_name}</p>

                            <div className="flex items-center space-x-3">
                              <div
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${deadlineInfo.bgColor} ${deadlineInfo.textColor} shadow-lg ${deadlineInfo.pulseClass}`}
                              >
                                {deadlineInfo.icon}
                                <span className="ml-1">{deadlineInfo.message}</span>
                              </div>
                              <div className="text-xs text-slate-500">
                                {deadlineInfo.startDate} → {deadlineInfo.endDate}
                              </div>
                            </div>

                            {/* <div className="mt-2 w-48">
                              <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Progress</span>
                                <span>{Math.round(deadlineInfo.progressPercentage)}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-500 ${deadlineInfo.bgColor}`}
                                  style={{ width: `${deadlineInfo.progressPercentage}%` }}
                                ></div>
                              </div>
                            </div> */}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${projectStatus.color} mb-2`}
                            >
                              {getStatusIcon(projectStatus.status)}
                              <span className="ml-1 capitalize">{projectStatus.status}</span>
                            </span>
                            <div className="flex items-center space-x-1 text-xs text-slate-500">
                              <Users className="w-3 h-3" />
                              <span>{team.length} members</span>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-start">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setModalProjectId(project.project_id)
                            setSearchTerm("")
                          }}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center space-x-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Add Team Members</span>
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-6 bg-slate-50/30 border-t border-slate-100">
                        <div className="pt-6">
                          <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                              <Target className="w-5 h-5 text-emerald-600 mr-2" />
                              Project Timeline & Deadline
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <Calendar className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                                <p className="text-xs text-slate-500">Start Date</p>
                                <p className="font-semibold text-slate-800">{deadlineInfo.startDate}</p>
                              </div>
                              <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <div
                                  className={`w-6 h-6 mx-auto mb-1 flex items-center justify-center ${deadlineInfo.textColor === "text-white" ? "text-slate-600" : deadlineInfo.textColor}`}
                                >
                                  {deadlineInfo.icon}
                                </div>
                                <p className="text-xs text-slate-500">Status</p>
                                <p
                                  className={`font-semibold ${deadlineInfo.urgencyLevel === "overdue" ? "text-red-600" : deadlineInfo.urgencyLevel === "critical" ? "text-orange-600" : deadlineInfo.urgencyLevel === "warning" ? "text-yellow-600" : "text-emerald-600"}`}
                                >
                                  {deadlineInfo.message}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <Target className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                                <p className="text-xs text-slate-500">End Date</p>
                                <p className="font-semibold text-slate-800">{deadlineInfo.endDate}</p>
                              </div>
                            </div>

                            {/* <div className="mt-4">
                              <div className="flex justify-between text-sm text-slate-600 mb-2">
                                <span>Overall Progress</span>
                                <span className="font-semibold">
                                  {Math.round(deadlineInfo.progressPercentage)}% Complete
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                                <div
                                  className={`h-3 rounded-full transition-all duration-1000 ${deadlineInfo.bgColor} shadow-sm`}
                                  style={{ width: `${deadlineInfo.progressPercentage}%` }}
                                ></div>
                              </div>
                            </div> */}
                          </div>

                          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                              <Users className="w-5 h-5 text-emerald-600 mr-2" />
                              Current Team Members
                            </h3>
                            {team.length === 0 ? (
                              <div className="text-center py-8">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No team members assigned yet.</p>
                                <p className="text-sm text-slate-400">Click "Add Team Members" to get started.</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {Object.entries(groupedTeam).map(([role, devs]) => (
                                  <div key={role} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <h4 className="font-semibold text-slate-700 mb-3 capitalize flex items-center">
                                      <Briefcase className="w-4 h-4 text-slate-500 mr-2" />
                                      {role} ({devs.length})
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {devs.map((dev) => (
                                        <div
                                          key={dev.employee_id}
                                          className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-slate-100"
                                        >
                                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-slate-800">{dev.name}</p>
                                            <p className="text-xs text-slate-500">ID: {dev.employee_id}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
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

      {modalProjectId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden border border-white/20">

            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Assign Developers</h2>
                    <p className="text-sm text-slate-600">Select team members for this project</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalProjectId(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-6 border-b border-slate-100">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or role..."
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 max-h-80 overflow-y-auto">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No employees match your search.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEmployees.map((emp) => (
                    <label
                      key={emp.employee_id}
                      className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group"
                    >
                      {/* <input
                        type="checkbox"
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2"
                        checked={
                          selectedDevelopers[modalProjectId]?.some((dev) => dev.employee_id === emp.employee_id) ||
                          false
                        }
                        onChange={() => handleCheckboxChange(modalProjectId, emp)}
                      /> */}
                      {(() => {
                        const alreadyAssigned =
                          projectDevelopers[modalProjectId]?.some((dev) => dev.employee_id === emp.employee_id) || false

                        const isChecked =
                          selectedDevelopers[modalProjectId]?.some((dev) => dev.employee_id === emp.employee_id) || false

                        return (
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2"
                            checked={alreadyAssigned || isChecked}
                            disabled={alreadyAssigned}
                            onChange={() => !alreadyAssigned && handleCheckboxChange(modalProjectId, emp)}
                          />
                        )
                      })()}

                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 group-hover:text-emerald-600 transition-colors">
                          {emp.name}
                        </p>
                        <p className="text-xs text-slate-500">{emp.role}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <div className="flex space-x-3">
                <button
                  onClick={() => setModalProjectId(null)}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignDevelopers(modalProjectId)}
                  disabled={assigning}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {assigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Assign</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamLeadDashboard
