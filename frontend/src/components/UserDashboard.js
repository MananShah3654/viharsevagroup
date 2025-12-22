import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

const translations = {
  en: {
    dashboard: 'User Dashboard',
    allVihars: 'All Vihars',
    myVihars: 'My Vihars',
    reports: 'My Reports',
    profile: 'Profile',
    routeNo: 'Route Number',
    gujaratiDate: 'Gujarati Date',
    sahebjiName: 'Shraman Shramani Bhagvant',
    viharDate: 'Vihar Date',
    viharTime: 'Time',
    fromUpashray: 'Vihar Starting Point',
    toUpashray: 'Vihar Ending Point',
    approxKms: 'KMs',
    optIn: 'Opt In',
    optOut: 'Opt Out',
    participationUpdated: 'Participation updated!',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    totalVihars: 'Total Vihars',
    totalKms: 'Total KMs Covered',
    totalThana: 'Total Thana',
    totalSadhuBhagvant: 'Total Sadhu Bhagvant',
    totalSadhvijiBhagvant: 'Total Sadhviji Bhagvant',
    totalMumukshu: 'Total Mumukshu',
    downloadPDF: 'Download PDF',
    downloadExcel: 'Download Excel',
    phone: 'Phone',
    age: 'Age',
    area: 'Area',
    address: 'Address',
    car: 'Car',
    updateProfile: 'Update Profile',
    profileUpdated: 'Profile updated!',
    logout: 'Logout',
    yes: 'Yes',
    no: 'No',
    gridView: 'Grid View',
    listView: 'List View',
    showTop10: 'Show Top 10',
    showAll: 'Show All',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
  },
  gu: {
    dashboard: 'યુઝર ડેશબોર્ડ',
    allVihars: 'તમામ વિહારો',
    myVihars: 'મારા વિહારો',
    reports: 'મારા રિપોર્ટ્સ',
    profile: 'પ્રોફાઇલ',
    routeNo: 'રૂટ નંબર',
    gujaratiDate: 'ગુજરાતી તારીખ',
    sahebjiName: 'શ્રમણ શ્રમણી ભગવંત',
    viharDate: 'વિહાર તારીખ',
    viharTime: 'સમય',
    fromUpashray: 'વિહાર ની શરૂઆત',
    toUpashray: 'વિહાર ની પૂર્ણાહુતિ',
    approxKms: 'કિ.મી.',
    optIn: 'જોડાઓ',
    optOut: 'છોડો',
    participationUpdated: 'ભાગીદારી અપડેટ થઈ!',
    weekly: 'સાપ્તાહિક',
    monthly: 'માસિક',
    yearly: 'વાર્ષિક',
    totalVihars: 'કુલ વિહારો',
    totalKms: 'કુલ કિ.મી.',
    totalThana: 'કુલ થાના',
    totalSadhuBhagvant: 'કુલ સાધુ ભગવંત',
    totalSadhvijiBhagvant: 'કુલ સાધ્વીજી ભગવંત',
    totalMumukshu: 'કુલ મુમુક્ષુ',
    downloadPDF: 'PDF ડાઉનલોડ',
    downloadExcel: 'Excel ડાઉનલોડ',
    phone: 'ફોન',
    age: 'ઉંમર',
    area: 'વિસ્તાર',
    address: 'સરનામું',
    car: 'કાર',
    updateProfile: 'પ્રોફાઇલ અપડેટ કરો',
    profileUpdated: 'પ્રોફાઇલ અપડેટ થઈ!',
    logout: 'લોગઆઉટ',
    yes: 'હા',
    no: 'ના',
    gridView: 'ગ્રિડ વ્યૂ',
    listView: 'લિસ્ટ વ્યૂ',
    showTop10: 'ટોપ 10 બતાવો',
    showAll: 'બધું બતાવો',
    previous: 'પહેલાં',
    next: 'આગળ',
    page: 'પાનું',
    of: 'માંથી',
  },
};

const UserDashboard = ({ user, onLogout, language, setLanguage }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('allVihars');
  const [vihars, setVihars] = useState([]);
  const [myVihars, setMyVihars] = useState([]);
  const [reportPeriod, setReportPeriod] = useState('weekly');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.name || '',
    photo: user.photo || '',
    age: user.age || '',
    area: user.area || '',
    address: user.address || '',
    car: user.car || false,
  });
  const [photoPreview, setPhotoPreview] = useState(user.photo || null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showTop10, setShowTop10] = useState(true); // Show top 10 entries
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Items per page for pagination
  const [dataLoaded, setDataLoaded] = useState({
    allVihars: false,
    myVihars: false,
    reports: false
  });

  useEffect(() => {
    if (activeTab === 'allVihars' && !dataLoaded.allVihars) {
      fetchAllVihars();
      setCurrentPage(1); // Reset to first page when switching tabs
    } else if (activeTab === 'myVihars' && !dataLoaded.myVihars) {
      fetchMyVihars();
      setCurrentPage(1); // Reset to first page when switching tabs
    } else if (activeTab === 'reports' && !dataLoaded.reports) {
      fetchReports();
    }
  }, [activeTab]);
  
  // Reset and fetch reports when period changes
  useEffect(() => {
    if (activeTab === 'reports') {
      setDataLoaded(prev => ({ ...prev, reports: false }));
      fetchReports();
    }
  }, [reportPeriod]);

  // Initialize photo preview when user data is available
  useEffect(() => {
    if (user.photo) {
      setPhotoPreview(user.photo);
      setProfileForm(prev => ({ ...prev, photo: user.photo }));
    }
  }, [user.photo]);

  const fetchAllVihars = async () => {
    setLoading(true);
    try {
      // Add pagination parameters for faster loading
      const response = await axiosInstance.get('/vihars?skip=0&limit=100');
      setVihars(response.data);
      setDataLoaded(prev => ({ ...prev, allVihars: true }));
    } catch (error) {
      toast.error('Failed to fetch vihars');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVihars = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/vihars/user/my-vihars');
      // Backend now only returns opted-in vihars, but filter here as well for safety
      const optedInVihars = response.data.filter(vihar => vihar.user_status === 'in');
      setMyVihars(optedInVihars);
      setDataLoaded(prev => ({ ...prev, myVihars: true }));
    } catch (error) {
      toast.error('Failed to fetch my vihars');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/reports/summary?period=${reportPeriod}`);
      setReportData(response.data);
      setDataLoaded(prev => ({ ...prev, reports: true }));
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axiosInstance.get(`/reports/download/pdf?period=${reportPeriod}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my_vihar_report_${reportPeriod}_${new Date().toISOString().split('T')[0]}.pdf`);
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
      const response = await axiosInstance.get(`/reports/download/excel?period=${reportPeriod}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my_vihar_report_${reportPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download Excel');
    }
  };

  const handleParticipation = async (viharId, status) => {
    try {
      await axiosInstance.post(`/vihars/${viharId}/participate`, { vihar_id: viharId, status });
      toast.success(t.participationUpdated);
      // Refresh both tabs to ensure consistency
      if (activeTab === 'allVihars') {
        setDataLoaded(prev => ({ ...prev, allVihars: false }));
        fetchAllVihars();
      } else if (activeTab === 'myVihars') {
        setDataLoaded(prev => ({ ...prev, myVihars: false, allVihars: false }));
        fetchMyVihars();
        // Also refresh all vihars to update status everywhere
        fetchAllVihars();
      }
    } catch (error) {
      toast.error('Failed to update participation');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileForm({ ...profileForm, photo: base64String });
        setPhotoPreview(base64String);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await axiosInstance.put('/users/me', {
        ...profileForm,
        age: profileForm.age ? parseInt(profileForm.age) : null,
      });
      toast.success(t.profileUpdated);
      // Update user object in parent component if needed
      // The user object will be refreshed on next login
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Filter, sort, and paginate vihars
  const getFilteredVihars = (viharList) => {
    let filtered = [...viharList];
    
    // Sort by route number (descending order - highest first)
    filtered.sort((a, b) => {
      const routeA = parseInt(a.route_no) || 0;
      const routeB = parseInt(b.route_no) || 0;
      // Descending order (highest route number first)
      return routeB - routeA;
    });
    
    return filtered;
  };

  // Get paginated vihars
  const getPaginatedVihars = (viharList) => {
    const filtered = getFilteredVihars(viharList);
    
    // Limit to top 10 if enabled
    const limited = showTop10 ? filtered.slice(0, 10) : filtered;
    
    // Calculate pagination
    const totalPages = Math.ceil(limited.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = limited.slice(startIndex, endIndex);
    
    return {
      vihars: paginated,
      totalPages,
      currentPage,
      totalItems: limited.length,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, limited.length)
    };
  };

  return (
    <div className="dashboard" data-testid="user-dashboard">
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
              <p>{user.area || 'User'}</p>
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
            className={`tab-btn ${activeTab === 'allVihars' ? 'active' : ''}`}
            onClick={() => setActiveTab('allVihars')}
            data-testid="all-vihars-tab"
          >
            {t.allVihars}
          </button>
          <button
            className={`tab-btn ${activeTab === 'myVihars' ? 'active' : ''}`}
            onClick={() => setActiveTab('myVihars')}
            data-testid="my-vihars-tab"
          >
            {t.myVihars}
          </button>
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
            data-testid="reports-tab"
          >
            {t.reports}
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            data-testid="profile-tab"
          >
            {t.profile}
          </button>
        </div>

        {/* All Vihars Tab */}
        {activeTab === 'allVihars' && (
          <div className="card">
            <h3>{t.allVihars}</h3>

            {/* Filter and View Controls */}
            {!loading && vihars.length > 0 && (
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
                      onChange={(e) => {
                        setShowTop10(e.target.checked);
                        setCurrentPage(1); // Reset to first page
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#7FA588' }}
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
                      background: viewMode === 'grid' ? '#7FA588' : 'transparent',
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
                      background: viewMode === 'list' ? '#7FA588' : 'transparent',
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
            )}

            {loading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : (() => {
              const paginationData = getPaginatedVihars(vihars);
              
              if (vihars.length === 0) {
                return (
                  <div className="empty-state">
                    <h3>No vihars available</h3>
                    <p>Check back later for new vihars</p>
                  </div>
                );
              }

              if (paginationData.vihars.length === 0) {
                return (
                  <div className="empty-state">
                    <h3>No vihars found</h3>
                    <p>Try changing the filters or pagination</p>
                  </div>
                );
              }

              // Grid View
              if (viewMode === 'grid') {
                return (
                  <>
                    <div className="vihar-grid">
                      {paginationData.vihars.map((vihar) => (
                  <div key={vihar.id} className="vihar-card" data-testid={`vihar-card-${vihar.id}`}>
                    <h4>{vihar.sahebji_name}</h4>
                    <p><strong>{t.routeNo}:</strong> {vihar.route_no}</p>
                    <p><strong>{t.gujaratiDate}:</strong> {vihar.gujarati_date}</p>
                    <p><strong>{t.viharDate}:</strong> {vihar.vihar_date}</p>
                    <p><strong>{t.viharTime}:</strong> {vihar.vihar_time}</p>
                    <p><strong>{t.fromUpashray}:</strong> {vihar.from_upashray}</p>
                    <p><strong>{t.toUpashray}:</strong> {vihar.to_upashray}</p>
                    <p><strong>{t.approxKms}:</strong> {vihar.approx_kms} km</p>
                    
                    {vihar.user_status && (
                      <span className={`status-badge ${vihar.user_status === 'in' ? 'status-in' : 'status-out'}`}>
                        {vihar.user_status === 'in' ? t.optIn : t.optOut}
                      </span>
                    )}
                    
                    <div className="btn-group" style={{ marginTop: '15px' }}>
                      <button
                        className={`btn-in ${vihar.user_status === 'in' ? 'active' : ''}`}
                        onClick={() => handleParticipation(vihar.id, 'in')}
                        disabled={vihar.user_status === 'in'}
                        data-testid={`opt-in-btn-${vihar.id}`}
                        style={{
                          opacity: vihar.user_status === 'in' ? 0.6 : 1,
                          cursor: vihar.user_status === 'in' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {vihar.user_status === 'in' ? '✓ ' : ''}{t.optIn}
                      </button>
                      <button
                        className={`btn-out ${vihar.user_status === 'out' ? 'active' : ''}`}
                        onClick={() => handleParticipation(vihar.id, 'out')}
                        disabled={vihar.user_status === 'out'}
                        data-testid={`opt-out-btn-${vihar.id}`}
                        style={{
                          opacity: vihar.user_status === 'out' ? 0.6 : 1,
                          cursor: vihar.user_status === 'out' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {vihar.user_status === 'out' ? '✓ ' : ''}{t.optOut}
                      </button>
                    </div>
                  </div>
                ))}
                    </div>

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
                          Showing {paginationData.startIndex} to {paginationData.endIndex} of {paginationData.totalItems} vihars
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '6px',
                              border: '2px solid #e0e0e0',
                              background: currentPage === 1 ? '#f5f5f5' : 'white',
                              color: currentPage === 1 ? '#999' : '#666',
                              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'all 0.2s'
                            }}
                          >
                            ← {t.previous}
                          </button>
                          <div style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            color: '#666',
                            fontWeight: '500'
                          }}>
                            {t.page} {currentPage} {t.of} {paginationData.totalPages}
                          </div>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(paginationData.totalPages, prev + 1))}
                            disabled={currentPage === paginationData.totalPages}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '6px',
                              border: '2px solid #e0e0e0',
                              background: currentPage === paginationData.totalPages ? '#f5f5f5' : 'white',
                              color: currentPage === paginationData.totalPages ? '#999' : '#666',
                              cursor: currentPage === paginationData.totalPages ? 'not-allowed' : 'pointer',
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
              }

              // List View
              return (
                <>
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
                          <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginationData.vihars.map((vihar) => (
                          <tr key={vihar.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '15px' }}>
                              <div style={{ fontWeight: '600', color: '#2C3E50' }}>
                                {vihar.vihar_date}
                              </div>
                              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                                {vihar.vihar_time}
                              </div>
                              <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                                {vihar.gujarati_date}
                              </div>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <div style={{ fontWeight: '600' }}>{vihar.route_no}</div>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <div>{vihar.sahebji_name || 'N/A'}</div>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <div style={{ fontSize: '14px' }}>
                                <div>📍 {vihar.from_upashray}</div>
                                <div style={{ margin: '4px 0', color: '#666' }}>↓</div>
                                <div>📍 {vihar.to_upashray}</div>
                              </div>
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                              <div style={{ fontWeight: '600', color: '#7FA588' }}>
                                {vihar.approx_kms} km
                              </div>
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                              {vihar.user_status && (
                                <span className={`status-badge ${vihar.user_status === 'in' ? 'status-in' : 'status-out'}`}>
                                  {vihar.user_status === 'in' ? '✓ In' : '✗ Out'}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '15px' }}>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <button
                                  className={`btn-in ${vihar.user_status === 'in' ? 'active' : ''}`}
                                  onClick={() => handleParticipation(vihar.id, 'in')}
                                  disabled={vihar.user_status === 'in'}
                                  style={{ 
                                    fontSize: '12px', 
                                    padding: '6px 12px',
                                    opacity: vihar.user_status === 'in' ? 0.6 : 1,
                                    cursor: vihar.user_status === 'in' ? 'not-allowed' : 'pointer'
                                  }}
                                  title="Opt In"
                                >
                                  {vihar.user_status === 'in' ? '✓' : ''} {t.optIn}
                                </button>
                                <button
                                  className={`btn-out ${vihar.user_status === 'out' ? 'active' : ''}`}
                                  onClick={() => handleParticipation(vihar.id, 'out')}
                                  disabled={vihar.user_status === 'out'}
                                  style={{ 
                                    fontSize: '12px', 
                                    padding: '6px 12px',
                                    opacity: vihar.user_status === 'out' ? 0.6 : 1,
                                    cursor: vihar.user_status === 'out' ? 'not-allowed' : 'pointer'
                                  }}
                                  title="Opt Out"
                                >
                                  {vihar.user_status === 'out' ? '✓' : ''} {t.optOut}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

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
                        Showing {paginationData.startIndex} to {paginationData.endIndex} of {paginationData.totalItems} vihars
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '2px solid #e0e0e0',
                            background: currentPage === 1 ? '#f5f5f5' : 'white',
                            color: currentPage === 1 ? '#999' : '#666',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                        >
                          ← {t.previous}
                        </button>
                        <div style={{
                          padding: '8px 16px',
                          fontSize: '14px',
                          color: '#666',
                          fontWeight: '500'
                        }}>
                          {t.page} {currentPage} {t.of} {paginationData.totalPages}
                        </div>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(paginationData.totalPages, prev + 1))}
                          disabled={currentPage === paginationData.totalPages}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '2px solid #e0e0e0',
                            background: currentPage === paginationData.totalPages ? '#f5f5f5' : 'white',
                            color: currentPage === paginationData.totalPages ? '#999' : '#666',
                            cursor: currentPage === paginationData.totalPages ? 'not-allowed' : 'pointer',
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

        {/* My Vihars Tab */}
        {activeTab === 'myVihars' && (
          <div className="card">
            <h3>{t.myVihars}</h3>

            {/* Filter and View Controls */}
            {!loading && myVihars.length > 0 && (
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
                      onChange={(e) => {
                        setShowTop10(e.target.checked);
                        setCurrentPage(1);
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#7FA588' }}
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
                      background: viewMode === 'grid' ? '#7FA588' : 'transparent',
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
                      background: viewMode === 'list' ? '#7FA588' : 'transparent',
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
            )}

            {loading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : (() => {
              const paginationData = getPaginatedVihars(myVihars);
              
              if (myVihars.length === 0) {
                return (
                  <div className="empty-state">
                    <h3>No vihars yet</h3>
                    <p>Opt in to vihars to see them here</p>
                  </div>
                );
              }

              if (paginationData.vihars.length === 0) {
                return (
                  <div className="empty-state">
                    <h3>No vihars found</h3>
                    <p>Try changing the filters or pagination</p>
                  </div>
                );
              }

              // Grid View
              if (viewMode === 'grid') {
                return (
                  <>
                    <div className="vihar-grid">
                      {paginationData.vihars.map((vihar) => (
                        <div key={vihar.id} className="vihar-card" data-testid={`my-vihar-card-${vihar.id}`}>
                          <h4>{vihar.sahebji_name}</h4>
                          <p><strong>{t.routeNo}:</strong> {vihar.route_no}</p>
                          <p><strong>{t.gujaratiDate}:</strong> {vihar.gujarati_date}</p>
                          <p><strong>{t.viharDate}:</strong> {vihar.vihar_date} at {vihar.vihar_time}</p>
                          <p><strong>{t.fromUpashray}:</strong> {vihar.from_upashray}</p>
                          <p><strong>{t.toUpashray}:</strong> {vihar.to_upashray}</p>
                          <p><strong>{t.approxKms}:</strong> {vihar.approx_kms} km</p>
                          <span className={`status-badge ${vihar.user_status === 'in' ? 'status-in' : 'status-out'}`}>
                            {vihar.user_status === 'in' ? t.optIn : t.optOut}
                          </span>
                          <div className="btn-group" style={{ marginTop: '15px' }}>
                            <button
                              className={`btn-out ${vihar.user_status === 'out' ? 'active' : ''}`}
                              onClick={() => handleParticipation(vihar.id, 'out')}
                              disabled={vihar.user_status === 'out'}
                              data-testid={`opt-out-btn-${vihar.id}`}
                              style={{
                                opacity: vihar.user_status === 'out' ? 0.6 : 1,
                                cursor: vihar.user_status === 'out' ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {vihar.user_status === 'out' ? '✓ ' : ''}{t.optOut}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

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
                          Showing {paginationData.startIndex} to {paginationData.endIndex} of {paginationData.totalItems} vihars
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '6px',
                              border: '2px solid #e0e0e0',
                              background: currentPage === 1 ? '#f5f5f5' : 'white',
                              color: currentPage === 1 ? '#999' : '#666',
                              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'all 0.2s'
                            }}
                          >
                            ← {t.previous}
                          </button>
                          <div style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            color: '#666',
                            fontWeight: '500'
                          }}>
                            {t.page} {currentPage} {t.of} {paginationData.totalPages}
                          </div>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(paginationData.totalPages, prev + 1))}
                            disabled={currentPage === paginationData.totalPages}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '6px',
                              border: '2px solid #e0e0e0',
                              background: currentPage === paginationData.totalPages ? '#f5f5f5' : 'white',
                              color: currentPage === paginationData.totalPages ? '#999' : '#666',
                              cursor: currentPage === paginationData.totalPages ? 'not-allowed' : 'pointer',
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
              }

              // List View
              return (
                <>
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
                          <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginationData.vihars.map((vihar) => (
                          <tr key={vihar.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '15px' }}>
                              <div style={{ fontWeight: '600', color: '#2C3E50' }}>
                                {vihar.vihar_date}
                              </div>
                              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                                {vihar.vihar_time}
                              </div>
                              <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                                {vihar.gujarati_date}
                              </div>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <div style={{ fontWeight: '600' }}>{vihar.route_no}</div>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <div>{vihar.sahebji_name || 'N/A'}</div>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <div style={{ fontSize: '14px' }}>
                                <div>📍 {vihar.from_upashray}</div>
                                <div style={{ margin: '4px 0', color: '#666' }}>↓</div>
                                <div>📍 {vihar.to_upashray}</div>
                              </div>
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                              <div style={{ fontWeight: '600', color: '#7FA588' }}>
                                {vihar.approx_kms} km
                              </div>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <button
                                  className={`btn-out ${vihar.user_status === 'out' ? 'active' : ''}`}
                                  onClick={() => handleParticipation(vihar.id, 'out')}
                                  disabled={vihar.user_status === 'out'}
                                  style={{ 
                                    fontSize: '12px', 
                                    padding: '6px 12px',
                                    opacity: vihar.user_status === 'out' ? 0.6 : 1,
                                    cursor: vihar.user_status === 'out' ? 'not-allowed' : 'pointer'
                                  }}
                                  title="Opt Out"
                                >
                                  {vihar.user_status === 'out' ? '✓' : ''} {t.optOut}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

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
                        Showing {paginationData.startIndex} to {paginationData.endIndex} of {paginationData.totalItems} vihars
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '2px solid #e0e0e0',
                            background: currentPage === 1 ? '#f5f5f5' : 'white',
                            color: currentPage === 1 ? '#999' : '#666',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                        >
                          ← {t.previous}
                        </button>
                        <div style={{
                          padding: '8px 16px',
                          fontSize: '14px',
                          color: '#666',
                          fontWeight: '500'
                        }}>
                          {t.page} {currentPage} {t.of} {paginationData.totalPages}
                        </div>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(paginationData.totalPages, prev + 1))}
                          disabled={currentPage === paginationData.totalPages}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '2px solid #e0e0e0',
                            background: currentPage === paginationData.totalPages ? '#f5f5f5' : 'white',
                            color: currentPage === paginationData.totalPages ? '#999' : '#666',
                            cursor: currentPage === paginationData.totalPages ? 'not-allowed' : 'pointer',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
              <h3 style={{ margin: 0 }}>{t.reports}</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
            <div className="tabs" style={{ marginBottom: '20px' }}>
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
                  <div className="summary-card">
                    <h4>{t.totalThana}</h4>
                    <p data-testid="total-thana-count">{reportData.total_thana || 0}</p>
                  </div>
                  <div className="summary-card">
                    <h4>{t.totalSadhuBhagvant}</h4>
                    <p data-testid="total-sadhu-bhagvant-count">{reportData.total_sadhu_bhagvant || 0}</p>
                  </div>
                  <div className="summary-card">
                    <h4>{t.totalSadhvijiBhagvant}</h4>
                    <p data-testid="total-sadhviji-bhagvant-count">{reportData.total_sadhviji_bhagvant || 0}</p>
                  </div>
                  <div className="summary-card">
                    <h4>{t.totalMumukshu}</h4>
                    <p data-testid="total-mumukshu-count">{reportData.total_mumukshu || 0}</p>
                  </div>
                </div>

                <div className="vihar-grid">
                  {[...reportData.vihars].sort((a, b) => {
                    // Sort by route number (descending order - highest first)
                    const routeA = parseInt(a.route_no) || 0;
                    const routeB = parseInt(b.route_no) || 0;
                    return routeB - routeA; // Descending order (highest route number first)
                  }).map((vihar) => (
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card">
            <h3>{t.profile}</h3>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              {/* Left Side - Form */}
              <div style={{ flex: '1', minWidth: '300px', maxWidth: '600px' }}>
                <div className="form-group">
                  <label>{t.phone}</label>
                  <input type="text" value={user.phone} disabled />
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    data-testid="profile-name-input"
                  />
                </div>
                <div className="form-group">
                  <label>Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    data-testid="profile-photo-input"
                    style={{ padding: '8px' }}
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Select an image file (max 5MB)
                  </p>
                </div>
                <div className="form-group">
                  <label>{t.age}</label>
                  <input
                    type="number"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    data-testid="profile-age-input"
                  />
                </div>
                <div className="form-group">
                  <label>{t.area}</label>
                  <input
                    type="text"
                    value={profileForm.area}
                    onChange={(e) => setProfileForm({ ...profileForm, area: e.target.value })}
                    data-testid="profile-area-input"
                  />
                </div>
                <div className="form-group">
                  <label>{t.address}</label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    rows="3"
                    data-testid="profile-address-input"
                  />
                </div>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    checked={profileForm.car}
                    onChange={(e) => setProfileForm({ ...profileForm, car: e.target.checked })}
                    data-testid="profile-car-checkbox"
                  />
                  <label>{t.car}</label>
                </div>
                <button className="btn btn-primary" onClick={handleUpdateProfile} disabled={loading} data-testid="update-profile-btn">
                  {loading ? 'Updating...' : t.updateProfile}
                </button>
              </div>

              {/* Right Side - Photo Preview */}
              <div style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h4 style={{ marginBottom: '15px', textAlign: 'center' }}>Photo Preview</h4>
                {photoPreview ? (
                  <div style={{
                    width: '250px',
                    height: '250px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '2px solid #ddd',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={photoPreview}
                      alt="Profile Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      data-testid="profile-photo-preview"
                    />
                  </div>
                ) : (
                  <div style={{
                    width: '250px',
                    height: '250px',
                    borderRadius: '8px',
                    border: '2px dashed #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f9f9f9',
                    color: '#999'
                  }}>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <p style={{ fontSize: '48px', margin: '0' }}>📷</p>
                      <p style={{ marginTop: '10px' }}>No photo selected</p>
                      <p style={{ fontSize: '12px', marginTop: '5px' }}>Select an image to preview</p>
                    </div>
                  </div>
                )}
                {photoPreview && (
                  <button
                    className="btn-small"
                    onClick={() => {
                      setPhotoPreview(null);
                      setProfileForm({ ...profileForm, photo: '' });
                    }}
                    style={{ marginTop: '15px', background: '#dc3545', color: 'white' }}
                    data-testid="remove-photo-btn"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
