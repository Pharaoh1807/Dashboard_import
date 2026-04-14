import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, LogIn, UserPlus } from 'lucide-react';

export default function AuthScreen() {
    const { login, register } = useAuth();
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLoginView) {
                await login(username, password);
            } else {
                await register(username, password, email);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Import Dashboard</h1>
                    <p className="text-blue-100">
                        {isLoginView ? 'Sign in to access your data' : 'Create an account to get started'}
                    </p>
                </div>

                <div className="p-8 text-left">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLoginView && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <LogIn size={18} className="rotate-90" />
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors shadow-sm outline-none"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <User size={20} />
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors shadow-sm outline-none"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <Lock size={20} />
                                </span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors shadow-sm outline-none"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                            ) : isLoginView ? (
                                <>
                                    <LogIn size={20} className="mr-2" />
                                    Sign In
                                </>
                            ) : (
                                <>
                                    <UserPlus size={20} className="mr-2" />
                                    Sign Up
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLoginView(!isLoginView)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                        >
                            {isLoginView
                                ? "Don't have an account? Sign up"
                                : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
