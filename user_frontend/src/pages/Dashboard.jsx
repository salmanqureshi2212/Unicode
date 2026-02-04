import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Trophy, TrendingUp, Calendar, Heart } from 'lucide-react';
import IssueCard from '../components/IssueCard';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [userIssues, setUserIssues] = useState([]);
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    totalUpvotes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [statsRes, issuesRes] = await Promise.all([
        api.get('api/users/stats'),
        api.get('api/issues')
      ]);

      setStats(statsRes.data.stats);
      
      // Filter user's issues
      const userIssuesData = issuesRes.data.filter(issue => issue.userId._id === user._id);
      setUserIssues(userIssuesData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (issueId) => {
    try {
      await api.post(`api/issues/${issueId}/upvote`);
      fetchUserData(); // Refresh data
    } catch (error) {
      console.error('Error upvoting issue:', error);
    }
  };

  // const handleResolve = async (issueId, formData) => {
  //   try {
  //     await api.post(`/issues/${issueId}/resolve`, formData, {
  //       headers: { 'Content-Type': 'multipart/form-data' }
  //     });
  //     fetchUserData(); // Refresh data
  //   } catch (error) {
  //     console.error('Error resolving issue:', error);
  //   }
  // };
   //NEW: Handle issue resolution
  const handleResolve = async (issueId, formData) => {
    try {
      await api.post(`api/issues/${issueId}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchUserData(); // Refresh data
    } catch (error) {
      console.error('Error resolving issue:', error);
      throw error;
    }
  };

  const statCards = [
    {
      title: 'Issues Reported',
      value: stats.totalIssues,
      icon: MapPin,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      title: 'Issues Resolved',
      value: stats.resolvedIssues,
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Upvotes',
      value: stats.totalUpvotes,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Karma Points',
      value: user?.karma || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your community impact dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className={`${stat.bgColor} rounded-full p-3 mr-4`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/report"
              className="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Plus className="h-8 w-8 text-primary-600" />
              <div>
                <h3 className="font-medium text-gray-900">Report New Issue</h3>
                <p className="text-sm text-gray-600">Help improve your community</p>
              </div>
            </Link>
            
            <Link
              to="/map"
              className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <MapPin className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-medium text-gray-900">Browse Issues</h3>
                <p className="text-sm text-gray-600">See nearby problems</p>
              </div>
            </Link>
            
            <Link
              to="/leaderboard"
              className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Trophy className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-medium text-gray-900">View Leaderboard</h3>
                <p className="text-sm text-gray-600">See top contributors</p>
              </div>
            </Link>
          </div>
        </div>

        {/* User's Issues */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Issues</h2>
            <Link
              to="/report"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Report Issue
            </Link>
          </div>

          {userIssues.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues yet</h3>
              <p className="text-gray-600 mb-4">
                Start making a difference by reporting your first issue
              </p>
              <Link
                to="/report"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Report Your First Issue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userIssues.map((issue) => (
                <IssueCard
                  key={issue._id}
                  issue={issue}
                  onUpvote={handleUpvote}
                  onResolve={handleResolve}
                  currentUser={user}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;