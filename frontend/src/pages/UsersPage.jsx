import React, { useState, useEffect } from 'react';
import { Users, Search, ChevronRight, User, Phone, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      // Filter to show only farmers
      const farmers = response.data.filter(user => user.role === 'farmer');
      setUsers(farmers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-green-700" />
          Farmer Management
        </h1>
        <p className="text-gray-600 mt-2">Manage and monitor registered farmers</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, username, location, or email..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-700 text-white p-4">
            <h2 className="text-xl font-semibold">
              Registered Farmers ({filteredUsers.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No farmers found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedUser?.id === user.id ? 'bg-green-50 border-l-4 border-green-700' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        user.isActive ? 'bg-green-600' : 'bg-gray-400'
                      }`}>
                        {user.fullName?.charAt(0) || user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{user.fullName || user.username}</h3>
                        <p className="text-sm text-gray-600">@{user.username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin size={14} className="text-gray-400" />
                          <p className="text-xs text-gray-500">{user.location || 'Location not set'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.isActive ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : (
                        <XCircle size={20} className="text-red-600" />
                      )}
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-700 text-white p-4">
            <h2 className="text-xl font-semibold">Farmer Details</h2>
          </div>
          
          {!showDetails || !selectedUser ? (
            <div className="p-8 text-center text-gray-500">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a farmer to view details</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white text-3xl font-bold ${
                  selectedUser.isActive ? 'bg-green-600' : 'bg-gray-400'
                }`}>
                  {selectedUser.fullName?.charAt(0) || selectedUser.username?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mt-4">
                  {selectedUser.fullName || selectedUser.username}
                </h3>
                <p className="text-gray-600">@{selectedUser.username}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    selectedUser.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.isActive ? (
                      <>
                        <CheckCircle size={16} />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Inactive
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User size={18} className="text-green-700" />
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Phone size={16} className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-medium text-gray-800">
                          {selectedUser.phoneNumber || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium text-gray-800">
                          {selectedUser.location || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-4 h-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-800">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar size={18} className="text-green-700" />
                    Account Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Role</span>
                      <span className="font-medium text-gray-800 capitalize">{selectedUser.role}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Registered On</span>
                      <span className="font-medium text-gray-800">
                        {formatDate(selectedUser.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Login</span>
                      <span className="font-medium text-gray-800">
                        {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Account Status</span>
                      <span className={`font-medium ${
                        selectedUser.isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button className="flex-1 bg-green-700 text-white py-2 px-4 rounded-lg hover:bg-green-800 transition-colors">
                    View Fields
                  </button>
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    View Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
