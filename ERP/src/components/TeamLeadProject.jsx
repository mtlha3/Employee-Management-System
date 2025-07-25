import React, { useEffect, useState } from "react";
import axios from "axios";

const TeamLeadDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [modalProjectId, setModalProjectId] = useState(null);
  const [selectedDevelopers, setSelectedDevelopers] = useState({});
  const [projectDevelopers, setProjectDevelopers] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

    const API = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API}/api/projects/team-lead/projects`, {
        withCredentials: true,
      });
      setProjects(res.data.projects);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API}/api/employees/all`);
      setEmployees(res.data.employees);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchDevelopersForProject = async (projectId) => {
    try {
      const res = await axios.get(`${API}/api/projects/projects/${projectId}/developers`);
      setProjectDevelopers((prev) => ({ ...prev, [projectId]: res.data.developers }));
    } catch (err) {
      console.error("Error fetching developers:", err);
    }
  };

  const toggleProjectCard = (projectId) => {
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null);
    } else {
      setExpandedProjectId(projectId);
      fetchDevelopersForProject(projectId);
    }
  };

  const handleCheckboxChange = (projectId, employee) => {
    const current = selectedDevelopers[projectId] || [];
    const updated = current.some(dev => dev.employee_id === employee.employee_id)
      ? current.filter(dev => dev.employee_id !== employee.employee_id)
      : [...current, employee];
    setSelectedDevelopers({ ...selectedDevelopers, [projectId]: updated });
  };

  const handleAssignDevelopers = async (projectId) => {
    const developers = selectedDevelopers[projectId] || [];
    try {
      await axios.put(
        `${API}/api/projects/${projectId}/assign-developers`,
        { developers },
        { withCredentials: true }
      );
      alert("Developers assigned successfully!");
      fetchProjects();
      fetchDevelopersForProject(projectId);
      setModalProjectId(null);
      setSelectedDevelopers((prev) => ({ ...prev, [projectId]: [] }));
    } catch (err) {
      console.error("Error assigning developers:", err);
    }
  };

  const groupDevelopersByRole = (developers) => {
    return developers.reduce((acc, dev) => {
      if (!acc[dev.role]) acc[dev.role] = [];
      acc[dev.role].push(dev);
      return acc;
    }, {});
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Assigned Projects</h1>

      {projects.length === 0 ? (
        <p>No projects assigned to you yet.</p>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => {
            const isExpanded = expandedProjectId === project.project_id;
            const team = projectDevelopers[project.project_id] || [];
            const groupedTeam = groupDevelopersByRole(team);

            return (
              <div
                key={project.project_id}
                className="border rounded-lg p-5 shadow bg-white"
              >
                <div
                  onClick={() => toggleProjectCard(project.project_id)}
                  className="hover:cursor-pointer"
                >
                  <p className="mb-1"><strong>Manager:</strong> {project.project_manager_name}</p>
                  <p className="mb-1"><strong>Project:</strong> {project.project_name}</p>
                  <p className="mb-2">
                    <strong>Duration:</strong> {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-3">
                  <button
                    onClick={() => {
                      setModalProjectId(project.project_id);
                      setSearchTerm("");
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add Team Members
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 bg-gray-100 p-4 rounded border">
                    <h3 className="font-bold mb-2">Current Team</h3>
                    {team.length === 0 ? (
                      <p className="text-sm text-gray-500">No developers assigned yet.</p>
                    ) : (
                      Object.entries(groupedTeam).map(([role, devs]) => (
                        <div key={role} className="mb-3">
                          <h4 className="font-semibold underline mb-1 capitalize">{role}</h4>
                          <ul className="list-disc list-inside text-sm ml-2">
                            {devs.map((dev) => (
                              <li key={dev.employee_id}>{dev.name} ({dev.employee_id})</li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalProjectId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Assign Developers</h2>

            <input
              type="text"
              placeholder="Search by name or role..."
              className="w-full border border-gray-300 px-3 py-1 mb-4 rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="overflow-y-auto max-h-60 pr-1">
              {filteredEmployees.length === 0 ? (
                <p>No employees match your search.</p>
              ) : (
                filteredEmployees.map((emp) => (
                  <label key={emp.employee_id} className="block mb-2 text-sm">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={
                        selectedDevelopers[modalProjectId]?.some(
                          (dev) => dev.employee_id === emp.employee_id
                        ) || false
                      }
                      onChange={() => handleCheckboxChange(modalProjectId, emp)}
                    />
                    {emp.name} - <span className="text-gray-600 italic">{emp.role}</span>
                  </label>
                ))
              )}
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setModalProjectId(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignDevelopers(modalProjectId)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeadDashboard;
