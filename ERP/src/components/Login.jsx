import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, LogIn, CheckCircle, XCircle, User } from "lucide-react"
import api from '../api/api';

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [message, setMessage] = useState("")
    const [isError, setIsError] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/api/employees/login", formData);
            setMessage(response.data.message);
            setIsError(false);
            setTimeout(() => navigate("/dashboard"), 1000);
        } catch (error) {
            const msg = error.response?.data?.error || "Login failed.";
            setMessage(msg);
            setIsError(true);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-8">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md relative overflow-hidden">
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>

                <div className="relative z-10 text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-slate-600 text-sm font-medium">Sign in to your employee portal</p>
                </div>
                {message && (
                    <div
                        className={`mb-6 p-4 rounded-xl border-l-4 ${isError ? "bg-red-50 border-red-400 text-red-800" : "bg-emerald-50 border-emerald-400 text-emerald-800"
                            } shadow-sm`}
                    >
                        <div className="flex items-center">
                            {isError ? (
                                <XCircle className="flex-shrink-0 w-5 h-5 mr-3 text-red-400" />
                            ) : (
                                <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-emerald-400" />
                            )}
                            <span className="font-medium text-sm">{message}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                   
                    <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700 shadow-sm hover:shadow-md"
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700 shadow-sm hover:shadow-md"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-lg"
                    >
                        <span className="flex items-center justify-center">
                            <LogIn className="w-5 h-5 mr-2" />
                            Sign In
                        </span>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login
