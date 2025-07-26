import { useEffect, useState } from "react"
import axios from "axios"
import {
  Loader2,
  UserPlus,
  FolderOpen,
  Calendar,
  CheckCircle,
  Clock,
  Briefcase,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react"

const ProjectProgress = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedProject, setExpandedProject] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [teamLeads, setTeamLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)

  const API = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API}/api/projects/projects`)
        const enriched = await Promise.all(
          res.data.projects.map(async (proj) => {
            let lead = null
            try {
              const leadRes = await axios.get(`${API}/api/projects/projects/team-lead/${proj.project_id}`)
              lead = leadRes.data.team_lead
            } catch {}
            return { ...proj, team_lead: lead, developers: [] }
          })
        )
        setProjects(enriched)
      } catch (err) {
        console.error("Error fetching projects:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const fetchTeamLeads = async () => {
    try {
      const res = await axios.get(`${API}/api/projects/team-leads`)
      setTeamLeads(res.data.leads)
    } catch (err) {
      console.error("Error fetching team leads:", err)
    }
  }

  const fetchProjectDevelopers = async (project_id) => {
  try {
    const res = await axios.get(`${API}/api/projects/projects/${project_id}/developers`)
    setProjects((prevProjects) =>
      prevProjects.map((proj) =>
        proj.project_id === project_id
          ? { ...proj, developers: res.data.developers }
          : proj
      )
    )
  } catch (err) {
    console.error("Error fetching developers:", err)
  }
}


  const openAssignModal = async (projectId) => {
    await fetchTeamLeads()
    setSelectedProjectId(projectId)
    setShowModal(true)
  }

  const assignTeamLead = async () => {
    if (!selectedLead) return
    try {
      await axios.post(`${API}/api/projects/assign-tl/${selectedProjectId}`, selectedLead)
      const res = await axios.get(`${API}/api/projects/team-lead/${selectedProjectId}`)
      const updatedLead = res.data.team_lead
      setProjects((prev) =>
        prev.map((p) =>
          p.project_id === selectedProjectId ? { ...p, team_lead: updatedLead } : p
        )
      )
      setShowModal(false)
      setSelectedLead(null)
    } catch (err) {
      console.error("Error assigning team lead:", err)
    }
  }

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const getProjectStatus = (start, end) => {
    const now = new Date(),
      s = new Date(start),
      e = new Date(end)
    if (now < s) return { status: "upcoming", color: "bg-blue-100 text-blue-800 border-blue-200" }
    if (now > e) return { status: "completed", color: "bg-emerald-100 text-emerald-800 border-emerald-200" }
    return { status: "active", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
  }

  const getStatusIcon = (status) => {
    if (status === "completed") return <CheckCircle className="w-4 h-4" />
    if (status === "active") return <Clock className="w-4 h-4" />
    return <Calendar className="w-4 h-4" />
  }

  const toggleProjectExpansion = (id) => {
    if (expandedProject === id) {
      setExpandedProject(null)
    } else {
      setExpandedProject(id)
      fetchProjectDevelopers(id)
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="ml-4 text-slate-700 font-semibold">Loading Projects...</span>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-slate-500 hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Assign Team Lead</h2>
            <select
              className="w-full p-2 border border-slate-300 rounded-lg mb-4"
              value={selectedLead?.employee_id || ""}
              onChange={(e) => {
                const lead = teamLeads.find((tl) => tl.employee_id === e.target.value)
                setSelectedLead(lead || null)
              }}
            >
              <option value="">Select a Team Lead</option>
              {teamLeads.map((lead) => (
                <option key={lead.employee_id} value={lead.employee_id}>
                  {lead.name} ({lead.employee_id})
                </option>
              ))}
            </select>
            <button onClick={assignTeamLead} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg">
              Assign
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
          <FolderOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">All Projects</h1>
        <p className="text-slate-600">Manage and track all your projects in one place</p>
      </div>

      <div className="bg-white shadow-xl rounded-3xl overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-4" />
            No projects found.
          </div>
        ) : (
          <div>
            {projects.map((project) => {
              const { status, color } = getProjectStatus(project.start_date, project.end_date)
              const isExpanded = expandedProject === project.project_id
              return (
                <div key={project.project_id} className="border-b">
                  <div
                    onClick={() => toggleProjectExpansion(project.project_id)}
                    className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <Briefcase className="text-emerald-600" />
                      <div>
                        <h3 className="font-semibold text-lg">{project.project_name}</h3>
                        <p className="text-sm text-slate-600">Manager: {project.project_manager_name}</p>
                        <p className="text-xs text-slate-400">ID: {project.project_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm border rounded-full px-3 py-1 ${color}`}>
                        {getStatusIcon(status)} <span className="capitalize ml-1">{status}</span>
                      </span>
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-slate-50 px-6 pb-6">
                      {/* Project grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {/* dates and manager/lead */}
                        <div>
                          <label className="block text-slate-600 text-sm">Start Date</label>
                          <p className="text-slate-800 font-medium">{formatDate(project.start_date)}</p>
                        </div>
                        <div>
                          <label className="block text-slate-600 text-sm">End Date</label>
                          <p className="text-slate-800 font-medium">{formatDate(project.end_date)}</p>
                        </div>
                        <div>
                          <label className="block text-slate-600 text-sm">Project Manager</label>
                          <p className="text-slate-800 font-medium">{project.project_manager_name}</p>
                        </div>
                        <div>
                          <label className="block text-slate-600 text-sm">Team Lead</label>
                          {project.team_lead ? (
                            <p className="text-slate-800 font-medium">{project.team_lead.name}</p>
                          ) : (
                            <span className="text-slate-400 italic">Not assigned</span>
                          )}
                        </div>
                      </div>

                      {/* assign button */}
                      {project.team_lead ? (
                        <button
                          disabled
                          className="mt-6 bg-gray-300 text-gray-600 py-2 px-4 rounded-lg text-sm flex items-center cursor-not-allowed"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Team Assigned!
                        </button>
                      ) : (
                        <button
                          onClick={() => openAssignModal(project.project_id)}
                          className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm flex items-center"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Assign Team Lead to Project
                        </button>
                      )}

                      {/* Developers */}
                      <div className="mt-6 border-t pt-4">
                        <h4 className="text-slate-700 font-semibold mb-2">Developers</h4>
                        {project.developers.length === 0 ? (
                          <p className="text-slate-500 text-sm italic">No developers yet.</p>
                        ) : (
                          Object.entries(project.developers.reduce((acc, dev) => {
                            acc[dev.role] = acc[dev.role] || []
                            acc[dev.role].push(dev)
                            return acc
                          }, {})).map(([role, list]) => (
                            <div key={role} className="mb-4">
                              <p className="font-medium">{role} ({list.length})</p>
                              <ul className="list-disc ml-6">
                                {list.map((d) => <li key={d.employee_id}>{d.name} (ID: {d.employee_id})</li>)}
                              </ul>
                            </div>
                          ))
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
  )
}

export default ProjectProgress
