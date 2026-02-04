// import React, { useState, useEffect } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import { Icon } from 'leaflet';
// import { Filter, Search, MapPin } from 'lucide-react';
// import IssueCard from '../components/IssueCard';
// import { useAuth } from '../contexts/AuthContext';
// import api from '../services/api';

// // Fix for default markers
// delete Icon.Default.prototype._getIconUrl;
// Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// const MapView = () => {
//   const { user } = useAuth();
//   const [issues, setIssues] = useState([]);
//   const [filteredIssues, setFilteredIssues] = useState([]);
//   const [selectedIssue, setSelectedIssue] = useState(null);
//   const [userLocation, setUserLocation] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     category: 'all',
//     status: 'all',
//     sortBy: 'newest'
//   });
//   const [searchTerm, setSearchTerm] = useState('');

//   const categories = [
//     { value: 'all', label: 'All Categories' },
//     { value: 'roads', label: 'Roads & Transportation' },
//     { value: 'lighting', label: 'Street Lighting' },
//     { value: 'sanitation', label: 'Waste & Sanitation' },
//     { value: 'water', label: 'Water Supply' },
//     { value: 'electricity', label: 'Electricity' },
//     { value: 'parks', label: 'Parks & Recreation' },
//     { value: 'other', label: 'Other' }
//   ];

//   const statusOptions = [
//     { value: 'all', label: 'All Status' },
//     { value: 'open', label: 'Open' },
//     { value: 'in_progress', label: 'In Progress' },
//     { value: 'resolved', label: 'Resolved' }
//   ];

//   useEffect(() => {
//     getCurrentLocation();
//     fetchIssues();
//   }, []);

//   useEffect(() => {
//     filterIssues();
//   }, [issues, filters, searchTerm]);

//   const getCurrentLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude
//           });
//         },
//         (error) => {
//           console.error('Error getting location:', error);
//           // Default to New York City if location is not available
//           setUserLocation({ lat: 40.7128, lng: -74.0060 });
//         }
//       );
//     } else {
//       setUserLocation({ lat: 40.7128, lng: -74.0060 });
//     }
//   };

//   const fetchIssues = async () => {
//     try {
//       const response = await api.get('/issues');
//       setIssues(response.data);
//     } catch (error) {
//       console.error('Error fetching issues:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterIssues = () => {
//     let filtered = [...issues];

//     // Filter by category
//     if (filters.category !== 'all') {
//       filtered = filtered.filter(issue => issue.category === filters.category);
//     }

//     // Filter by status
//     if (filters.status !== 'all') {
//       filtered = filtered.filter(issue => issue.status === filters.status);
//     }

//     // Filter by search term
//     if (searchTerm) {
//       filtered = filtered.filter(issue => 
//         issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         issue.address.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Sort
//     switch (filters.sortBy) {
//       case 'newest':
//         filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//         break;
//       case 'oldest':
//         filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
//         break;
//       case 'upvotes':
//         filtered.sort((a, b) => b.upvotes.length - a.upvotes.length);
//         break;
//       default:
//         break;
//     }

//     setFilteredIssues(filtered);
//   };

//   const handleUpvote = async (issueId) => {
//     if (!user) return;

//     try {
//       await api.post(`/issues/${issueId}/upvote`);
//       fetchIssues();
//     } catch (error) {
//       console.error('Error upvoting issue:', error);
//     }
//   };

//   const createMarkerIcon = (category, status) => {
//     const color = status === 'resolved' ? '#10B981' : 
//                   status === 'in_progress' ? '#F59E0B' : '#EF4444';
    
//     return new Icon({
//       iconUrl: `data:image/svg+xml;base64,${btoa(`
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24">
//           <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
//         </svg>
//       `)}`,
//       iconSize: [30, 30],
//       iconAnchor: [15, 30],
//       popupAnchor: [0, -30]
//     });
//   };

//   if (loading || !userLocation) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="spinner"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Issue Map</h1>
//           <p className="text-gray-600">Explore and interact with community issues in your area</p>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex flex-wrap gap-4 items-center">
//             <div className="flex-1 min-w-64">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search issues..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                 />
//               </div>
//             </div>
            
//             <select
//               value={filters.category}
//               onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
//               className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//             >
//               {categories.map(cat => (
//                 <option key={cat.value} value={cat.value}>{cat.label}</option>
//               ))}
//             </select>
            
//             <select
//               value={filters.status}
//               onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
//               className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//             >
//               {statusOptions.map(status => (
//                 <option key={status.value} value={status.value}>{status.label}</option>
//               ))}
//             </select>
            
//             <select
//               value={filters.sortBy}
//               onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
//               className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//             >
//               <option value="newest">Newest First</option>
//               <option value="oldest">Oldest First</option>
//               <option value="upvotes">Most Upvoted</option>
//             </select>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Map */}
//           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//             <div className="h-96 lg:h-[600px]">
//               <MapContainer
//                 center={[userLocation.lat, userLocation.lng]}
//                 zoom={13}
//                 style={{ height: '100%', width: '100%' }}
//               >
//                 <TileLayer
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                 />
                
//                 {filteredIssues.map((issue) => (
//                   <Marker
//                     key={issue._id}
//                     position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
//                     icon={createMarkerIcon(issue.category, issue.status)}
//                     eventHandlers={{
//                       click: () => setSelectedIssue(issue)
//                     }}
//                   >
//                     <Popup>
//                       <div className="w-64">
//                         <img
//                           src={`http://localhost:5000${issue.imageUrl}`}
//                           alt={issue.title}
//                           className="w-full h-32 object-cover rounded-md mb-2"
//                         />
//                         <h3 className="font-semibold text-sm mb-1">{issue.title}</h3>
//                         <p className="text-xs text-gray-600 mb-2">{issue.description}</p>
//                         <div className="flex items-center justify-between text-xs text-gray-500">
//                           <span>{issue.category}</span>
//                           <span>{issue.status}</span>
//                         </div>
//                       </div>
//                     </Popup>
//                   </Marker>
//                 ))}
//               </MapContainer>
//             </div>
//           </div>

//           {/* Issue List */}
//           <div className="bg-white rounded-lg shadow-sm">
//             <div className="p-6 border-b">
//               <h2 className="text-xl font-semibold text-gray-900">
//                 Issues ({filteredIssues.length})
//               </h2>
//             </div>
            
//             <div className="max-h-[600px] overflow-y-auto p-6">
//               {filteredIssues.length === 0 ? (
//                 <div className="text-center py-8">
//                   <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                   <p className="text-gray-500">No issues found matching your criteria</p>
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   {filteredIssues.map((issue) => (
//                     <div
//                       key={issue._id}
//                       className={`cursor-pointer transition-all ${
//                         selectedIssue?._id === issue._id ? 'ring-2 ring-primary-500' : ''
//                       }`}
//                       onClick={() => setSelectedIssue(issue)}
//                     >
//                       <IssueCard
//                         issue={issue}
//                         onUpvote={handleUpvote}
//                         currentUser={user}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MapView;
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Filter, Search, MapPin } from 'lucide-react';
import IssueCard from '../components/IssueCard';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Fix for default markers
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    sortBy: 'newest'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'roads', label: 'Roads & Transportation' },
    { value: 'lighting', label: 'Street Lighting' },
    { value: 'sanitation', label: 'Waste & Sanitation' },
    { value: 'water', label: 'Water Supply' },
    { value: 'electricity', label: 'Electricity' },
    { value: 'parks', label: 'Parks & Recreation' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' }
  ];

  useEffect(() => {
    getCurrentLocation();
    fetchIssues();
  }, []);

  useEffect(() => {
    filterIssues();
  }, [issues, filters, searchTerm]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to New York City if location is not available
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    } else {
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await api.get('api/issues');
      setIssues(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIssues = () => {
    let filtered = [...issues];

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(issue => issue.category === filters.category);
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'upvotes':
        filtered.sort((a, b) => b.upvotes.length - a.upvotes.length);
        break;
      default:
        break;
    }

    setFilteredIssues(filtered);
  };

  const handleUpvote = async (issueId) => {
    if (!user) return;

    try {
      await api.post(`api/issues/${issueId}/upvote`);
      fetchIssues();
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
      fetchIssues(); // Refresh data
    } catch (error) {
      console.error('Error resolving issue:', error);
      throw error;
    }
  };

  //NEW: Create marker icon with green color for resolved issues
  const createMarkerIcon = (category, status) => {
    const color = status === 'resolved' ? '#10B981' : 
                  status === 'in_progress' ? '#F59E0B' : '#EF4444';
    
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `)}`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
  };

  if (loading || !userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Issue Map</h1>
          <p className="text-gray-600">Explore and interact with community issues in your area</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="upvotes">Most Upvoted</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-96 lg:h-[600px]">
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {filteredIssues.map((issue) => (
                  <Marker
                    key={issue._id}
                    position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                    icon={createMarkerIcon(issue.category, issue.status)}
                    eventHandlers={{
                      click: () => setSelectedIssue(issue)
                    }}
                  >
                    <Popup>
                      <div className="w-64">
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}${issue.imageUrl}`}
                          alt={issue.title}
                          className="w-full h-32 object-cover rounded-md mb-2"
                        />
                        <h3 className="font-semibold text-sm mb-1">{issue.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">{issue.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{issue.category}</span>
                          <span>{issue.status}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Issue List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Issues ({filteredIssues.length})
              </h2>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto p-6">
              {filteredIssues.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No issues found matching your criteria</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredIssues.map((issue) => (
                    <div
                      key={issue._id}
                      className={`cursor-pointer transition-all ${
                        selectedIssue?._id === issue._id ? 'ring-2 ring-primary-500' : ''
                      }`}
                      onClick={() => setSelectedIssue(issue)}
                    >
                      <IssueCard
                        issue={issue}
                        onUpvote={handleUpvote}
                        onResolve={handleResolve}
                        currentUser={user}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;