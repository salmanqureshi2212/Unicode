import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import api from '../services/api';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('api/users/leaderboard');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-white border-2 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Leaderboard</h1>
          <p className="text-gray-600">Celebrating our top contributors making a difference</p>
        </div>

        {/* Top 3 Podium */}
        {users.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 2nd Place */}
            <div className="order-2 md:order-1">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center border-2 border-gray-200">
                <div className="flex justify-center mb-4">
                  <Medal className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {users[1].username}
                </h3>
                <div className="text-2xl font-bold text-gray-600 mb-2">
                  {users[1].karma} points
                </div>
                <div className="text-sm text-gray-500">
                  {users[1].issuesReported} issues • {users[1].issuesResolved} resolved
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="order-1 md:order-2">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg shadow-lg p-6 text-center transform md:scale-105">
                <div className="flex justify-center mb-4">
                  <Trophy className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {users[0].username}
                </h3>
                <div className="text-3xl font-bold mb-2">
                  {users[0].karma} points
                </div>
                <div className="text-sm opacity-90">
                  {users[0].issuesReported} issues • {users[0].issuesResolved} resolved
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="order-3">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center border-2 border-amber-200">
                <div className="flex justify-center mb-4">
                  <Award className="h-12 w-12 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {users[2].username}
                </h3>
                <div className="text-2xl font-bold text-amber-600 mb-2">
                  {users[2].karma} points
                </div>
                <div className="text-sm text-gray-500">
                  {users[2].issuesReported} issues • {users[2].issuesResolved} resolved
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Full Rankings
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {users.map((user, index) => {
              const rank = index + 1;
              return (
                <div
                  key={user._id}
                  className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    rank <= 3 ? 'bg-gradient-to-r from-transparent to-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadge(rank)}`}>
                      {getRankIcon(rank)}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.username}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{user.issuesReported} issues reported</span>
                        <span>{user.issuesResolved} resolved</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary-600">
                      {user.karma} points
                    </div>
                    <div className="text-sm text-gray-500">
                      Total karma
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Karma System Info */}
        <div className="mt-8 bg-primary-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">
            How Karma Points Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-1">+10</div>
              <div className="text-sm text-primary-800">Report a valid issue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-1">+5</div>
              <div className="text-sm text-primary-800">Receive an upvote</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-1">+15</div>
              <div className="text-sm text-primary-800">Resolve an issue</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;