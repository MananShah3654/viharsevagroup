import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../App';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const translations = {
  en: {
    dashboard: 'Admin Dashboard',
    vihars: 'Vihars',
    users: 'Users',
    reports: 'Reports',
    createVihar: 'Create New Vihar',
    updateVihar: 'Update Vihar',
    editVihar: 'Edit',
    copyToWhatsApp: 'Copy to WhatsApp',
    routeNo: 'Route Number',
    gujaratiDate: 'Gujarati Calendar Date',
    sahebjiName: 'Bhagvant Name',
    viharDate: 'Vihar Date',
    viharTime: 'Vihar Time',
    sadhuBhagvant: 'Sadhu Bhagvant Thana',
    sadhvijiBhagvant: 'Sadhviji Bhagvant Thana',
    wheelchair: 'Wheelchair Required',
    luggage: 'Luggage',
    dori: 'Dori',
    carRequired: 'Car Required',
    activa: 'Activa',
    fromUpashray: 'Vihar Starting Point',
    toUpashray: 'Vihar Ending Point',
    approxKms: 'Approx KMs',
    name: 'Name',
    create: 'Create',
    cancel: 'Cancel',
    allVihars: 'All Vihars',
    allUsers: 'All Users',
    addUser: 'Add User',
    phone: 'Phone',
    age: 'Age',
    area: 'Area',
    role: 'Role',
    actions: 'Actions',
    makeAdmin: 'Make Admin',
    makeUser: 'Make User',
    edit: 'Edit',
    delete: 'Delete',
    update: 'Update',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    totalVihars: 'Total Vihars',
    totalKms: 'Total KMs Covered',
    downloadPDF: 'Download PDF',
    downloadExcel: 'Download Excel',
    deleteVihar: 'Delete',
    confirmDelete: 'Are you sure you want to delete this vihar?',
    viharDeleted: 'Vihar deleted successfully!',
    userWiseReport: 'User-wise Report',
    selectUser: 'Select User',
    allUsers: 'All Users',
    viharCreated: 'Vihar created successfully!',
    userCreated: 'User created successfully!',
    roleUpdated: 'Role updated successfully!',
    logout: 'Logout',
    previewParticipants: 'Preview Participants',
    assignUsers: 'Assign Users',
    participants: 'Participants',
    optedIn: 'Opted In',
    optedOut: 'Opted Out',
    totalParticipants: 'Total Participants',
    assignUsersToVihar: 'Assign Users to Vihar',
    selectUsers: 'Select Users',
    assign: 'Assign',
    close: 'Close',
    noParticipants: 'No participants yet',
    usersAssigned: 'Users assigned successfully!',
    gridView: 'Grid View',
    listView: 'List View',
    showTop10: 'Show Top 10',
    showAll: 'Show All',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    calculateDistance: 'Calculate',
    calculating: 'Calculating...',
    calculateDistanceHint: 'Enter both locations and click Calculate to auto-fill distance',
    home: 'Home',
    totalUsers: 'Total Users',
    totalVihars: 'Total Vihars',
    totalKmsCovered: 'Total KMs Covered',
    activeParticipants: 'Active Participants',
    viewDetails: 'View Details',
    viharsThisMonth: 'Vihars This Month',
    usersThisMonth: 'New Users This Month',
    participationRate: 'Participation Rate',
    topRoutes: 'Top Routes',
    recentVihars: 'Recent Vihars',
    userGrowth: 'User Growth',
    viharTrends: 'Vihar Trends',
  },
  gu: {
    dashboard: 'એડમિન ડેશબોર્ડ',
    home: 'હોમ',
    vihars: 'વિહારો',
    users: 'યુઝર્સ',
    reports: 'રિપોર્ટ્સ',
    totalUsers: 'કુલ યુઝર્સ',
    totalVihars: 'કુલ વિહારો',
    totalKmsCovered: 'કુલ કિ.મી. કવર',
    activeParticipants: 'સક્રિય સહભાગીઓ',
    viewDetails: 'વિગતો જુઓ',
    viharsThisMonth: 'આ મહિનાના વિહારો',
    usersThisMonth: 'આ મહિનાના નવા યુઝર્સ',
    participationRate: 'સહભાગિતા દર',
    topRoutes: 'ટોપ રૂટ્સ',
    recentVihars: 'તાજેતરના વિહારો',
    userGrowth: 'યુઝર વૃદ્ધિ',
    viharTrends: 'વિહાર ટ્રેન્ડ્સ',
    createVihar: 'નવો વિહાર બનાવો',
    updateVihar: 'વિહાર અપડેટ કરો',
    editVihar: 'સંપાદન કરો',
    copyToWhatsApp: 'WhatsApp માં કોપી કરો',
    routeNo: 'રૂટ નંબર',
    gujaratiDate: 'ગુજરાતી કેલેન્ડર તારીખ',
    sahebjiName: 'ભગવંત નામ',
    viharDate: 'વિહાર તારીખ',
    viharTime: 'વિહાર સમય',
    sadhuBhagvant: 'સાધુ ભગવંત થાના',
    sadhvijiBhagvant: 'સાધ્વીજી ભગવંત થાના',
    wheelchair: 'વ્હીલચેર જરૂરી',
    luggage: 'સામાન',
    dori: 'ડોરી',
    carRequired: 'કાર જરૂરી',
    activa: 'એકટીવા જરૂરી',
    fromUpashray: 'વિહાર ની શરૂઆત',
    toUpashray: 'વિહાર ની પૂર્ણાહુતિ',
    approxKms: 'અંદાજિત કિ.મી.',
    name: 'નામ',
    create: 'બનાવો',
    cancel: 'રદ કરો',
    allVihars: 'તમામ વિહારો',
    allUsers: 'તમામ યુઝર્સ',
    addUser: 'યુઝર ઉમેરો',
    phone: 'ફોન',
    age: 'ઉંમર',
    area: 'વિસ્તાર',
    role: 'ભૂમિકા',
    actions: 'ક્રિયાઓ',
    makeAdmin: 'એડમિન બનાવો',
    makeUser: 'યુઝર બનાવો',
    edit: 'સંપાદન કરો',
    delete: 'કાઢી નાખો',
    update: 'અપડેટ કરો',
    weekly: 'સાપ્તાહિક',
    monthly: 'માસિક',
    yearly: 'વાર્ષિક',
    totalVihars: 'કુલ વિહારો',
    totalKms: 'કુલ કિ.મી. કવર કર્યા',
    downloadPDF: 'PDF ડાઉનલોડ',
    downloadExcel: 'Excel ડાઉનલોડ',
    deleteVihar: 'ડિલીટ',
    confirmDelete: 'શું તમે આ વિહારને ડિલીટ કરવા માંગો છો?',
    viharDeleted: 'વિહાર ડિલીટ થયો!',
    userWiseReport: 'યુઝર પ્રમાણે રિપોર્ટ',
    selectUser: 'યુઝર પસંદ કરો',
    allUsers: 'તમામ યુઝર્સ',
    viharCreated: 'વિહાર સફળતાપૂર્વક બનાવ્યો!',
    userCreated: 'યુઝર સફળતાપૂર્વક બનાવ્યો!',
    roleUpdated: 'ભૂમિકા અપડેટ થઈ!',
    logout: 'લોગઆઉટ',
    previewParticipants: 'સહભાગીઓનું પૂર્વાવલોકન',
    assignUsers: 'યુઝર્સ સોંપો',
    participants: 'સહભાગીઓ',
    optedIn: 'ઓપ્ટ ઇન',
    optedOut: 'ઓપ્ટ આઉટ',
    totalParticipants: 'કુલ સહભાગીઓ',
    assignUsersToVihar: 'વિહારમાં યુઝર્સ સોંપો',
    selectUsers: 'યુઝર્સ પસંદ કરો',
    assign: 'સોંપો',
    close: 'બંધ કરો',
    noParticipants: 'હજુ સુધી કોઈ સહભાગી નથી',
    usersAssigned: 'યુઝર્સ સફળતાપૂર્વક સોંપ્યા!',
    gridView: 'ગ્રિડ વ્યૂ',
    listView: 'લિસ્ટ વ્યૂ',
    filterByDate: 'તારીખ દ્વારા ફિલ્ટર કરો',
    showTop10: 'ટોપ 10 બતાવો',
    showAll: 'બધું બતાવો',
    noViharsFound: 'પસંદ કરેલી તારીખ માટે કોઈ વિહાર મળ્યો નથી',
    previous: 'પહેલાં',
    next: 'આગળ',
    page: 'પાનું',
    of: 'માંથી',
    calculateDistance: 'ગણતરી કરો',
    calculating: 'ગણતરી કરી રહ્યા છીએ...',
    calculateDistanceHint: 'બંને સ્થાન દાખલ કરો અને રોડ અંતર મેળવવા માટે ગણતરી કરો પર ક્લિક કરો ',
    home: 'હોમ',
    totalUsers: 'કુલ યુઝર્સ',
    totalVihars: 'કુલ વિહારો',
    totalKmsCovered: 'કુલ કિ.મી. કવર',
    activeParticipants: 'સક્રિય સહભાગીઓ',
    viewDetails: 'વિગતો જુઓ',
    viharsThisMonth: 'આ મહિનાના વિહારો',
    usersThisMonth: 'આ મહિનાના નવા યુઝર્સ',
    participationRate: 'સહભાગિતા દર',
    topRoutes: 'ટોપ રૂટ્સ',
    recentVihars: 'તાજેતરના વિહારો',
    userGrowth: 'યુઝર વૃદ્ધિ',
    viharTrends: 'વિહાર ટ્રેન્ડ્સ',
  },
};

const AdminDashboard = ({ user, onLogout, language, setLanguage }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateVihar, setShowCreateVihar] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [vihars, setVihars] = useState([]);
  const [users, setUsers] = useState([]);
  const [reportPeriod, setReportPeriod] = useState('weekly');
  const [reportData, setReportData] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingViharId, setEditingViharId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewViharId, setPreviewViharId] = useState(null);
  const [viharParticipants, setViharParticipants] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignViharId, setAssignViharId] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [dateFilter, setDateFilter] = useState(''); // Date filter
  const [showTop10, setShowTop10] = useState(true); // Show top 10 entries
  const [userCurrentPage, setUserCurrentPage] = useState(1); // Current page for users
  const [userItemsPerPage] = useState(10); // Items per page for users
  const [userNameFilter, setUserNameFilter] = useState(''); // Filter users by name

  // Vihar form
  const [viharForm, setViharForm] = useState({
    route_no: '',
    sahebji_name: '',
    vihar_date: '',
    vihar_time: '',
    sadhu_bhagvant: '0',
    sadhviji_bhagvant: '0',
    wheelchair: '0',
    luggage: false,
    dori: false,
    car_required: false,
    from_upashray: '',
    to_upashray: '',
    approx_kms: '',
  });

  // User form
  const [userForm, setUserForm] = useState({
    phone: '',
    password: '',
    name: '',
    age: '',
    area: '',
    address: '',
    car: false,
    photo: '',
    blood_group: '',
    emergency_contact: '',
    date_of_birth: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (activeTab === 'vihars') {
      fetchVihars();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, reportPeriod, selectedUserId]);

  const fetchVihars = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/vihars');
      setVihars(response.data);
    } catch (error) {
      toast.error('Failed to fetch vihars');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort vihars
  const getFilteredVihars = () => {
    let filtered = [...vihars];
    
    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(vihar => vihar.vihar_date === dateFilter);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.vihar_date + ' ' + a.vihar_time);
      const dateB = new Date(b.vihar_date + ' ' + b.vihar_time);
      return dateB - dateA;
    });
    
    // Limit to top 10 if enabled
    if (showTop10) {
      filtered = filtered.slice(0, 10);
    }
    
    return filtered;
  };

  // Filter, sort, and paginate users
  const getFilteredUsers = () => {
    let filtered = [...users];
    
    // Filter by name if filter is provided
    if (userNameFilter.trim()) {
      const filterLower = userNameFilter.toLowerCase().trim();
      filtered = filtered.filter(u => {
        const name = (u.name || '').toLowerCase();
        const phone = (u.phone || '').toLowerCase();
        return name.includes(filterLower) || phone.includes(filterLower);
      });
    }
    
    // Sort by name (alphabetically)
    filtered.sort((a, b) => {
      const nameA = (a.name || a.phone || '').toLowerCase();
      const nameB = (b.name || b.phone || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    return filtered;
  };

  // Get paginated users
  const getPaginatedUsers = () => {
    const filtered = getFilteredUsers();
    
    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / userItemsPerPage);
    const startIndex = (userCurrentPage - 1) * userItemsPerPage;
    const endIndex = startIndex + userItemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);
    
    return {
      users: paginated,
      totalPages,
      currentPage: userCurrentPage,
      totalItems: filtered.length,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, filtered.length)
    };
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data);
      setUserCurrentPage(1); // Reset to first page when users are fetched
      setUserNameFilter(''); // Reset name filter when users are fetched
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchViharParticipants = async (viharId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/vihars/${viharId}/participants`);
      setViharParticipants(response.data.participants || []);
      setPreviewViharId(viharId);
      setShowPreviewModal(true);
    } catch (error) {
      toast.error('Failed to fetch participants');
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUsers = async () => {
    if (selectedUserIds.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(`/vihars/${assignViharId}/assign-users`, {
        user_ids: selectedUserIds,
        status: 'in'
      });
      toast.success(t.usersAssigned);
      setShowAssignModal(false);
      setSelectedUserIds([]);
      setAssignViharId(null);
      // Refresh vihars to show updated participant counts
      fetchVihars();
    } catch (error) {
      toast.error('Failed to assign users');
      console.error('Error assigning users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async (viharId) => {
    setAssignViharId(viharId);
    setSelectedUserIds([]);
    setShowAssignModal(true);
    // Ensure users are fetched when modal opens
    if (users.length === 0) {
      await fetchUsers();
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const url = selectedUserId 
        ? `/reports/summary?period=${reportPeriod}&user_id=${selectedUserId}`
        : `/reports/summary?period=${reportPeriod}`;
      const response = await axiosInstance.get(url);
      setReportData(response.data);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVihar = async (viharId) => {
    if (!window.confirm(t.confirmDelete)) {
      return;
    }
    try {
      await axiosInstance.delete(`/vihars/${viharId}`);
      toast.success(t.viharDeleted);
      fetchVihars();
    } catch (error) {
      toast.error('Failed to delete vihar');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const url = selectedUserId 
        ? `/reports/download/pdf?period=${reportPeriod}&user_id=${selectedUserId}`
        : `/reports/download/pdf?period=${reportPeriod}`;
      const response = await axiosInstance.get(url, {
        responseType: 'blob',
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `vihar_report_${reportPeriod}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const url = selectedUserId 
        ? `/reports/download/excel?period=${reportPeriod}&user_id=${selectedUserId}`
        : `/reports/download/excel?period=${reportPeriod}`;
      const response = await axiosInstance.get(url, {
        responseType: 'blob',
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `vihar_report_${reportPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download Excel');
    }
  };

  // Convert number to Gujarati numerals
  const toGujaratiNumeral = (num) => {
    const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
    return num.toString().split('').map(digit => gujaratiDigits[parseInt(digit)]).join('');
  };

  // Simple transliteration helper for common place names (English to Gujarati)
  // This is a basic mapping - you may need to expand this
  const transliterateToGujarati = (text) => {
    if (!text) return '';
    
    // Common place name mappings
    const placeMappings = {
      'vijaynagar': 'વિજયનગર',
      'paladi': 'પાલડી',
      'naranpura': 'નરણપુરા',
      'ahmedabad': 'અમદાવાદ',
      'gandhinagar': 'ગાંધીનગર',
      'vadodara': 'વડોદરા',
      'surat': 'સુરત',
      'rajkot': 'રાજકોટ',
    };
    
    // Check if text matches any mapping (case insensitive)
    const lowerText = text.toLowerCase().trim();
    if (placeMappings[lowerText]) {
      return placeMappings[lowerText];
    }
    
    // If no mapping found, return as-is (assuming user already entered in Gujarati)
    return text;
  };

  // Geocode location using Google Maps Geocoding API (more accurate)
  // All locations are in Ahmedabad, so we append ", Ahmedabad" automatically
  const geocodeLocationGoogle = async (location) => {
    const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      // Fallback to OpenStreetMap if no API key
      return geocodeLocationOSM(location);
    }

    try {
      const cleanLocation = location.trim();
      const searchQuery = cleanLocation.toLowerCase().includes('ahmedabad') 
        ? `${cleanLocation}, Gujarat, India`
        : `${cleanLocation}, Ahmedabad, Gujarat, India`;
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}&region=in`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location_data = data.results[0].geometry.location;
        return {
          lat: location_data.lat,
          lon: location_data.lng,
          formatted_address: data.results[0].formatted_address
        };
      }
      return null;
    } catch (error) {
      console.error('Google Geocoding error:', error);
      // Fallback to OSM
      return geocodeLocationOSM(location);
    }
  };

  // Fallback: Geocode using OpenStreetMap Nominatim API
  const geocodeLocationOSM = async (location) => {
    try {
      const cleanLocation = location.trim();
      const searchQuery = cleanLocation.toLowerCase().includes('ahmedabad') 
        ? `${cleanLocation}, Gujarat, India`
        : `${cleanLocation}, Ahmedabad, Gujarat, India`;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        {
          headers: {
            'User-Agent': 'ViharSevaGroup/1.0'
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('OSM Geocoding error:', error);
      return null;
    }
  };

  // Calculate road distance using Google Maps Distance Matrix API (like Google Maps)
  const calculateRoadDistance = async (fromLocation, toLocation) => {
    const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      // Fallback: Calculate straight-line distance if no API key
      const fromCoords = await geocodeLocationOSM(fromLocation);
      const toCoords = await geocodeLocationOSM(toLocation);
      
      if (!fromCoords || !toCoords) {
        return null;
      }
      
      // Haversine formula for straight-line distance
      const R = 6371;
      const dLat = (toCoords.lat - fromCoords.lat) * Math.PI / 180;
      const dLon = (toCoords.lon - fromCoords.lon) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(fromCoords.lat * Math.PI / 180) * Math.cos(toCoords.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    try {
      // Prepare addresses with Ahmedabad
      const fromQuery = fromLocation.toLowerCase().includes('ahmedabad') 
        ? `${fromLocation}, Gujarat, India`
        : `${fromLocation}, Ahmedabad, Gujarat, India`;
      const toQuery = toLocation.toLowerCase().includes('ahmedabad') 
        ? `${toLocation}, Gujarat, India`
        : `${toLocation}, Ahmedabad, Gujarat, India`;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(fromQuery)}&destinations=${encodeURIComponent(toQuery)}&units=metric&key=${GOOGLE_MAPS_API_KEY}&region=in`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && 
          data.rows && 
          data.rows.length > 0 && 
          data.rows[0].elements && 
          data.rows[0].elements.length > 0) {
        const element = data.rows[0].elements[0];
        
        if (element.status === 'OK') {
          // Return distance in kilometers
          return element.distance.value / 1000; // Convert meters to km
        } else {
          console.error('Distance Matrix error:', element.status);
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Google Distance Matrix error:', error);
      return null;
    }
  };

  // Calculate KMs between from and to locations using Google Maps (road distance)
  const handleCalculateDistance = async () => {
    if (!viharForm.from_upashray || !viharForm.to_upashray) {
      toast.error('Please enter both "From" and "To" locations');
      return;
    }

    setLoading(true);
    try {
      toast.info('Calculating road distance...');
      
      // Use Google Maps Distance Matrix API for accurate road distance
      const distance = await calculateRoadDistance(
        viharForm.from_upashray,
        viharForm.to_upashray
      );

      if (distance === null || distance === undefined) {
        toast.error('Could not calculate distance. Please check the location names and try again.');
        setLoading(false);
        return;
      }

      // Round to 1 decimal place
      const roundedDistance = Math.round(distance * 10) / 10;
      
      setViharForm({ ...viharForm, approx_kms: roundedDistance.toString() });
      toast.success(`Road distance calculated: ${roundedDistance} km`);
    } catch (error) {
      console.error('Distance calculation error:', error);
      toast.error('Failed to calculate distance. Please enter manually.');
    } finally {
      setLoading(false);
    }
  };

  // Get day of week in Gujarati
  const getGujaratiDay = (dateString) => {
    const date = new Date(dateString);
    const days = ['રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરુવાર', 'શુક્રવાર', 'શનિવાર'];
    return days[date.getDay()];
  };

  // Format time in Gujarati format (e.g., "સવારે ૫.૩૫વાગે")
  const formatGujaratiTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const min = parseInt(minutes);
    
    // Determine if morning or evening
    let period = '';
    let displayHour = hour;
    if (hour < 12) {
      period = 'સવારે';
    } else if (hour < 18) {
      period = 'બપોરે';
      if (hour > 12) displayHour = hour - 12;
    } else {
      period = 'સાંજે';
      if (hour > 12) displayHour = hour - 12;
    }
    
    const gujaratiHour = toGujaratiNumeral(displayHour);
    const gujaratiMin = toGujaratiNumeral(min.toString().padStart(2, '0'));
    
    return `${period} ${gujaratiHour}.${gujaratiMin}વાગે`;
  };

  // Format vihar details to Gujarati WhatsApp message
  const formatViharToWhatsApp = (form) => {
    const routeNo = toGujaratiNumeral(form.route_no || '0');
    const sahebjiName = form.sahebji_name || '';
    const viharDate = form.vihar_date || '';
    const viharTime = formatGujaratiTime(form.vihar_time || '');
    const dayOfWeek = viharDate ? getGujaratiDay(viharDate) : '';
    
    // Sadhu and Sadhviji - only include if count > 0
    const sadhuCount = parseInt(form.sadhu_bhagvant) || 0;
    const sadhvijiCount = parseInt(form.sadhviji_bhagvant) || 0;
    const sadhuBhagvant = sadhuCount > 0 ? toGujaratiNumeral(sadhuCount) : null;
    const sadhvijiBhagvant = sadhvijiCount > 0 ? toGujaratiNumeral(sadhvijiCount) : null;
    
    // Wheelchair: only show if count > 0, show actual count
    const wheelchairCount = parseInt(form.wheelchair) || 0;
    const wheelchairDisplay = wheelchairCount > 0 ? wheelchairCount.toString() : null;
    const fromUpashray = transliterateToGujarati(form.from_upashray || '');
    const toUpashray = transliterateToGujarati(form.to_upashray || '');
    
    // Format date as DD/MM/YY
    let formattedDate = '';
    if (viharDate) {
      const date = new Date(viharDate);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      formattedDate = `${day}/${month}/${year}`;
    }
    
    // Build message lines
    let messageLines = [
      'પ્રણામ🙏🏻 વિહાર સેવકો',
      '',
      `*રૂટ- ${routeNo}*`,
      '*વિહાર ની વિગત: -*',
      `*સાહેબજી નું નામ -* ${sahebjiName}`,
      `*વિહાર તારીખ-* ${formattedDate},`,
      `*વાર-* ${dayOfWeek}`,
      `*વિહાર સમય* ${viharTime}`
    ];
    
    // Add Sadhu Bhagvant only if count > 0
    if (sadhuBhagvant) {
      messageLines.push(`*સાધુ ભગવંત -*${sadhuBhagvant}`);
    }
    
    // Add Sadhviji Bhagvant only if count > 0
    if (sadhvijiBhagvant) {
      messageLines.push(`*સાધ્વીજી ભગવંત -*${sadhvijiBhagvant}`);
    }
    
    // Wheelchair - only show if count > 0
    if (wheelchairDisplay) {
      messageLines.push(`*વિલ ચેર-* ${wheelchairDisplay}`);
    }
    
    // Handle luggage, activa, car, dori with conditional logic
    // Check luggage first
    if (form.luggage) {
      // If luggage is yes and (activa or car is selected)
      if (form.activa || form.car_required) {
        let vehicleText = '';
        if (form.car_required && form.activa) {
          vehicleText = 'ગાડી / એકટીવા';
        } else if (form.car_required) {
          vehicleText = 'ગાડી';
        } else if (form.activa) {
          vehicleText = 'એકટીવા';
        }
        messageLines.push(`*સામાન છે ${vehicleText} જોઈશે*`);
      } else {
        // If luggage is yes but no activa/car
        messageLines.push('*સામાન -* હા');
      }
    } else {
      // If luggage is no but activa is yes, show luggage=ના and activa=હા
      if (form.activa) {
        messageLines.push('*સામાન -* ના');
        messageLines.push('*એકટીવા -* હા');
        // Don't show car if only activa is checked
      } else if (form.car_required) {
        // If luggage=no, activa=no, but car=yes, show car
        messageLines.push('*કાર જરૂરી -* હા');
      }
    }
    
    // Dori - only show if checked
    if (form.dori) {
      messageLines.push('*ડોરી -* હા');
    }
    
    messageLines.push(`*ક્યાં ઉપાશ્રય -*${fromUpashray}`);
    messageLines.push(`*ક્યાં ઉપાશ્રય-* ${toUpashray}`);
    messageLines.push('');
    messageLines.push('*અનુકૂળતા હોય તે જણાવશો.*');
    messageLines.push('');
    messageLines.push('*એપમાં ઇન કરી લેવું*');
    
    return messageLines.join('\n');
  };

  // Copy vihar details to clipboard in WhatsApp format
  const handleCopyToWhatsApp = () => {
    const message = formatViharToWhatsApp(viharForm);
    navigator.clipboard.writeText(message).then(() => {
      toast.success('Vihar details copied to clipboard! You can now paste it in WhatsApp.');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const resetViharForm = () => {
    setViharForm({
      route_no: '',
      sahebji_name: '',
      vihar_date: '',
      vihar_time: '',
      sadhu_bhagvant: '0',
      sadhviji_bhagvant: '0',
      wheelchair: '0',
      luggage: false,
      dori: false,
      car_required: false,
      activa: false,
      from_upashray: '',
      to_upashray: '',
      approx_kms: '',
    });
  };

  const handleCreateVihar = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/vihars', {
        ...viharForm,
        sadhu_bhagvant: parseInt(viharForm.sadhu_bhagvant) || 0,
        sadhviji_bhagvant: parseInt(viharForm.sadhviji_bhagvant) || 0,
        wheelchair: parseInt(viharForm.wheelchair) || 0,
        approx_kms: parseFloat(viharForm.approx_kms) || 0,
      });
      
      // Check if response is successful (200 or 201)
      if (response.status === 200 || response.status === 201 || response.data) {
        toast.success(t.viharCreated);
        setShowCreateVihar(false);
        resetViharForm();
        fetchVihars();
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Error creating vihar:', error);
      // Only show error if it's actually an error (not a success with wrong status code)
      if (error.response && error.response.status >= 400) {
        toast.error(error.response?.data?.detail || 'Failed to create vihar');
      } else {
        // If vihar was created but response handling failed, still show success
        toast.success(t.viharCreated);
        setShowCreateVihar(false);
        resetViharForm();
        fetchVihars();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditVihar = (vihar) => {
    setEditingViharId(vihar.id);
    setViharForm({
      route_no: vihar.route_no || '',
      sahebji_name: vihar.sahebji_name || '',
      vihar_date: vihar.vihar_date || '',
      vihar_time: vihar.vihar_time || '',
      sadhu_bhagvant: vihar.sadhu_bhagvant || '',
      sadhviji_bhagvant: vihar.sadhviji_bhagvant || '',
      wheelchair: vihar.wheelchair !== undefined && vihar.wheelchair !== null ? (typeof vihar.wheelchair === 'boolean' ? (vihar.wheelchair ? '1' : '0') : String(vihar.wheelchair)) : '0',
      luggage: vihar.luggage || false,
      dori: vihar.dori || false,
      car_required: vihar.car_required || false,
      activa: vihar.activa || false,
      from_upashray: vihar.from_upashray || '',
      to_upashray: vihar.to_upashray || '',
      approx_kms: vihar.approx_kms || '',
    });
    setShowCreateVihar(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateVihar = async () => {
    if (!editingViharId) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/vihars/${editingViharId}`, {
        ...viharForm,
        sadhu_bhagvant: parseInt(viharForm.sadhu_bhagvant) || 0,
        sadhviji_bhagvant: parseInt(viharForm.sadhviji_bhagvant) || 0,
        wheelchair: parseInt(viharForm.wheelchair) || 0,
        approx_kms: parseFloat(viharForm.approx_kms) || 0,
      });
      
      if (response.status === 200 || response.status === 201 || response.data) {
        toast.success('Vihar updated successfully!');
        setShowCreateVihar(false);
        setEditingViharId(null);
        resetViharForm();
        fetchVihars();
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Error updating vihar:', error);
      if (error.response && error.response.status >= 400) {
        toast.error(error.response?.data?.detail || 'Failed to update vihar');
      } else {
        toast.success('Vihar updated successfully!');
        setShowCreateVihar(false);
        setEditingViharId(null);
        resetViharForm();
        fetchVihars();
      }
    } finally {
      setLoading(false);
    }
  };

  const resetUserForm = () => {
    setUserForm({ 
      phone: '', 
      password: '', 
      name: '', 
      age: '', 
      area: '', 
      address: '', 
      car: false,
      photo: '',
      blood_group: '', 
      emergency_contact: '', 
      date_of_birth: '' 
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setUserForm({ ...userForm, photo: base64String });
        setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditUser = (user) => {
    // Use the most reliable ID - prefer id, fallback to _id, then phone
    const userId = user.id || user._id || user.phone;
    if (!userId) {
      toast.error('Cannot edit user: Invalid user ID');
      return;
    }
    
    setEditingUserId(userId);
    setUserForm({
      phone: user.phone || '',
      password: '', // Don't populate password
      name: user.name || '',
      age: user.age || '',
      area: user.area || '',
      address: user.address || '',
      car: user.car || false,
      photo: user.photo || '',
      blood_group: user.blood_group || '',
      emergency_contact: user.emergency_contact || '',
      date_of_birth: user.date_of_birth || '',
    });
    setPhotoPreview(user.photo || null);
    setShowAddUser(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateUser = async () => {
    if (!editingUserId) return;
    
    // Validation
    if (!userForm.name || userForm.name.trim() === '') {
      toast.error('Please enter user name');
      return;
    }
    
    if (userForm.password && (userForm.password.length !== 4 || !/^\d+$/.test(userForm.password))) {
      toast.error('Password must be exactly 4 digits');
      return;
    }
    
    setLoading(true);
    try {
      const updateData = {
        name: userForm.name.trim(),
        age: userForm.age ? parseInt(userForm.age) : null,
        area: userForm.area ? userForm.area.trim() : null,
        address: userForm.address ? userForm.address.trim() : null,
        car: userForm.car,
        photo: userForm.photo || null,
        blood_group: userForm.blood_group ? userForm.blood_group.trim() : null,
        emergency_contact: userForm.emergency_contact || null,
        date_of_birth: userForm.date_of_birth || null,
      };
      
      // Only include password if it's provided
      if (userForm.password && userForm.password.trim() !== '') {
        updateData.password = userForm.password;
      }
      
      const response = await axiosInstance.put(`/admin/users/${editingUserId}`, updateData);
      
      if (response.status === 200 || response.data) {
        toast.success('User updated successfully!');
        setShowAddUser(false);
        setEditingUserId(null);
        resetUserForm();
        fetchUsers();
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.response && error.response.status >= 400) {
        toast.error(error.response?.data?.detail || 'Failed to update user');
      } else {
        toast.success('User updated successfully!');
        setShowAddUser(false);
        setEditingUserId(null);
        resetUserForm();
        fetchUsers();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    // Use the most reliable ID - prefer id, fallback to _id, then phone
    const userId = user.id || user._id || user.phone;
    if (!userId) {
      toast.error('Cannot delete user: Invalid user ID');
      return;
    }
    
    setLoading(true);
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    // Validation
    if (!userForm.phone || userForm.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    if (!userForm.name || userForm.name.trim() === '') {
      toast.error('Please enter user name');
      return;
    }
    
    if (!userForm.password || userForm.password.length !== 4 || !/^\d+$/.test(userForm.password)) {
      toast.error('Password must be exactly 4 digits');
      return;
    }
    
    if (!userForm.area || userForm.area.trim() === '') {
      toast.error('Please enter user area');
      return;
    }
    
    setLoading(true);
    try {
      await axiosInstance.post('/admin/users', {
        ...userForm,
        phone: userForm.phone,
        password: userForm.password,
        name: userForm.name.trim(),
        area: userForm.area.trim(),
        age: userForm.age ? parseInt(userForm.age) : null,
        address: userForm.address ? userForm.address.trim() : null,
        blood_group: userForm.blood_group ? userForm.blood_group.trim() : null,
        emergency_contact: userForm.emergency_contact || null,
        date_of_birth: userForm.date_of_birth || null,
      });
      toast.success(t.userCreated);
      setShowAddUser(false);
      resetUserForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (phoneOrId, newRole) => {
    setLoading(true);
    
    try {
      // Find the user in the current list - phone number is the primary identifier
      const userToUpdate = users.find(u => {
        // Try to match by phone first (most reliable)
        if (u.phone === phoneOrId) return true;
        // Then try by id
        if (u.id === phoneOrId || String(u.id) === String(phoneOrId)) return true;
        // Then try by _id
        if (u._id === phoneOrId || String(u._id) === String(phoneOrId)) return true;
        return false;
      });
      
      if (!userToUpdate) {
        console.error('User not found in frontend state. Identifier:', phoneOrId);
        console.error('Available users:', users.map(u => ({ 
          id: u.id, 
          _id: u._id, 
          phone: u.phone,
          name: u.name 
        })));
        toast.error('User not found. Please refresh the page and try again.');
        setLoading(false);
        return;
      }
      
      // Phone number is the most reliable identifier - always use it
      const userPhone = userToUpdate.phone;
      if (!userPhone) {
        toast.error('Cannot update role: User phone number is missing');
        setLoading(false);
        return;
      }
      
      // Get user_id as fallback (prefer id, then _id, then phone)
      const actualUserId = userToUpdate.id || userToUpdate._id || userPhone;
      
      // Send both phone (primary) and user_id (fallback) for maximum reliability
      const requestPayload = { 
        phone: userPhone, // Primary identifier - most reliable
        user_id: String(actualUserId), // Fallback identifier as string
        role: newRole 
      };
      
      console.log('Updating role:', { phone: userPhone, user_id: actualUserId, role: newRole, user: userToUpdate.name || userToUpdate.phone });
      
      const response = await axiosInstance.put('/admin/users/role', requestPayload);
      
      if (response && response.data) {
        toast.success(t.roleUpdated);
        // Refresh the user list after a short delay to ensure backend has updated
        setTimeout(() => {
          fetchUsers();
        }, 500);
      } else {
        toast.error('Failed to update role: No response from server');
      }
    } catch (error) {
      console.error('Role update error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to update role';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard" data-testid="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <img src="/images/logo_vsg.png" alt="VSG Logo" />
            <h1>{t.dashboard}</h1>
          </div>
          <div className="header-right">
            <button className="btn-small" onClick={() => setLanguage(language === 'en' ? 'gu' : 'en')} data-testid="language-toggle-dashboard">
              {language === 'en' ? 'ગુજરાતી' : 'English'}
            </button>
            <div className="user-info">
              <p><strong>{user.name || user.phone}</strong></p>
              <p>{user.role}</p>
            </div>
            <button className="btn-small btn-logout" onClick={onLogout} data-testid="logout-btn">
              {t.logout}
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            data-testid="dashboard-tab"
          >
            {t.home}
          </button>
          <button
            className={`tab-btn ${activeTab === 'vihars' ? 'active' : ''}`}
            onClick={() => setActiveTab('vihars')}
            data-testid="vihars-tab"
          >
            {t.vihars}
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            data-testid="users-tab"
          >
            {t.users}
          </button>
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
            data-testid="reports-tab"
          >
            {t.reports}
          </button>
        </div>

        {/* Dashboard Home Tab */}
        {activeTab === 'dashboard' && (
          <div style={{ padding: '20px 0' }}>
            {/* Statistics Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px', 
              marginBottom: '30px' 
            }}>
              {/* Total Users Card */}
              <div 
                className="card" 
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
                onClick={() => setActiveTab('users')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>{t.totalUsers}</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{users.length}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>→ {t.viewDetails}</div>
              </div>

              {/* Total Vihars Card */}
              <div 
                className="card" 
                style={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)'
                }}
                onClick={() => setActiveTab('vihars')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 87, 108, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 87, 108, 0.4)';
                }}
              >
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>{t.totalVihars}</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{vihars.length}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>→ {t.viewDetails}</div>
              </div>

              {/* Total KMs Card */}
              <div 
                className="card" 
                style={{ 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)'
                }}
                onClick={() => setActiveTab('reports')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(79, 172, 254, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.4)';
                }}
              >
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>{t.totalKmsCovered}</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {vihars.reduce((sum, v) => sum + (parseFloat(v.approx_kms) || 0), 0).toFixed(1)}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>→ {t.viewDetails}</div>
              </div>

              {/* Active Participants Card */}
              <div 
                className="card" 
                style={{ 
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(67, 233, 123, 0.4)'
                }}
                onClick={() => setActiveTab('vihars')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(67, 233, 123, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(67, 233, 123, 0.4)';
                }}
              >
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>{t.activeParticipants}</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {users.filter(u => u.role === 'user').length}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>→ {t.viewDetails}</div>
              </div>
            </div>

            {/* Charts Section */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
              gap: '20px', 
              marginBottom: '30px' 
            }}>
              {/* Vihars Chart */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '20px', color: '#2C3E50' }}>{t.viharTrends}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={(() => {
                    // Group vihars by month
                    const monthData = {};
                    vihars.forEach(vihar => {
                      if (vihar.vihar_date) {
                        const date = new Date(vihar.vihar_date);
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        monthData[monthKey] = (monthData[monthKey] || 0) + 1;
                      }
                    });
                    return Object.entries(monthData)
                      .sort()
                      .slice(-6)
                      .map(([month, count]) => ({
                        month: month.split('-')[1] + '/' + month.split('-')[0].slice(2),
                        vihars: count
                      }));
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="vihars" fill="#7FA588" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* User Growth Chart */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '20px', color: '#2C3E50' }}>{t.userGrowth}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={(() => {
                    // Group users by month
                    const monthData = {};
                    users.forEach(user => {
                      if (user.created_at) {
                        const date = new Date(user.created_at);
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        monthData[monthKey] = (monthData[monthKey] || 0) + 1;
                      }
                    });
                    return Object.entries(monthData)
                      .sort()
                      .slice(-6)
                      .map(([month, count]) => ({
                        month: month.split('-')[1] + '/' + month.split('-')[0].slice(2),
                        users: count
                      }));
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#667eea" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Route Distribution and Recent Vihars */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
              gap: '20px' 
            }}>
              {/* Top Routes Pie Chart */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '20px', color: '#2C3E50' }}>{t.topRoutes}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={(() => {
                        const routeCounts = {};
                        vihars.forEach(vihar => {
                          if (vihar.route_no) {
                            routeCounts[vihar.route_no] = (routeCounts[vihar.route_no] || 0) + 1;
                          }
                        });
                        return Object.entries(routeCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([route, count]) => ({ name: `Route ${route}`, value: count }));
                      })()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(() => {
                        const COLORS = ['#7FA588', '#667eea', '#f5576c', '#4facfe', '#43e97b'];
                        return (() => {
                          const routeCounts = {};
                          vihars.forEach(vihar => {
                            if (vihar.route_no) {
                              routeCounts[vihar.route_no] = (routeCounts[vihar.route_no] || 0) + 1;
                            }
                          });
                          return Object.entries(routeCounts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ));
                        })();
                      })()}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Vihars List */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: '#2C3E50', margin: 0 }}>{t.recentVihars}</h3>
                  <button 
                    className="btn btn-small"
                    onClick={() => setActiveTab('vihars')}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    {t.viewDetails}
                  </button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {vihars
                    .sort((a, b) => new Date(b.vihar_date + ' ' + b.vihar_time) - new Date(a.vihar_date + ' ' + a.vihar_time))
                    .slice(0, 5)
                    .map((vihar) => (
                      <div 
                        key={vihar.id}
                        style={{
                          padding: '12px',
                          marginBottom: '10px',
                          background: '#f8f9fa',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => {
                          setActiveTab('vihars');
                          handleEditVihar(vihar);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e9ecef';
                          e.currentTarget.style.borderColor = '#7FA588';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8f9fa';
                          e.currentTarget.style.borderColor = '#e0e0e0';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#2C3E50', marginBottom: '4px' }}>
                              Route {vihar.route_no} - {vihar.vihar_date}
                            </div>
                            <div style={{ fontSize: '13px', color: '#666' }}>
                              {vihar.from_upashray} → {vihar.to_upashray}
                            </div>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#7FA588' }}>
                            {vihar.approx_kms} km
                          </div>
                        </div>
                      </div>
                    ))}
                  {vihars.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      No vihars yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vihars Tab */}
        {activeTab === 'vihars' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h3>{t.allVihars}</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => {
                  setShowCreateVihar(true);
                }} data-testid="create-vihar-btn">
                  {t.createVihar}
                </button>
              </div>
            </div>

            {showCreateVihar && (
              <div className="card" style={{ background: 'rgba(168, 198, 159, 0.1)', marginBottom: '20px' }}>
                <h3>{editingViharId ? t.updateVihar : t.createVihar}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  <div className="form-group">
                    <label>{t.routeNo}</label>
                    <input
                      type="text"
                      value={viharForm.route_no}
                      onChange={(e) => setViharForm({ ...viharForm, route_no: e.target.value })}
                      data-testid="route-no-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.sahebjiName}</label>
                    <input
                      type="text"
                      value={viharForm.sahebji_name}
                      onChange={(e) => setViharForm({ ...viharForm, sahebji_name: e.target.value })}
                      data-testid="sahebji-name-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.viharDate}</label>
                    <input
                      type="date"
                      value={viharForm.vihar_date}
                      onChange={(e) => setViharForm({ ...viharForm, vihar_date: e.target.value })}
                      data-testid="vihar-date-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.viharTime}</label>
                    <input
                      type="time"
                      value={viharForm.vihar_time}
                      onChange={(e) => setViharForm({ ...viharForm, vihar_time: e.target.value })}
                      data-testid="vihar-time-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.sadhuBhagvant}</label>
                    <input
                      type="number"
                      value={viharForm.sadhu_bhagvant}
                      onChange={(e) => setViharForm({ ...viharForm, sadhu_bhagvant: e.target.value })}
                      data-testid="sadhu-count-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.sadhvijiBhagvant}</label>
                    <input
                      type="number"
                      value={viharForm.sadhviji_bhagvant}
                      onChange={(e) => setViharForm({ ...viharForm, sadhviji_bhagvant: e.target.value })}
                      data-testid="sadhviji-count-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.fromUpashray}</label>
                    <input
                      type="text"
                      value={viharForm.from_upashray}
                      onChange={(e) => setViharForm({ ...viharForm, from_upashray: e.target.value })}
                      data-testid="from-upashray-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.toUpashray}</label>
                    <input
                      type="text"
                      value={viharForm.to_upashray}
                      onChange={(e) => setViharForm({ ...viharForm, to_upashray: e.target.value })}
                      data-testid="to-upashray-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.approxKms}</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        step="0.1"
                        value={viharForm.approx_kms}
                        onChange={(e) => setViharForm({ ...viharForm, approx_kms: e.target.value })}
                        data-testid="approx-kms-input"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={handleCalculateDistance}
                        disabled={loading || !viharForm.from_upashray || !viharForm.to_upashray}
                        style={{
                          padding: '8px 16px',
                          background: '#7FA588',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: loading || !viharForm.from_upashray || !viharForm.to_upashray ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          opacity: loading || !viharForm.from_upashray || !viharForm.to_upashray ? 0.6 : 1,
                          transition: 'all 0.2s'
                        }}
                        title="Calculate distance between From and To locations"
                      >
                        {loading ? t.calculating : t.calculateDistance}
                      </button>
                    </div>
                    <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                      {t.calculateDistanceHint}
                    </small>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ minWidth: '200px' }}>
                    <label>{t.wheelchair}</label>
                    <input
                      type="number"
                      min="0"
                      value={viharForm.wheelchair}
                      onChange={(e) => setViharForm({ ...viharForm, wheelchair: e.target.value })}
                      data-testid="wheelchair-input"
                      placeholder="0"
                    />
                  </div>
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={viharForm.luggage}
                      onChange={(e) => setViharForm({ ...viharForm, luggage: e.target.checked })}
                      data-testid="luggage-checkbox"
                    />
                    <label>{t.luggage}</label>
                  </div>
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={viharForm.dori}
                      onChange={(e) => setViharForm({ ...viharForm, dori: e.target.checked })}
                      data-testid="dori-checkbox"
                    />
                    <label>{t.dori}</label>
                  </div>
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={viharForm.car_required}
                      onChange={(e) => setViharForm({ ...viharForm, car_required: e.target.checked })}
                      data-testid="car-required-checkbox"
                    />
                    <label>{t.carRequired}</label>
                  </div>
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={viharForm.activa}
                      onChange={(e) => setViharForm({ ...viharForm, activa: e.target.checked })}
                      data-testid="activa-checkbox"
                    />
                    <label>{t.activa}</label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={editingViharId ? handleUpdateVihar : handleCreateVihar} disabled={loading} data-testid="submit-vihar-btn">
                    {editingViharId ? t.updateVihar : t.create}
                  </button>
                  <button 
                    className="btn" 
                    style={{ background: '#25D366', color: 'white' }} 
                    onClick={handleCopyToWhatsApp}
                    data-testid="copy-whatsapp-btn"
                  >
                    📱 {t.copyToWhatsApp}
                  </button>
                  <button className="btn btn-secondary" onClick={() => {
                    setShowCreateVihar(false);
                    setEditingViharId(null);
                    resetViharForm();
                  }} data-testid="cancel-vihar-btn">
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}

            {/* Filter and View Controls */}
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              marginBottom: '20px', 
              flexWrap: 'wrap',
              alignItems: 'center',
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              {/* Date Filter */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#666' }}>
                  📅 {t.filterByDate}
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '2px solid #e0e0e0',
                    fontSize: '14px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1a237e'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter('')}
                    style={{
                      marginTop: '5px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Top 10 Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#666'
                }}>
                  <input
                    type="checkbox"
                    checked={showTop10}
                    onChange={(e) => setShowTop10(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1a237e' }}
                  />
                  {t.showTop10}
                </label>
              </div>

              {/* View Mode Toggle */}
              <div style={{ display: 'flex', gap: '5px', background: 'white', padding: '4px', borderRadius: '8px', border: '2px solid #e0e0e0' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: viewMode === 'grid' ? '#1a237e' : 'transparent',
                    color: viewMode === 'grid' ? 'white' : '#666',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  ⊞ {t.gridView}
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: viewMode === 'list' ? '#1a237e' : 'transparent',
                    color: viewMode === 'list' ? 'white' : '#666',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  ☰ {t.listView}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : (() => {
              const filteredVihars = getFilteredVihars();
              
              if (vihars.length === 0) {
                return (
                  <div className="empty-state">
                    <h3>No vihars yet</h3>
                    <p>Create your first vihar to get started</p>
                  </div>
                );
              }
              
              if (filteredVihars.length === 0) {
                return (
                  <div className="empty-state">
                    <h3>{t.noViharsFound}</h3>
                    <p>Try changing the date filter or showing all entries</p>
                  </div>
                );
              }

              // Grid View
              if (viewMode === 'grid') {
                return (
                  <div className="vihar-grid">
                    {filteredVihars.map((vihar) => (
                  <div key={vihar.id} className="vihar-card" data-testid={`vihar-card-${vihar.id}`}>
                    <h4>{vihar.sahebji_name}</h4>
                    <p><strong>{t.routeNo}:</strong> {vihar.route_no}</p>
                    <p><strong>{t.viharDate}:</strong> {vihar.vihar_date} at {vihar.vihar_time}</p>
                    <p><strong>{t.fromUpashray}:</strong> {vihar.from_upashray}</p>
                    <p><strong>{t.toUpashray}:</strong> {vihar.to_upashray}</p>
                    <p><strong>{t.approxKms}:</strong> {vihar.approx_kms} km</p>
                    <p><strong>{t.sadhuBhagvant}:</strong> {vihar.sadhu_bhagvant}</p>
                    <p><strong>{t.sadhvijiBhagvant}:</strong> {vihar.sadhviji_bhagvant || 0}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                      {vihar.wheelchair && <span className="status-badge status-in">♿ {t.wheelchair}</span>}
                      {vihar.luggage && <span className="status-badge status-out">🧳 {t.luggage}</span>}
                      {vihar.dori && <span className="status-badge status-in">📦 {t.dori}</span>}
                      {vihar.car_required && <span className="status-badge status-out">🚗 {t.carRequired}</span>}
                      {vihar.activa && <span className="status-badge status-out">🏍️ {t.activa}</span>}
                    </div>
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEditVihar(vihar)}
                        data-testid={`edit-vihar-btn-${vihar.id}`}
                        style={{ flex: 1, minWidth: '80px' }}
                      >
                        {t.editVihar}
                      </button>
                      <button
                        className="btn-action"
                        onClick={() => fetchViharParticipants(vihar.id)}
                        data-testid={`preview-vihar-btn-${vihar.id}`}
                        style={{ flex: 1, minWidth: '80px', background: '#7FA588', color: 'white' }}
                      >
                        {t.previewParticipants}
                      </button>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => openAssignModal(vihar.id)}
                        data-testid={`assign-vihar-btn-${vihar.id}`}
                        style={{ flex: 1, minWidth: '80px' }}
                      >
                        {t.assignUsers}
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteVihar(vihar.id)}
                        data-testid={`delete-vihar-btn-${vihar.id}`}
                        style={{ flex: 1, minWidth: '80px' }}
                      >
                        {t.deleteVihar}
                      </button>
                    </div>
                  </div>
                ))}
                  </div>
                );
              }

              // List View
              return (
                <div style={{ 
                  background: 'white', 
                  borderRadius: '8px', 
                  border: '1px solid #e0e0e0',
                  overflow: 'hidden'
                }}>
                  <table className="data-table" style={{ width: '100%', margin: 0 }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Date & Time</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Route</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Shraman Shramani Bhagvant</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>From → To</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>KMs</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Requirements</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVihars.map((vihar) => (
                        <tr key={vihar.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '15px' }}>
                            <div style={{ fontWeight: '600', color: '#1a237e' }}>
                              {vihar.vihar_date}
                            </div>
                            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                              {vihar.vihar_time}
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div style={{ fontWeight: '600' }}>{vihar.route_no}</div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div>{vihar.sahebji_name || 'N/A'}</div>
                            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                              Sadhu: {vihar.sadhu_bhagvant}, Sadhviji: {vihar.sadhviji_bhagvant || 0}
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div style={{ fontSize: '14px' }}>
                              <div>📍 {vihar.from_upashray}</div>
                              <div style={{ margin: '4px 0', color: '#666' }}>↓</div>
                              <div>📍 {vihar.to_upashray}</div>
                            </div>
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <div style={{ fontWeight: '600', color: '#1a237e' }}>
                              {vihar.approx_kms} km
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {vihar.wheelchair && <span className="status-badge status-in" style={{ fontSize: '11px', padding: '3px 8px' }}>♿</span>}
                              {vihar.luggage && <span className="status-badge status-out" style={{ fontSize: '11px', padding: '3px 8px' }}>🧳</span>}
                              {vihar.dori && <span className="status-badge status-in" style={{ fontSize: '11px', padding: '3px 8px' }}>📦</span>}
                              {vihar.car_required && <span className="status-badge status-out" style={{ fontSize: '11px', padding: '3px 8px' }}>🚗</span>}
                              {vihar.activa && <span className="status-badge status-out" style={{ fontSize: '11px', padding: '3px 8px' }}>🏍️</span>}
                              {!vihar.wheelchair && !vihar.luggage && !vihar.dori && !vihar.car_required && !vihar.activa && (
                                <span style={{ fontSize: '12px', color: '#999' }}>None</span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                              <button
                                className="btn-action btn-edit"
                                onClick={() => handleEditVihar(vihar)}
                                style={{ fontSize: '12px', padding: '6px 10px' }}
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-action"
                                onClick={() => fetchViharParticipants(vihar.id)}
                                style={{ fontSize: '12px', padding: '6px 10px', background: '#7FA588', color: 'white' }}
                                title="Preview"
                              >
                                👁️
                              </button>
                              <button
                                className="btn-action btn-edit"
                                onClick={() => openAssignModal(vihar.id)}
                                style={{ fontSize: '12px', padding: '6px 10px' }}
                                title="Assign"
                              >
                                ➕
                              </button>
                              <button
                                className="btn-action btn-delete"
                                onClick={() => handleDeleteVihar(vihar.id)}
                                style={{ fontSize: '12px', padding: '6px 10px' }}
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {showTop10 && filteredVihars.length === 10 && (
                    <div style={{ padding: '15px', textAlign: 'center', background: '#f8f9fa', borderTop: '1px solid #e0e0e0', color: '#666', fontSize: '14px' }}>
                      Showing top 10 entries. Uncheck "Show Top 10" to see all entries.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>{t.allUsers}</h3>
              <button className="btn btn-primary" onClick={() => setShowAddUser(true)} data-testid="add-user-btn">
                {t.addUser}
              </button>
            </div>

            {showAddUser && (
              <div className="card" style={{ background: 'rgba(168, 198, 159, 0.1)', marginBottom: '20px' }}>
                <h3>{editingUserId ? 'Update User' : t.addUser}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  <div className="form-group">
                    <label>{t.phone}</label>
                    <input
                      type="tel"
                      value={userForm.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setUserForm({ ...userForm, phone: value });
                      }}
                      disabled={!!editingUserId}
                      placeholder="9429617099"
                      maxLength="10"
                      pattern="[0-9]{10}"
                      inputMode="numeric"
                      data-testid="user-phone-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      data-testid="user-name-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password {editingUserId && '(leave blank to keep current)'}</label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setUserForm({ ...userForm, password: value });
                      }}
                      placeholder={editingUserId ? 'Leave blank to keep current password' : '1234'}
                      maxLength="4"
                      pattern="[0-9]{4}"
                      inputMode="numeric"
                      required={!editingUserId}
                      data-testid="user-password-input"
                    />
                    {!editingUserId && (
                      <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                        Must be exactly 4 digits
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label>{t.age}</label>
                    <input
                      type="number"
                      value={userForm.age}
                      onChange={(e) => setUserForm({ ...userForm, age: e.target.value })}
                      data-testid="user-age-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.area}</label>
                    <input
                      type="text"
                      value={userForm.area}
                      onChange={(e) => setUserForm({ ...userForm, area: e.target.value })}
                      data-testid="user-area-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={userForm.address}
                      onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                      data-testid="user-address-input"
                    />
                  </div>
                </div>
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={userForm.car}
                      onChange={(e) => setUserForm({ ...userForm, car: e.target.checked })}
                      data-testid="user-car-checkbox"
                    />
                    <label>Has Car</label>
                  </div>
                  <div className="form-group">
                    <label>Blood Group</label>
                    <input
                      type="text"
                      value={userForm.blood_group}
                      onChange={(e) => setUserForm({ ...userForm, blood_group: e.target.value })}
                      placeholder="A+, B+, O+, etc."
                      data-testid="user-blood-group-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Emergency Contact No</label>
                    <input
                      type="tel"
                      value={userForm.emergency_contact}
                      onChange={(e) => setUserForm({ ...userForm, emergency_contact: e.target.value.replace(/\D/g, '') })}
                      placeholder="9429617099"
                      maxLength="10"
                      data-testid="user-emergency-contact-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={userForm.date_of_birth}
                      onChange={(e) => setUserForm({ ...userForm, date_of_birth: e.target.value })}
                      data-testid="user-date-of-birth-input"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      data-testid="user-photo-input"
                      style={{ marginBottom: '10px' }}
                    />
                    {photoPreview && (
                      <div style={{ 
                        position: 'relative', 
                        width: '150px', 
                        height: '150px', 
                        marginTop: '10px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '2px solid #ddd'
                      }}>
                        <img 
                          src="/images/logo_vsg.png" 
                          alt="VSG Background" 
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.3,
                            zIndex: 1
                          }}
                        />
                        <img 
                          src={photoPreview} 
                          alt="User Photo" 
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 2,
                            borderRadius: '8px'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button className="btn btn-primary" onClick={editingUserId ? handleUpdateUser : handleAddUser} disabled={loading} data-testid="submit-user-btn">
                    {editingUserId ? t.update : t.create}
                  </button>
                  <button className="btn btn-secondary" onClick={() => {
                    setShowAddUser(false);
                    setEditingUserId(null);
                    resetUserForm();
                  }} data-testid="cancel-user-btn">
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}

            {/* Name Filter */}
            {!loading && users.length > 0 && (
              <div style={{ 
                marginBottom: '20px',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <div className="form-group" style={{ marginBottom: 0, maxWidth: '400px' }}>
                  <label style={{ marginBottom: '8px', display: 'block', fontWeight: '500', color: '#666' }}>
                    🔍 Filter by Name or Phone
                  </label>
                  <input
                    type="text"
                    value={userNameFilter}
                    onChange={(e) => {
                      setUserNameFilter(e.target.value);
                      setUserCurrentPage(1); // Reset to first page when filter changes
                    }}
                    placeholder="Search by name or phone number..."
                    style={{
                      width: '100%',
                      padding: '10px 15px',
                      borderRadius: '6px',
                      border: '2px solid #e0e0e0',
                      fontSize: '14px',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#7FA588'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
              </div>
            )}

            {loading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : (() => {
              const paginationData = getPaginatedUsers();
              
              if (users.length === 0) {
                return (
                  <div className="empty-state">
                    <h3>No users available</h3>
                    <p>Add users to get started</p>
                  </div>
                );
              }

              if (paginationData.users.length === 0) {
                return (
                  <div className="empty-state">
                    <h3>No users found</h3>
                    <p>{userNameFilter ? 'Try changing the search filter' : 'Add users to get started'}</p>
                  </div>
                );
              }

              // List View
              return (
                <>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{t.name}</th>
                        <th>{t.area}</th>
                        <th>{t.age}</th>
                        <th>{t.role}</th>
                        <th>Is Admin</th>
                        <th>{t.phone}</th>
                        <th>Car</th>
                        <th>{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginationData.users.map((u) => {
                        const userId = u.id || u._id || u.phone;
                        return (
                        <tr key={userId} data-testid={`user-row-${userId}`}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {u.photo && (
                                <div style={{ 
                                  position: 'relative', 
                                  width: '40px', 
                                  height: '40px', 
                                  borderRadius: '50%',
                                  overflow: 'hidden',
                                  flexShrink: 0
                                }}>
                                  <img 
                                    src="/images/logo_vsg.png" 
                                    alt="VSG Background" 
                                    style={{
                                      position: 'absolute',
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      opacity: 0.3,
                                      zIndex: 1
                                    }}
                                  />
                                  <img 
                                    src={u.photo} 
                                    alt="User" 
                                    style={{
                                      position: 'absolute',
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      zIndex: 2,
                                      borderRadius: '50%'
                                    }}
                                  />
                                </div>
                              )}
                              <span>{u.name || 'N/A'}</span>
                            </div>
                          </td>
                          <td>{u.area || 'N/A'}</td>
                          <td>{u.age || 'N/A'}</td>
                          <td><strong>{u.role}</strong></td>
                          <td>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              backgroundColor: u.role === 'admin' ? '#1a237e' : '#6c757d',
                              color: 'white'
                            }}>
                              {u.role === 'admin' ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td>{u.phone}</td>
                          <td>{u.car ? 'Yes' : 'No'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                className="btn-action btn-edit"
                                onClick={() => handleEditUser(u)}
                                data-testid={`edit-user-btn-${u.id}`}
                                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                              >
                                {t.edit}
                              </button>
                              
                              {u.role === 'user' && (
                                <>
                                  <button
                                    className="btn-action btn-delete"
                                    onClick={() => handleDeleteUser(u)}
                                    data-testid={`delete-user-btn-${u.id || u._id || u.phone}`}
                                    style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                                  >
                                    {t.delete}
                                  </button>
                                  <button
                                    className="btn-action btn-edit"
                                    onClick={() => {
                                      if (!u.phone) {
                                        toast.error('Cannot update role: User phone number is missing');
                                        return;
                                      }
                                      if (window.confirm(`Are you sure you want to make ${u.name || u.phone} an admin? They will have full admin access.`)) {
                                        handleUpdateRole(u.phone, 'admin');
                                      }
                                    }}
                                    data-testid={`make-admin-btn-${u.id || u._id || u.phone}`}
                                    style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                                    disabled={loading}
                                  >
                                    {t.makeAdmin}
                                  </button>
                                </>
                              )}
                              
                              {u.role === 'admin' && u.phone !== user.phone && (
                                <button
                                  className="btn-action btn-delete"
                                  onClick={() => {
                                    if (!u.phone) {
                                      toast.error('Cannot update role: User phone number is missing');
                                      return;
                                    }
                                    if (window.confirm(`Are you sure you want to remove admin access from ${u.name || u.phone}?`)) {
                                      handleUpdateRole(u.phone, 'user');
                                    }
                                  }}
                                  data-testid={`make-user-btn-${u.id || u._id || u.phone}`}
                                  style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                                  disabled={loading}
                                >
                                  {t.makeUser}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {paginationData.totalPages > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '25px',
                      padding: '15px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Showing {paginationData.startIndex} to {paginationData.endIndex} of {paginationData.totalItems} users
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setUserCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={userCurrentPage === 1}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '2px solid #e0e0e0',
                            background: userCurrentPage === 1 ? '#f5f5f5' : 'white',
                            color: userCurrentPage === 1 ? '#999' : '#666',
                            cursor: userCurrentPage === 1 ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                        >
                          ← {t.previous}
                        </button>
                        
                        {/* Page Numbers */}
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map((pageNum) => {
                            const showPage = 
                              pageNum === 1 || 
                              pageNum === paginationData.totalPages || 
                              (pageNum >= userCurrentPage - 1 && pageNum <= userCurrentPage + 1);
                            
                            if (!showPage && pageNum === 2 && userCurrentPage > 3) {
                              return <span key={pageNum} style={{ padding: '8px', color: '#666' }}>...</span>;
                            }
                            if (!showPage && pageNum === paginationData.totalPages - 1 && userCurrentPage < paginationData.totalPages - 2) {
                              return null;
                            }
                            if (!showPage) return null;
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setUserCurrentPage(pageNum)}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  border: '2px solid #e0e0e0',
                                  background: userCurrentPage === pageNum ? '#7FA588' : 'white',
                                  color: userCurrentPage === pageNum ? 'white' : '#666',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: userCurrentPage === pageNum ? '600' : '500',
                                  transition: 'all 0.2s',
                                  minWidth: '40px'
                                }}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => setUserCurrentPage(prev => Math.min(paginationData.totalPages, prev + 1))}
                          disabled={userCurrentPage === paginationData.totalPages}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '2px solid #e0e0e0',
                            background: userCurrentPage === paginationData.totalPages ? '#f5f5f5' : 'white',
                            color: userCurrentPage === paginationData.totalPages ? '#999' : '#666',
                            cursor: userCurrentPage === paginationData.totalPages ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                        >
                          {t.next} →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ margin: 0 }}>{t.reports}</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-action btn-edit"
                  onClick={handleDownloadPDF}
                  data-testid="download-pdf-btn"
                  style={{ padding: '10px 20px' }}
                >
                  📄 {t.downloadPDF}
                </button>
                <button
                  className="btn-action btn-edit"
                  onClick={handleDownloadExcel}
                  data-testid="download-excel-btn"
                  style={{ padding: '10px 20px', background: '#5A8A68' }}
                >
                  📊 {t.downloadExcel}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div className="form-group" style={{ maxWidth: '300px', marginBottom: '20px' }}>
                <label>{t.userWiseReport}</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  data-testid="user-select"
                >
                  <option value="">{t.allUsers}</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.phone} {u.area ? `(${u.area})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="tabs">
                <button
                  className={`tab-btn ${reportPeriod === 'weekly' ? 'active' : ''}`}
                  onClick={() => setReportPeriod('weekly')}
                  data-testid="weekly-report-btn"
                >
                  {t.weekly}
                </button>
                <button
                  className={`tab-btn ${reportPeriod === 'monthly' ? 'active' : ''}`}
                  onClick={() => setReportPeriod('monthly')}
                  data-testid="monthly-report-btn"
                >
                  {t.monthly}
                </button>
                <button
                  className={`tab-btn ${reportPeriod === 'yearly' ? 'active' : ''}`}
                  onClick={() => setReportPeriod('yearly')}
                  data-testid="yearly-report-btn"
                >
                  {t.yearly}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : reportData ? (
              <>
                <div className="report-summary">
                  <div className="summary-card">
                    <h4>{t.totalVihars}</h4>
                    <p data-testid="total-vihars-count">{reportData.total_vihars}</p>
                  </div>
                  <div className="summary-card">
                    <h4>{t.totalKms}</h4>
                    <p data-testid="total-kms-count">{reportData.total_kms.toFixed(2)}</p>
                  </div>
                </div>

                <div className="vihar-grid">
                  {reportData.vihars.map((vihar) => (
                    <div key={vihar.id} className="vihar-card">
                      <h4>{vihar.sahebji_name}</h4>
                      <p><strong>{t.viharDate}:</strong> {vihar.vihar_date}</p>
                      <p><strong>{t.approxKms}:</strong> {vihar.approx_kms} km</p>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Preview Participants Modal - Centered Popup */}
      {showPreviewModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowPreviewModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '25px', 
              paddingBottom: '15px', 
              borderBottom: '2px solid #f0f0f0' 
            }}>
              <h2 style={{ margin: 0, color: '#2C3E50', fontSize: '24px', fontWeight: '600' }}>
                👥 {t.previewParticipants}
              </h2>
              <button 
                onClick={() => setShowPreviewModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  transition: 'all 0.2s',
                  lineHeight: 1
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#f5f5f5';
                  e.target.style.color = '#333';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#666';
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
                <p style={{ marginTop: '15px', color: '#666' }}>Loading participants...</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div style={{ 
                  display: 'flex', 
                  gap: '15px', 
                  marginBottom: '25px', 
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '15px',
                    background: '#7FA588',
                    borderRadius: '8px',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px rgba(127, 165, 136, 0.3)',
                    borderLeft: '4px solid #6B8A73'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '5px' }}>
                      {viharParticipants.length}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.95 }}>
                      {t.totalParticipants}
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '15px',
                    background: '#7FA588',
                    borderRadius: '8px',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px rgba(127, 165, 136, 0.3)',
                    borderLeft: '4px solid #6B8A73'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '5px' }}>
                      {viharParticipants.filter(p => p.status === 'in').length}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.95 }}>
                      {t.optedIn}
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '15px',
                    background: '#C9A85D',
                    borderRadius: '8px',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px rgba(201, 168, 93, 0.3)',
                    borderLeft: '4px solid #B8954A'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '5px' }}>
                      {viharParticipants.filter(p => p.status === 'out').length}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.95 }}>
                      {t.optedOut}
                    </div>
                  </div>
                </div>

                {/* Participants Table */}
                {viharParticipants.length === 0 ? (
                  <div style={{ 
                    padding: '60px 20px', 
                    textAlign: 'center',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '2px dashed #e0e0e0'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>👥</div>
                    <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>{t.noParticipants}</p>
                  </div>
                ) : (
                  <div style={{ 
                    flex: 1,
                    overflowY: 'auto',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    background: '#fafafa'
                  }}>
                    <table className="data-table" style={{ width: '100%', margin: 0, background: 'white' }}>
                      <thead>
                        <tr style={{ background: '#f8f9fa', position: 'sticky', top: 0, zIndex: 10 }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#2C3E50' }}>Name</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#2C3E50' }}>Phone</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#2C3E50' }}>Area</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#2C3E50' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viharParticipants.map((participant) => (
                          <tr 
                            key={participant.participation_id}
                            style={{ 
                              borderBottom: '1px solid #f0f0f0',
                              transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                          >
                            <td style={{ padding: '12px', fontWeight: '500' }}>
                              {participant.user?.name || 'N/A'}
                            </td>
                            <td style={{ padding: '12px', color: '#666' }}>
                              {participant.user?.phone || 'N/A'}
                            </td>
                            <td style={{ padding: '12px', color: '#666' }}>
                              {participant.user?.area || 'N/A'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <span 
                                className={`status-badge ${participant.status === 'in' ? 'status-in' : 'status-out'}`}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  display: 'inline-block'
                                }}
                              >
                                {participant.status === 'in' ? '✓ In' : '✗ Out'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Assign Users Modal - Professional Design */}
      {showAssignModal && (
        <div 
          className="modal-overlay" 
          onClick={() => {
            setShowAssignModal(false);
            setUserSearchTerm('');
          }} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '25px', 
              paddingBottom: '15px', 
              borderBottom: '2px solid #f0f0f0' 
            }}>
              <h2 style={{ margin: 0, color: '#2C3E50', fontSize: '24px', fontWeight: '600' }}>
                {t.assignUsersToVihar}
              </h2>
              <button 
                onClick={() => {
                  setShowAssignModal(false);
                  setUserSearchTerm('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  transition: 'all 0.2s',
                  lineHeight: 1
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#f5f5f5';
                  e.target.style.color = '#333';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#666';
                }}
              >
                ✕
              </button>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="🔍 Search users by name, phone, or area..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#7FA588'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Users List */}
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              background: '#fafafa',
              marginBottom: '20px',
              minHeight: '300px'
            }}>
              {loading && users.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <div className="spinner" style={{ margin: '0 auto' }}></div>
                  <p style={{ marginTop: '15px', color: '#666' }}>Loading users...</p>
                </div>
              ) : (() => {
                const filteredUsers = users.filter(u => {
                  if (!userSearchTerm) return true;
                  const search = userSearchTerm.toLowerCase();
                  return (
                    (u.name || '').toLowerCase().includes(search) ||
                    (u.phone || '').includes(search) ||
                    (u.area || '').toLowerCase().includes(search)
                  );
                });

                if (filteredUsers.length === 0) {
                  return (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                      <p style={{ fontSize: '16px', margin: 0 }}>
                        {userSearchTerm ? 'No users found matching your search' : 'No users available'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div style={{ padding: '10px' }}>
                    {filteredUsers.map((u) => {
                      const userId = u.id || u._id || u.phone;
                      const isSelected = selectedUserIds.includes(userId);
                      return (
                        <div 
                          key={userId} 
                          onClick={() => {
                            if (isSelected) {
                              setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
                            } else {
                              setSelectedUserIds([...selectedUserIds, userId]);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '15px',
                            marginBottom: '8px',
                            borderRadius: '8px',
                            background: isSelected ? '#E8F5E9' : 'white',
                            border: `2px solid ${isSelected ? '#7FA588' : '#e0e0e0'}`,
                            borderLeft: `4px solid ${isSelected ? '#7FA588' : 'transparent'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 2px 8px rgba(127, 165, 136, 0.2)' : 'none'
                          }}
                          onMouseOver={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#7FA588';
                              e.currentTarget.style.background = '#f5f5f5';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#e0e0e0';
                              e.currentTarget.style.background = 'white';
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              marginRight: '15px',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              accentColor: '#7FA588'
                            }}
                          />
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {u.photo && (
                              <div style={{
                                width: '45px',
                                height: '45px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '2px solid #e0e0e0',
                                flexShrink: 0,
                                background: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <img 
                                  src={u.photo} 
                                  alt={u.name || 'User'} 
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const parent = e.target.parentElement;
                                    if (parent && !parent.querySelector('.avatar-fallback')) {
                                      const fallback = document.createElement('div');
                                      fallback.className = 'avatar-fallback';
                                      fallback.style.cssText = 'font-size: 20px; color: #999;';
                                      fallback.textContent = '👤';
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                              </div>
                            )}
                            {!u.photo && (
                              <div style={{
                                width: '45px',
                                height: '45px',
                                borderRadius: '50%',
                                background: '#7FA588',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                flexShrink: 0
                              }}>
                                {(u.name || u.phone || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ 
                                fontWeight: '600', 
                                fontSize: '15px', 
                                color: '#2C3E50',
                                marginBottom: '4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {u.name || 'No Name'}
                              </div>
                              <div style={{ fontSize: '13px', color: '#666', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                <span>📱 {u.phone}</span>
                                {u.area && <span>📍 {u.area}</span>}
                                {u.role === 'admin' && <span style={{ color: '#7FA588', fontWeight: '600' }}>👑 Admin</span>}
                              </div>
                            </div>
                            {isSelected && (
                              <div style={{
                                background: '#7FA588',
                                color: 'white',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                flexShrink: 0
                              }}>
                                ✓
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '20px',
              borderTop: '2px solid #f0f0f0',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                <span style={{ color: '#7FA588', fontWeight: '600', fontSize: '16px' }}>{selectedUserIds.length}</span> user(s) selected
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => {
                    setShowAssignModal(false);
                    setUserSearchTerm('');
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    background: 'white',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = '#999';
                    e.target.style.background = '#f5f5f5';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.background = 'white';
                  }}
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={handleAssignUsers}
                  disabled={loading || selectedUserIds.length === 0}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: selectedUserIds.length === 0 ? '#ccc' : '#7FA588',
                    color: 'white',
                    cursor: selectedUserIds.length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    opacity: selectedUserIds.length === 0 ? 0.6 : 1,
                    boxShadow: selectedUserIds.length > 0 ? '0 4px 15px rgba(127, 165, 136, 0.3)' : 'none'
                  }}
                  onMouseOver={(e) => {
                    if (selectedUserIds.length > 0 && !loading) {
                      e.target.style.background = '#6B8A73';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(127, 165, 136, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedUserIds.length > 0) {
                      e.target.style.background = '#7FA588';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(127, 165, 136, 0.3)';
                    }
                  }}
                >
                  {loading ? '⏳ Assigning...' : `✓ ${t.assign} (${selectedUserIds.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
