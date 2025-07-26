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
  Edit3,
  Trash2,
  Save,
} from "lucide-react"

const ProjectProgress = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedProject, setExpandedProject] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [teamLeads, setTeamLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [updateFormData, setUpdateFormData] = useState({
    project_name: "",
    start_date: "",
    end_date: "",
    project_manager_name: "",
    team_lead_id: "",
  })

  const API = import.meta.env.VITE_API_BASE_URL

  const showAlertMessage = (message) => {
    setAlertMessage(message)
    setShowAlert(true)
  }

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
          }),
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
          proj.project_id === project_id ? { ...proj, developers: res.data.developers } : proj,
        ),
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

  const openUpdateModal = async (project) => {
    await fetchTeamLeads()
    setUpdateFormData({
      project_name: project.project_name,
      start_date: project.start_date.split("T")[0],
      end_date: project.end_date.split("T")[0],
      project_manager_name: project.project_manager_name,
      team_lead_id: project.team_lead?.employee_id || "",
    })
    setSelectedProjectId(project.project_id)
    setShowUpdateModal(true)
  }

  const assignTeamLead = async () => {
    if (!selectedLead) return
    try {
      await axios.post(`${API}/api/projects/assign-tl/${selectedProjectId}`, selectedLead)
      const res = await axios.get(`${API}/api/projects/team-lead/${selectedProjectId}`)
      const updatedLead = res.data.team_lead
      setProjects((prev) =>
        prev.map((p) => (p.project_id === selectedProjectId ? { ...p, team_lead: updatedLead } : p)),
      )
      setShowModal(false)
      setSelectedLead(null)
    } catch (err) {
      console.error("Error assigning team lead:", err)
    }
  }

  const updateProject = async () => {
    try {
      await axios.put(`${API}/api/projects/projects/${selectedProjectId}`, {
        project_name: updateFormData.project_name,
        start_date: updateFormData.start_date,
        end_date: updateFormData.end_date,
        project_manager_name: updateFormData.project_manager_name,
      })

      if (updateFormData.team_lead_id) {
        const selectedTeamLead = teamLeads.find((lead) => lead.employee_id === updateFormData.team_lead_id)
        if (selectedTeamLead) {
          await axios.post(`${API}/api/projects/assign-tl/${selectedProjectId}`, selectedTeamLead)
        }
      }

      const updatedProject = {
        ...updateFormData,
        team_lead: teamLeads.find((lead) => lead.employee_id === updateFormData.team_lead_id) || null,
      }

      setProjects((prev) => prev.map((p) => (p.project_id === selectedProjectId ? { ...p, ...updatedProject } : p)))

      setShowUpdateModal(false)
      showAlertMessage("Project updated successfully!")
    } catch (err) {
      console.error("Error updating project:", err)
      showAlertMessage("Failed to update project. Please try again.")
    }
  }

  const deleteProject = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    try {
      await axios.delete(`${API}/api/projects/projects/${projectId}`)

      setProjects((prev) => prev.filter((p) => p.project_id !== projectId))

      if (expandedProject === projectId) {
        setExpandedProject(null)
      }

      showAlertMessage("Project deleted successfully!")
    } catch (err) {
      console.error("Error deleting project:", err)
      showAlertMessage("Failed to delete project. Please try again.")
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

  const deleteDeveloper = async (projectId, employeeId) => {
    if (!confirm("Are you sure you want to remove this developer?")) return
    try {
      await axios.delete(`${API}/api/projects/projects/${projectId}/developers/${employeeId}`)
      setProjects((prev) =>
        prev.map((p) =>
          p.project_id === projectId
            ? {
                ...p,
                developers: p.developers.filter((dev) => dev.employee_id !== employeeId),
              }
            : p,
        ),
      )
    } catch (err) {
      console.error("Error deleting developer:", err)
      showAlertMessage("Failed to remove developer.")
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
      {showAlert && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <p className="text-slate-800 mb-4">{alertMessage}</p>
            <button
              onClick={() => setShowAlert(false)}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-red-500"
            >
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
            <button
              onClick={assignTeamLead}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg"
            >
              Assign
            </button>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl relative">
            <button
              onClick={() => setShowUpdateModal(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
              <Edit3 className="w-5 h-5 mr-2 text-emerald-600" />
              Update Project
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={updateFormData.project_name}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, project_name: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter project name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={updateFormData.start_date}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, start_date: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={updateFormData.end_date}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, end_date: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Manager Name</label>
                <input
                  type="text"
                  value={updateFormData.project_manager_name}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, project_manager_name: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter project manager name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Team Lead</label>
                <select
                  value={updateFormData.team_lead_id}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, team_lead_id: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select a Team Lead</option>
                  {teamLeads.map((lead) => (
                    <option key={lead.employee_id} value={lead.employee_id}>
                      {lead.name} ({lead.employee_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateProject}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Project
              </button>
            </div>
          </div>
        </div>
      )}

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
                      <div className="flex gap-3 pt-4 pb-4 border-b border-slate-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openUpdateModal(project)
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm flex items-center transition-colors"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Update Project
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteProject(project.project_id)
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm flex items-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Project
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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

                      <div className="mt-6 border-t pt-4">
                        <h4 className="text-slate-700 font-semibold mb-4 text-lg flex items-center">👨‍💻 Developers</h4>
                        {project.developers.length === 0 ? (
                          <p className="text-slate-500 text-sm italic">No developers yet.</p>
                        ) : (
                          <div className="space-y-6">
                            {Object.entries(
                              project.developers.reduce((acc, dev) => {
                                acc[dev.role] = acc[dev.role] || []
                                acc[dev.role].push(dev)
                                return acc
                              }, {}),
                            ).map(([role, list]) => (
                              <div key={role} className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                                <h5 className="text-emerald-700 font-semibold mb-2 capitalize text-base border-b pb-1 border-dashed border-emerald-200">
                                  {role} ({list.length})
                                </h5>
                                <ul className="list-disc ml-5 space-y-1 text-slate-700 text-sm">
                                  {list.map((d) => (
                                    <li
                                      key={d.employee_id}
                                      className="leading-snug flex justify-between items-center group"
                                    >
                                      <span>
                                        <span className="font-medium">{d.name}</span>{" "}
                                        <span className="text-slate-500">(ID: {d.employee_id})</span>
                                      </span>
                                      <button
                                        onClick={() => deleteDeveloper(project.project_id, d.employee_id)}
                                        className="text-red-500 hover:text-red-700 text-xs ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove Developer"
                                      >
                                        Remove
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
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
  )
}

export default ProjectProgress



// import { useEffect, useState } from "react"
// import axios from "axios"
// import {
//   Loader2,
//   UserPlus,
//   FolderOpen,
//   Calendar,
//   CheckCircle,
//   Clock,
//   Briefcase,
//   ChevronDown,
//   ChevronUp,
//   X,
// } from "lucide-react"

// const ProjectProgress = () => {
//   const [projects, setProjects] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [expandedProject, setExpandedProject] = useState(null)
//   const [showModal, setShowModal] = useState(false)
//   const [selectedProjectId, setSelectedProjectId] = useState(null)
//   const [teamLeads, setTeamLeads] = useState([])
//   const [selectedLead, setSelectedLead] = useState(null)

//   const API = import.meta.env.VITE_API_BASE_URL

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const res = await axios.get(`${API}/api/projects/projects`)
//         const enriched = await Promise.all(
//           res.data.projects.map(async (proj) => {
//             let lead = null
//             try {
//               const leadRes = await axios.get(`${API}/api/projects/projects/team-lead/${proj.project_id}`)
//               lead = leadRes.data.team_lead
//             } catch { }
//             return { ...proj, team_lead: lead, developers: [] }
//           })
//         )
//         setProjects(enriched)
//       } catch (err) {
//         console.error("Error fetching projects:", err)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchProjects()
//   }, [])

//   const fetchTeamLeads = async () => {
//     try {
//       const res = await axios.get(`${API}/api/projects/team-leads`)
//       setTeamLeads(res.data.leads)
//     } catch (err) {
//       console.error("Error fetching team leads:", err)
//     }
//   }

//   const fetchProjectDevelopers = async (project_id) => {
//     try {
//       const res = await axios.get(`${API}/api/projects/projects/${project_id}/developers`)
//       setProjects((prevProjects) =>
//         prevProjects.map((proj) =>
//           proj.project_id === project_id
//             ? { ...proj, developers: res.data.developers }
//             : proj
//         )
//       )
//     } catch (err) {
//       console.error("Error fetching developers:", err)
//     }
//   }


//   const openAssignModal = async (projectId) => {
//     await fetchTeamLeads()
//     setSelectedProjectId(projectId)
//     setShowModal(true)
//   }

//   const assignTeamLead = async () => {
//     if (!selectedLead) return
//     try {
//       await axios.post(`${API}/api/projects/assign-tl/${selectedProjectId}`, selectedLead)
//       const res = await axios.get(`${API}/api/projects/team-lead/${selectedProjectId}`)
//       const updatedLead = res.data.team_lead
//       setProjects((prev) =>
//         prev.map((p) =>
//           p.project_id === selectedProjectId ? { ...p, team_lead: updatedLead } : p
//         )
//       )
//       setShowModal(false)
//       setSelectedLead(null)
//     } catch (err) {
//       console.error("Error assigning team lead:", err)
//     }
//   }

//   const formatDate = (dateStr) =>
//     new Date(dateStr).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     })

//   const getProjectStatus = (start, end) => {
//     const now = new Date(),
//       s = new Date(start),
//       e = new Date(end)
//     if (now < s) return { status: "upcoming", color: "bg-blue-100 text-blue-800 border-blue-200" }
//     if (now > e) return { status: "completed", color: "bg-emerald-100 text-emerald-800 border-emerald-200" }
//     return { status: "active", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
//   }

//   const getStatusIcon = (status) => {
//     if (status === "completed") return <CheckCircle className="w-4 h-4" />
//     if (status === "active") return <Clock className="w-4 h-4" />
//     return <Calendar className="w-4 h-4" />
//   }

//   const toggleProjectExpansion = (id) => {
//     if (expandedProject === id) {
//       setExpandedProject(null)
//     } else {
//       setExpandedProject(id)
//       fetchProjectDevelopers(id)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="p-6 lg:p-8 flex items-center justify-center h-64">
//         <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
//         <span className="ml-4 text-slate-700 font-semibold">Loading Projects...</span>
//       </div>
//     )
//   }
//   const deleteDeveloper = async (projectId, employeeId) => {
//     if (!confirm("Are you sure you want to remove this developer?")) return;
//     try {
//       await axios.delete(`${API}/api/projects/projects/${projectId}/developers/${employeeId}`);
//       setProjects((prev) =>
//         prev.map((p) =>
//           p.project_id === projectId
//             ? {
//               ...p,
//               developers: p.developers.filter((dev) => dev.employee_id !== employeeId),
//             }
//             : p
//         )
//       );
//     } catch (err) {
//       console.error("Error deleting developer:", err);
//       alert("Failed to remove developer.");
//     }
//   };


//   return (
//     <div className="p-6 lg:p-8 max-w-6xl mx-auto">
//       {showModal && (
//         <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
//           <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative">
//             <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-slate-500 hover:text-red-500">
//               <X className="w-5 h-5" />
//             </button>
//             <h2 className="text-xl font-semibold text-slate-800 mb-4">Assign Team Lead</h2>
//             <select
//               className="w-full p-2 border border-slate-300 rounded-lg mb-4"
//               value={selectedLead?.employee_id || ""}
//               onChange={(e) => {
//                 const lead = teamLeads.find((tl) => tl.employee_id === e.target.value)
//                 setSelectedLead(lead || null)
//               }}
//             >
//               <option value="">Select a Team Lead</option>
//               {teamLeads.map((lead) => (
//                 <option key={lead.employee_id} value={lead.employee_id}>
//                   {lead.name} ({lead.employee_id})
//                 </option>
//               ))}
//             </select>
//             <button onClick={assignTeamLead} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg">
//               Assign
//             </button>
//           </div>
//         </div>
//       )}

//       {/* HEADER */}
//       <div className="text-center mb-8">
//         <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
//           <FolderOpen className="w-8 h-8 text-white" />
//         </div>
//         <h1 className="text-3xl font-bold text-slate-800">All Projects</h1>
//         <p className="text-slate-600">Manage and track all your projects in one place</p>
//       </div>

//       <div className="bg-white shadow-xl rounded-3xl overflow-hidden">
//         {projects.length === 0 ? (
//           <div className="p-12 text-center text-slate-500">
//             <FolderOpen className="w-12 h-12 mx-auto mb-4" />
//             No projects found.
//           </div>
//         ) : (
//           <div>
//             {projects.map((project) => {
//               const { status, color } = getProjectStatus(project.start_date, project.end_date)
//               const isExpanded = expandedProject === project.project_id
//               return (
//                 <div key={project.project_id} className="border-b">
//                   <div
//                     onClick={() => toggleProjectExpansion(project.project_id)}
//                     className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50"
//                   >
//                     <div className="flex items-center gap-4">
//                       <Briefcase className="text-emerald-600" />
//                       <div>
//                         <h3 className="font-semibold text-lg">{project.project_name}</h3>
//                         <p className="text-sm text-slate-600">Manager: {project.project_manager_name}</p>
//                         <p className="text-xs text-slate-400">ID: {project.project_id}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-4">
//                       <span className={`text-sm border rounded-full px-3 py-1 ${color}`}>
//                         {getStatusIcon(status)} <span className="capitalize ml-1">{status}</span>
//                       </span>
//                       {isExpanded ? <ChevronUp /> : <ChevronDown />}
//                     </div>
//                   </div>

//                   {isExpanded && (
//                     <div className="bg-slate-50 px-6 pb-6">
                  
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    
//                         <div>
//                           <label className="block text-slate-600 text-sm">Start Date</label>
//                           <p className="text-slate-800 font-medium">{formatDate(project.start_date)}</p>
//                         </div>
//                         <div>
//                           <label className="block text-slate-600 text-sm">End Date</label>
//                           <p className="text-slate-800 font-medium">{formatDate(project.end_date)}</p>
//                         </div>
//                         <div>
//                           <label className="block text-slate-600 text-sm">Project Manager</label>
//                           <p className="text-slate-800 font-medium">{project.project_manager_name}</p>
//                         </div>
//                         <div>
//                           <label className="block text-slate-600 text-sm">Team Lead</label>
//                           {project.team_lead ? (
//                             <p className="text-slate-800 font-medium">{project.team_lead.name}</p>
//                           ) : (
//                             <span className="text-slate-400 italic">Not assigned</span>
//                           )}
//                         </div>
//                       </div>

//                       {project.team_lead ? (
//                         <button
//                           disabled
//                           className="mt-6 bg-gray-300 text-gray-600 py-2 px-4 rounded-lg text-sm flex items-center cursor-not-allowed"
//                         >
//                           <CheckCircle className="w-4 h-4 mr-2" />
//                           Team Assigned!
//                         </button>
//                       ) : (
//                         <button
//                           onClick={() => openAssignModal(project.project_id)}
//                           className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm flex items-center"
//                         >
//                           <UserPlus className="w-4 h-4 mr-2" />
//                           Assign Team Lead to Project
//                         </button>
//                       )}

//                       <div className="mt-6 border-t pt-4">
//                         <h4 className="text-slate-700 font-semibold mb-4 text-lg flex items-center">
//                           👨‍💻 Developers
//                         </h4>

//                         {project.developers.length === 0 ? (
//                           <p className="text-slate-500 text-sm italic">No developers yet.</p>
//                         ) : (
//                           <div className="space-y-6">
//                             {Object.entries(
//                               project.developers.reduce((acc, dev) => {
//                                 acc[dev.role] = acc[dev.role] || []
//                                 acc[dev.role].push(dev)
//                                 return acc
//                               }, {})
//                             ).map(([role, list]) => (
//                               <div key={role} className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
//                                 <h5 className="text-emerald-700 font-semibold mb-2 capitalize text-base border-b pb-1 border-dashed border-emerald-200">
//                                   {role} ({list.length})
//                                 </h5>
//                                 <ul className="list-disc ml-5 space-y-1 text-slate-700 text-sm">
//                                   {list.map((d) => (
//                                     <li key={d.employee_id} className="leading-snug flex justify-between items-center group">
//                                       <span>
//                                         <span className="font-medium">{d.name}</span>{" "}
//                                         <span className="text-slate-500">(ID: {d.employee_id})</span>
//                                       </span>
//                                       <button
//                                         onClick={() => deleteDeveloper(project.project_id, d.employee_id)}
//                                         className="text-red-500 hover:text-red-700 text-xs ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
//                                         title="Remove Developer"
//                                       >
//                                         Remove
//                                       </button>
//                                     </li>
//                                   ))}

//                                 </ul>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>

//                     </div>
//                   )}
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default ProjectProgress
