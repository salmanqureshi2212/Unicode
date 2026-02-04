import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Trophy, TrendingUp, ArrowRight } from 'lucide-react';
import IssueCard from '../components/IssueCard';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const [recentIssues, setRecentIssues] = useState([]);
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [issuesRes, statsRes] = await Promise.all([
        api.get('api/issues?sortBy=newest'),
        api.get('api/users/leaderboard')
      ]);

      const issues = issuesRes.data;
      console.log(issues);
      setRecentIssues(issues.slice(0, 6));

      // Calculate stats
      const totalIssues = issues.length;
      const resolvedIssues = issues.filter(issue => issue.status === 'resolved').length;
      const activeUsers = statsRes.data.length;

      setStats({
        totalIssues,
        resolvedIssues,
        activeUsers
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (issueId) => {
    if (!user) return;

    try {
      await api.post(`api/issues/${issueId}/upvote`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error upvoting issue:', error);
    }
  };
  //NEW: Handle issue resolution
  const handleResolve = async (issueId, formData) => {
    try {
      await api.post(`api/issues/${issueId}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error resolving issue:', error);
      throw error;
    }
  };

  const features = [
    {
      icon: MapPin,
      title: 'Location-Based Reporting',
      description: 'Report issues with precise location data and help your community stay informed about local problems.'
    },
    {
      icon: Users,
      title: 'Community Engagement',
      description: 'Connect with neighbors, upvote important issues, and collaborate on solutions for your area.'
    },
    {
      icon: Trophy,
      title: 'Gamification',
      description: 'Earn karma points for contributions and compete on leaderboards while making your community better.'
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Updates',
      description: 'Get instant notifications about issue resolutions and track progress in your neighborhood.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Report. Connect. Improve.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Your voice matters in building better communities. Report local issues, 
              engage with neighbors, and track real-time progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/report"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Report an Issue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/map"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors inline-flex items-center justify-center"
              >
                View Map
                <MapPin className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stats.totalIssues}
              </div>
              <div className="text-gray-600">Total Issues Reported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.resolvedIssues}
              </div>
              <div className="text-gray-600">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.activeUsers}
              </div>
              <div className="text-gray-600">Active Community Members</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How CivicLink Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple, effective tools for community engagement and issue resolution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-primary-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Issues Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recent Issues</h2>
            <Link
              to="/map"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              View All Issues
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentIssues.map((issue) => (
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

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of community members working together to improve their neighborhoods.
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <Link
              to="/report"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              Report Your First Issue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;