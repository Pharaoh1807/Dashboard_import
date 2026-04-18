import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Trash2, User, RefreshCw, AlertCircle, Mail,
    ShieldCheck, Check, X, Edit2, ShieldAlert,
    Search, LayoutGrid, FileText, ChevronDown,
    ChevronUp, CheckSquare, Square, UserPlus, Key, Lock
} from 'lucide-react';

export default function UserControl({ isDark }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ email: '', role: '', is_approved: false });
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [userFiles, setUserFiles] = useState({});
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [changingPasswordId, setChangingPasswordId] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/users');
            setUsers(response.data);
        } catch (err) {
            setError('Failed to load users. Please check your admin permissions.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserFiles = async (userId) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
            return;
        }

        setExpandedUserId(userId);
        if (!userFiles[userId]) {
            try {
                const response = await axios.get(`/api/admin/users/${userId}/files`);
                setUserFiles(prev => ({ ...prev, [userId]: response.data }));
            } catch (err) {
                console.error("Failed to fetch user files");
            }
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Delete this user and all associated data?')) return;
        try {
            await axios.delete(`/api/admin/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert(err.response?.data?.detail || 'Deletion failed');
        }
    };

    const toggleBulkSelection = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const selectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u.id));
        }
    };

    const handleBulkApprove = async () => {
        if (!window.confirm(`Approve ${selectedUsers.length} selected accounts?`)) return;
        try {
            for (const userId of selectedUsers) {
                const user = users.find(u => u.id === userId);
                await axios.put(`/api/admin/users/${userId}`, {
                    ...user,
                    is_approved: true
                });
            }
            fetchUsers();
            setSelectedUsers([]);
        } catch (err) {
            alert("Some bulk updates failed.");
        }
    };

    const startEditing = (user) => {
        setEditingId(user.id);
        setEditForm({ email: user.email || '', role: user.role, is_approved: user.is_approved });
    };

    const saveEdit = async (userId) => {
        try {
            const response = await axios.put(`/api/admin/users/${userId}`, editForm);
            setUsers(users.map(u => u.id === userId ? response.data : u));

            if (newPassword) {
                await axios.put(`/api/admin/users/${userId}/password`, { password: newPassword });
            }

            setEditingId(null);
            setNewPassword('');
            setChangingPasswordId(null);
        } catch (err) {
            alert(err.response?.data?.detail || 'Update failed');
        }
    };

    const handlePasswordChange = async (userId) => {
        if (!newPassword) {
            alert('Please enter a new password');
            return;
        }
        try {
            setLoading(true);
            await axios.put(`/api/admin/users/${userId}/password`, { password: newPassword });
            alert(`Password for ${users.find(u => u.id === userId)?.username} updated successfully`);
            setChangingPasswordId(null);
            setNewPassword('');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || 'Password update failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.is_approved).length,
        pending: users.filter(u => !u.is_approved).length
    }), [users]);

    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [users, searchTerm]);

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Header + Stats */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h2 className={`text-3xl font-black tracking-tight mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>User Management</h2>
                    <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Control identities and data access across the platform</p>
                </div>

                <div className="grid grid-cols-3 gap-4 lg:w-fit">
                    <StatCard label="Total" value={stats.total} icon={<LayoutGrid size={16} />} color={isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-700"} isDark={isDark} />
                    <StatCard label="Active" value={stats.active} icon={<ShieldCheck size={16} />} color={isDark ? "bg-green-500/10 text-green-400" : "bg-green-100 text-green-700"} isDark={isDark} />
                    <StatCard label="Pending" value={stats.pending} icon={<ShieldAlert size={16} />} color={isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-700"} isDark={isDark} />
                </div>
            </div>

            {/* Controls Bar */}
            <div className={`p-4 rounded-3xl shadow-sm border flex flex-col md:flex-row gap-4 justify-between items-center transition-all ${isDark ? 'bg-[#1e1e2f] border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="relative w-full md:w-96 group">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-600 group-focus-within:text-primary-500' : 'text-slate-300 group-focus-within:text-primary-500'}`} size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        autoComplete="off"
                        className={`w-full pl-12 pr-4 py-3 rounded-2xl border-transparent transition-all outline-none font-medium text-sm ${isDark ? 'bg-slate-900 text-white focus:bg-slate-800' : 'bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary-500/5'}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {selectedUsers.length > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right duration-300">
                            <span className="text-xs font-black text-primary-500 mr-2">{selectedUsers.length} SELECTED</span>
                            <button
                                onClick={handleBulkApprove}
                                className="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-green-700 transition-all flex items-center gap-2"
                            >
                                <Check size={14} /> Approve All
                            </button>
                        </div>
                    )}
                    <button
                        onClick={fetchUsers}
                        className={`p-3 rounded-2xl transition-all ${isDark ? 'bg-slate-900 text-slate-400 hover:bg-slate-800' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* User List Table */}
            <div className={`rounded-[2rem] shadow-xl border overflow-hidden transition-all ${isDark ? 'bg-[#1e1e2f] border-slate-800 shadow-black/20' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={`border-b italic transition-colors ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest w-10">
                                    <button onClick={selectAll} className={`${isDark ? 'text-slate-700 hover:text-primary-500' : 'text-slate-300 hover:text-primary-500'} transition-colors`}>
                                        {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </button>
                                </th>
                                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Identity Info</th>
                                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Status / Privilege</th>
                                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Activity</th>
                                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y transition-colors ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                            {filteredUsers.map((user, index) => {
                                const userId = user.id || user._id;
                                return (
                                    <React.Fragment key={userId || `user-${index}`}>
                                        <tr className={`transition-colors group ${expandedUserId === userId ? (isDark ? 'bg-slate-800/20' : 'bg-slate-50/30') : (isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50')}`}>
                                            <td className="p-6">
                                                <button
                                                    onClick={() => toggleBulkSelection(userId)}
                                                    className={`transition-colors ${selectedUsers.includes(userId) ? 'text-primary-500' : (isDark ? 'text-slate-800 group-hover:text-slate-700' : 'text-slate-200 group-hover:text-slate-300')}`}
                                                >
                                                    {selectedUsers.includes(userId) ? <CheckSquare size={18} /> : <Square size={18} />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isDark ? 'bg-slate-800 text-slate-500 border-slate-700 group-hover:bg-slate-700 group-hover:text-primary-500' : 'bg-slate-100 text-slate-400 border-slate-200 group-hover:bg-white group-hover:text-primary-500'}`}>
                                                        <User size={24} />
                                                    </div>
                                                    <div>
                                                        <span className={`font-bold text-sm block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{user.username}</span>
                                                        {editingId === userId ? (
                                                            <input
                                                                className={`mt-1 border rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
                                                                value={editForm.email}
                                                                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                                                placeholder="Email"
                                                            />
                                                        ) : (
                                                            <span className={`text-xs font-medium flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                <Mail size={12} /> {user.email || 'No email set'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2">
                                                    {editingId === userId ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setEditForm({ ...editForm, is_approved: !editForm.is_approved })}
                                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${editForm.is_approved ? 'bg-green-600 text-white' : (isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-600')}`}
                                                            >
                                                                {editForm.is_approved ? 'Active' : 'Inactive'}
                                                            </button>
                                                            <select
                                                                className={`border rounded-xl px-2 py-1.5 text-[10px] font-bold outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                                                                value={editForm.role}
                                                                onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                                            >
                                                                <option value="user">USER</option>
                                                                <option value="admin">ADMIN</option>
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.is_approved ? (isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700') : (isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700')}`}>
                                                                {user.is_approved ? 'Active' : 'Pending'}
                                                            </span>
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.role === 'admin' ? (isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-700') : (isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600')}`}>
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => fetchUserFiles(userId)}
                                                    className={`flex items-center gap-2 text-xs font-bold transition-colors px-3 py-2 rounded-xl ${isDark ? 'text-slate-400 hover:text-primary-400 bg-slate-800' : 'text-slate-500 hover:text-primary-600 bg-slate-50'}`}
                                                >
                                                    <FileText size={14} />
                                                    History
                                                    {expandedUserId === userId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {editingId === userId ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="password"
                                                                autoComplete="new-password"
                                                                className={`border rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500 w-32 shadow-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                                                                placeholder={`New pass for ${user.username}...`}
                                                                value={newPassword}
                                                                onChange={e => setNewPassword(e.target.value)}
                                                            />
                                                            <button onClick={() => saveEdit(userId)} className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Save All"><Check size={20} /></button>
                                                            <button onClick={() => { setEditingId(null); setNewPassword(''); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all" title="Cancel"><X size={20} /></button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-1">
                                                            {changingPasswordId === userId ? (
                                                                <div className={`flex items-center gap-2 p-1 pr-2 rounded-2xl animate-in zoom-in-95 duration-200 shadow-inner ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                                                    <input
                                                                        type="password"
                                                                        autoComplete="new-password"
                                                                        className={`border-none rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500 w-32 shadow-sm ${isDark ? 'bg-slate-900 text-white' : 'bg-white'}`}
                                                                        placeholder={`Password for ${user.username}...`}
                                                                        value={newPassword}
                                                                        onChange={e => setNewPassword(e.target.value)}
                                                                        autoFocus
                                                                    />
                                                                    <button onClick={(e) => { e.stopPropagation(); handlePasswordChange(userId); }} className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm"><Check size={14} /></button>
                                                                    <button onClick={(e) => { e.stopPropagation(); setChangingPasswordId(null); setNewPassword(''); }} className={`p-1.5 rounded-lg transition-all ${isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}><X size={14} /></button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={(e) => { e.stopPropagation(); setChangingPasswordId(userId); setNewPassword(''); }} className={`p-2 rounded-xl transition-all ${isDark ? 'text-slate-500 hover:text-amber-500 hover:bg-amber-500/10' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`} title="Change Password"><Key size={20} /></button>
                                                                    <button onClick={(e) => { e.stopPropagation(); startEditing(user); setNewPassword(''); }} className={`p-2 rounded-xl transition-all ${isDark ? 'text-slate-500 hover:text-primary-400 hover:bg-primary-400/10' : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50'}`} title="Edit Info"><Edit2 size={20} /></button>
                                                                    <button onClick={(e) => { e.stopPropagation(); deleteUser(userId); }} className={`p-2 rounded-xl transition-all ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-400/10' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`} title="Delete User"><Trash2 size={20} /></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded File View */}
                                        {expandedUserId === userId && (
                                            <tr>
                                                <td colSpan="5" className={`px-12 py-6 ${isDark ? 'bg-slate-900/30' : 'bg-slate-50/50'}`}>
                                                    <div className="animate-in slide-in-from-top duration-300">
                                                        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Files Uploaded by {user.username}</h4>
                                                        {!userFiles[userId] ? (
                                                            <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
                                                        ) : userFiles[userId].length === 0 ? (
                                                            <div className={`text-xs font-bold italic py-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>This user has not established any data sectors yet.</div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                {userFiles[userId].map(file => (
                                                                    <div key={file._id} className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between group/file ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                                            <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                                                                                <FileText size={16} />
                                                                            </div>
                                                                            <div className="overflow-hidden">
                                                                                <p className={`text-[11px] font-bold truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{file.filename}</p>
                                                                                <p className="text-[9px] font-mono text-slate-500">{new Date(file.upload_date).toLocaleDateString()}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`text-xs font-black transition-colors ${isDark ? 'text-slate-600 group-hover/file:text-primary-400' : 'text-slate-300 group-hover/file:text-primary-500'}`}>
                                                                            {file.sheet_count} Sheets
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-20 text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                            <Search className={isDark ? "text-slate-700" : "text-slate-300"} size={32} />
                        </div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>No users found</h3>
                        <p className="text-slate-400 text-sm">Your search criteria did not match any biological signatures.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color, isDark }) {
    return (
        <div className={`px-6 py-4 rounded-[1.5rem] shadow-sm border flex items-center gap-4 min-w-[140px] transition-colors ${isDark ? 'bg-[#1e1e2f] border-slate-800 shadow-black/20' : 'bg-white border-slate-100'}`}>
            <div className={`p-2.5 rounded-xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
                <p className={`text-xl font-black tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</p>
            </div>
        </div>
    );
}
