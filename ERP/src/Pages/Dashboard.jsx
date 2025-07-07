import { useEffect, useState } from "react"
import axios from "axios"
import SidebarNav from "../components/SidebarNav"
import { useNavigate } from "react-router-dom"
import { User } from "lucide-react"
import RequestToHR from "../components/RequestToHR"
import HRRequestResponse from "../components/HR_request_response"
import Signup from "../components/Signup"
import ViewEditEmployees from "../components/ViewEditEmployees"

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [activeSection, setActiveSection] = useState("home")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/employees/me`, {
          withCredentials: true,
        })
        setUser(res.data.user)
      } catch (err) {
        console.error("Not authenticated:", err.message)
        navigate("/")
      }
    }

    fetchUser()
  }, [navigate])

  const welcomeMessage = () => {
    if (!user) return ""
    const role = user.role.toLowerCase()
    if (role === "hr") return "Welcome to HR Portal"
    if (role.includes("developer")) return "Welcome Developer"
    if (role === "team lead") return "Welcome Team Lead"
    if (role === "project manager") return "Welcome Project Manager"
    return "Welcome to the Dashboard"
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg animate-pulse">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading...</h2>
          <p className="text-slate-600">Please wait while we load your dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
      <SidebarNav role={user.role} onNavigate={setActiveSection} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <main className="flex-1 p-6 lg:p-8">
          {activeSection === "request-hr" && <RequestToHR />}
          {activeSection === "employee-requests" && <HRRequestResponse />}
          {activeSection === "add-employee" && <Signup />}
          {activeSection === "view-edit" && <ViewEditEmployees  />}
          {activeSection === "home" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl mb-6 shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
                  {welcomeMessage()}
                </h1>
                <p className="text-slate-600 text-lg mb-2">Hello, {user.name}!</p>
                <div className="mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                  <p className="text-slate-600">Select an option from the sidebar to get started with your tasks.</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default Dashboard
