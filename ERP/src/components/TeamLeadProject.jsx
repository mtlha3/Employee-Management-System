import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, Briefcase, Calendar, PlusCircle } from "lucide-react";

const TeamLeadProject = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/projects/team-lead/projects`, {
          withCredentials: true,
        });
        setProjects(res.data.projects);
      } catch (err) {
        console.error("Error fetching team lead projects:", err);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Assigned Projects</h1>

      {projects.length === 0 ? (
        <p>No projects assigned to you yet.</p>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <div
              key={project.project_id}
              className="border rounded-lg p-5 shadow hover:shadow-lg transition"
            >
              <div className="mb-2 text-gray-700">
                <User className="inline w-4 h-4 mr-2" />
                <strong>Project Manager:</strong> {project.project_manager_name}
              </div>

              <div className="mb-2 text-gray-700">
                <Briefcase className="inline w-4 h-4 mr-2" />
                <strong>Project:</strong> {project.project_name}
              </div>

              <div className="mb-2 text-gray-700">
                <Calendar className="inline w-4 h-4 mr-2" />
                <strong>Duration:</strong>{" "}
                {new Date(project.start_date).toLocaleDateString()} to{" "}
                {new Date(project.end_date).toLocaleDateString()}
              </div>

              <button
                onClick={() => alert("Open Create Team Modal")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Team
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamLeadProject;
