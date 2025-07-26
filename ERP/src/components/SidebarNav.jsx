import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  User,
  LogOut,
  UserPlus,
  Users,
  FileText,
  CheckSquare,
  MessageSquare,
  UserCheck,
  FolderPlus,
  BarChart2,
  Menu,
  X,
} from "lucide-react"

const SidebarNav = ({ role, onNavigate  }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/employees/logout`,
        {},
        {
          withCredentials: true,
        },
      )
    } catch (err) {
      console.warn("Logout failed:", err.message)
    }
    navigate("/")
  }

  const getIconForButton = (buttonText) => {
    if (buttonText.includes("Add Employee")) return UserPlus
    if (buttonText.includes("View/Edit")) return Users
    if (buttonText.includes("Employee Requests")) return FileText
    if (buttonText.includes("Tasks")) return CheckSquare
    if (buttonText.includes("Request to HR")) return MessageSquare
    if (buttonText.includes("Assign Tasks")) return UserCheck
    if (buttonText.includes("Create a Project")) return FolderPlus
    if (buttonText.includes("View Project Progress")) return BarChart2
    return User
  }

  const renderNavItems = () => {
    let buttons = []

    switch (role.toLowerCase()) {
      case "hr":
        buttons = [
          { text: "Add Employee", action: () => onNavigate("add-employee") },
          { text: "View/Edit Employees", action: () => onNavigate("view-edit") },
          { text: "Employee Requests", action: () => onNavigate("employee-requests") },
        ]
        break
      case "frontend developer":
      case "backend developer":
      case "full stack developer":
      case "devops":
        buttons = [
          { text: "Today's Tasks", action: () => onNavigate("dev-task") },
          { text: "Request to HR", action: () => onNavigate("request-hr"),  },
        ]
        break
      case "team lead":
        buttons = [
          { text: "My Projects", action: () => onNavigate("assign-task"), },
          { text: "Today's Tasks", action: () => onNavigate("assign-task-team"), },
          { text: "Request to HR", action: () => onNavigate("request-hr"),},
        ]
        break
      case "project manager":
        buttons = [
          { text: "Create a Project", action: () => onNavigate("create-project") },
          { text: "View Project Progress", action: () => onNavigate("progress-project") },
          { text: "Request to HR", action: () => onNavigate("request-hr"), },
        ]
        break
      default:
        return <p className="text-slate-600 text-center py-4">No navigation available</p>
    }

    return buttons.map((button, index) => {
      const Icon = getIconForButton(button.text)
      return (
        <button
          key={index}
          onClick={() => {
            button.action()
            setIsSidebarOpen(false)
          }}
          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all duration-200 font-medium text-left"
        >
          <Icon className="w-5 h-5" />
          <span>{button.text}</span>
        </button>
      )
    })
  }

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20 p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white/90 backdrop-blur-sm shadow-2xl border-r border-white/20 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
                  <p className="text-sm text-slate-600 capitalize">{role} Portal</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
          <div className="p-4 border-b border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">{renderNavItems()}</nav>

          <div className="p-4 border-t border-slate-100">
            <div className="text-center text-sm text-slate-500">
              <p>© 2024 Employee Portal</p>
              <p>Role: {role}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SidebarNav
