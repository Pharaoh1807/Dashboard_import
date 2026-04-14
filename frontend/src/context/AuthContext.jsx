import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            delete axios.defaults.headers.common['Authorization'];
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user", error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const response = await axios.post('/api/auth/login', { username, password });
        const { access_token, user: userData } = response.data;
        localStorage.setItem('access_token', access_token);
        setToken(access_token);
        setUser(userData);
    };

    const register = async (username, password, email) => {
        await axios.post('/api/auth/register', { username, password, email });
        // Automatically login after successful registration
        await login(username, password);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setToken(null);
        setUser(null);
        
        // Clear Dashboard data locally
        localStorage.removeItem('dashboard_file_id');
        sessionStorage.clear();
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
