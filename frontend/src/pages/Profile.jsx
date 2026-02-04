// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { User, MapPin, Trophy, Calendar, Heart } from 'lucide-react';
// import IssueCard from '../components/IssueCard';
// import { useAuth } from '../contexts/AuthContext';
// import api from '../services/api';

// const Profile = () => {
//   const { id } = useParams();
//   const { user: currentUser } = useAuth();
//   const [profileData, setProfileData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchProfile();
//   }, [id]);

//   const fetchProfile = async () => {
//     try {
//       const response = await api.get(`/users/profile/${id}`);
//       setProfileData(response.data);
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpvote = async (issueId) => {
//     if (!currentUser) return;

//     try {
//       await api.post(`/issues/${issueId}/upvote`);
//       fetchProfile(); // Refresh data
//     } catch (error) {
//       console.error('Error upvoting issue:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="spinner"></div>
//       </div>
//     );
//   }

//   if (!profileData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
//           <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
//         </div>
//       </div>
//     );
//   }

//   const { user, issues } = profileData;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Profile Header */}
//         <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
//           <div className="flex items-center space-x-6">
//             <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
//               <User className="h-10 w-10 text-primary-600" />
//             </div>
            
//             <div className="flex-1">
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                 {user.username}
//               </h1>
//               <p className="text-gray-600 mb-4">
//                 Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
//                   month: 'long',
//                   year: 'numeric'
//                 })}
//               </p>
              
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-primary-600">
//                     {user.karma}
//                   </div>
//                   <div className="text-sm text-gray-600">Karma Points</div>
//                 </div>
                
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-blue-600">
//                     {user.issuesReported}
//                   </div>
//                   <div className="text-sm text-gray-600">Issues Reported</div>
//                 </div>
                
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-green-600">
//                     {user.issuesResolved}
//                   </div>
//                   <div className="text-sm text-gray-600">Issues Resolved</div>
//                 </div>
                
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-red-600">
//                     {issues.reduce((total, issue) => total + issue.upvotes.length, 0)}
//                   </div>
//                   <div className="text-sm text-gray-600">Total Upvotes</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* User's Issues */}
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-semibold text-gray-900">
//               {user.username}'s Issues ({issues.length})
//             </h2>
//           </div>

//           {issues.length === 0 ? (
//             <div className="text-center py-12">
//               <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 No issues reported yet
//               </h3>
//               <p className="text-gray-600">
//                 {user.username} hasn't reported any issues yet.
//               </p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {issues.map((issue) => (
//                 <IssueCard
//                   key={issue._id}
//                   issue={issue}
//                   onUpvote={handleUpvote}
//                   currentUser={currentUser}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, MapPin, Trophy, Calendar, Heart } from 'lucide-react';
import IssueCard from '../components/IssueCard';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/users/profile/${id}`);
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (issueId) => {
    if (!currentUser) return;

    try {
      await api.post(`/issues/${issueId}/upvote`);
      fetchProfile(); // Refresh data
    } catch (error) {
      console.error('Error upvoting issue:', error);
    }
  };

  //NEW: Handle issue resolution
  const handleResolve = async (issueId, formData) => {
    try {
      await api.post(`/issues/${issueId}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchProfile(); // Refresh data
    } catch (error) {
      console.error('Error resolving issue:', error);
      throw error;
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const { user, issues } = profileData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.username}
              </h1>
              <p className="text-gray-600 mb-4">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {user.karma}
                  </div>
                  <div className="text-sm text-gray-600">Karma Points</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.issuesReported}
                  </div>
                  <div className="text-sm text-gray-600">Issues Reported</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {user.issuesResolved}
                  </div>
                  <div className="text-sm text-gray-600">Issues Resolved</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {issues.reduce((total, issue) => total + issue.upvotes.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Upvotes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User's Issues */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {user.username}'s Issues ({issues.length})
            </h2>
          </div>

          {issues.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No issues reported yet
              </h3>
              <p className="text-gray-600">
                {user.username} hasn't reported any issues yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue) => (
                <IssueCard
                  key={issue._id}
                  issue={issue}
                  onUpvote={handleUpvote}
                  onResolve={handleResolve}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

