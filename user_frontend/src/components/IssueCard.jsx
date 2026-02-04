// import React from 'react';
// import { Heart, MapPin, Clock, User, CheckCircle } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';

// const IssueCard = ({ issue, onUpvote, currentUser, showDistance = false }) => {
//   const categoryColors = {
//     roads: 'bg-red-100 text-red-800',
//     lighting: 'bg-yellow-100 text-yellow-800',
//     sanitation: 'bg-green-100 text-green-800',
//     water: 'bg-blue-100 text-blue-800',
//     electricity: 'bg-purple-100 text-purple-800',
//     parks: 'bg-emerald-100 text-emerald-800',
//     other: 'bg-gray-100 text-gray-800'
//   };

//   const statusColors = {
//     open: 'bg-red-100 text-red-800',
//     in_progress: 'bg-yellow-100 text-yellow-800',
//     resolved: 'bg-green-100 text-green-800'
//   };

//   const hasUpvoted = currentUser && issue.upvotes.includes(currentUser.id);

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
//       <div className="relative">
//         <img 
//           src={`http://localhost:5000${issue.imageUrl}`} 
//           alt={issue.title}
//           className="w-full h-48 object-cover"
//         />
//         <div className="absolute top-2 right-2 flex gap-2">
//           <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[issue.category]}`}>
//             {issue.category}
//           </span>
//           <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
//             {issue.status.replace('_', ' ')}
//           </span>
//         </div>
//       </div>
      
//       <div className="p-4">
//         <h3 className="font-semibold text-gray-900 mb-2">{issue.title}</h3>
//         <p className="text-gray-600 text-sm mb-3 line-clamp-2">{issue.description}</p>
        
//         <div className="flex items-center text-sm text-gray-500 mb-3">
//           <MapPin className="h-4 w-4 mr-1" />
//           <span className="truncate">{issue.address}</span>
//         </div>
        
//         <div className="flex items-center justify-between">
//           <div className="flex items-center text-sm text-gray-500">
//             <User className="h-4 w-4 mr-1" />
//             <span>{issue.userId.username}</span>
//           </div>
          
//           <div className="flex items-center text-sm text-gray-500">
//             <Clock className="h-4 w-4 mr-1" />
//             <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
//           </div>
//         </div>
        
//         <div className="flex items-center justify-between mt-3 pt-3 border-t">
//           <button
//             onClick={() => onUpvote && onUpvote(issue._id)}
//             disabled={!currentUser}
//             className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
//               hasUpvoted 
//                 ? 'bg-red-100 text-red-800' 
//                 : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
//             } ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             <Heart className={`h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`} />
//             <span>{issue.upvotes.length}</span>
//           </button>
          
//           {issue.status === 'resolved' && (
//             <div className="flex items-center text-green-600">
//               <CheckCircle className="h-4 w-4 mr-1" />
//               <span className="text-sm">Resolved</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default IssueCard;
import React from 'react';
import { Heart, MapPin, Clock, User, CheckCircle, Upload } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';


//NEW: Add onResolve prop for handling issue resolution
const IssueCard = ({ issue, onUpvote, onResolve, currentUser, showDistance = false }) => {
  const [showResolveForm, setShowResolveForm] = React.useState(false);
  const [resolveData, setResolveData] = React.useState({
    description: '',
    proofImage: null
  });
  const [resolving, setResolving] = React.useState(false);

  const categoryColors = {
    roads: 'bg-red-100 text-red-800',
    lighting: 'bg-yellow-100 text-yellow-800',
    sanitation: 'bg-green-100 text-green-800',
    water: 'bg-blue-100 text-blue-800',
    electricity: 'bg-purple-100 text-purple-800',
    parks: 'bg-emerald-100 text-emerald-800',
    other: 'bg-gray-100 text-gray-800'
  };

  const statusColors = {
    open: 'bg-red-100 text-red-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800'
  };

  const hasUpvoted = currentUser && issue.upvotes.includes(currentUser.id);

  //NEW: Handle resolve form submission
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolveData.proofImage) {
      alert('Please upload a proof image');
      return;
    }

    setResolving(true);
    const formData = new FormData();
    formData.append('description', resolveData.description);
    formData.append('proofImage', resolveData.proofImage);

    try {
      await onResolve(issue._id, formData);
      setShowResolveForm(false);
      setResolveData({ description: '', proofImage: null });
    } catch (error) {
      console.error('Error resolving issue:', error);
    } finally {
      setResolving(false);
    }
  };

  //NEW: Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResolveData(prev => ({ ...prev, proofImage: file }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={`${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}${issue.imageUrl}`}
          alt={issue.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[issue.category]}`}>
            {issue.category}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
            {issue.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{issue.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{issue.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="truncate">{issue.address}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <User className="h-4 w-4 mr-1" />
            <span>{issue.userId.username}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
        
        {/*NEW: Show resolved proof if issue is resolved*/}
        {issue.status === 'resolved' && issue.resolvedProof && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Resolved by {issue.resolvedProof.resolvedBy?.username}
              </span>
            </div>
            {issue.resolvedProof.imageUrl && (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}${issue.imageUrl}`}
                alt="Resolution proof"
                className="w-full h-32 object-cover rounded-md mb-2"
              />
            )}
            {issue.resolvedProof.description && (
              <p className="text-sm text-green-700">{issue.resolvedProof.description}</p>
            )}
            <p className="text-xs text-green-600 mt-1">
              Resolved {formatDistanceToNow(new Date(issue.resolvedProof.resolvedAt), { addSuffix: true })}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <button
            onClick={() => onUpvote && onUpvote(issue._id)}
            disabled={!currentUser}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              hasUpvoted 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
            } ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className={`h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`} />
            <span>{issue.upvotes.length}</span>
          </button>
          
          {/*NEW: Show resolve button for open issues or resolved status*/}
          {issue.status === 'resolved' ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Resolved</span>
            </div>
          ) : currentUser && (
            <button
              onClick={() => setShowResolveForm(true)}
              className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Resolve</span>
            </button>
          )}
        </div>

        {/*NEW: Resolve form modal*/}
        {showResolveForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Resolve Issue</h3>
              <form onSubmit={handleResolveSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proof Photo *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={resolveData.description}
                    onChange={(e) => setResolveData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Describe how the issue was resolved..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={resolving}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {resolving ? (
                      <div className="spinner mr-2"></div>
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {resolving ? 'Resolving...' : 'Mark as Resolved'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResolveForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;