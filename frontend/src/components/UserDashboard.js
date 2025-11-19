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
    sahebjiName: 'Sahebji Name',
    viharDate: 'Vihar Date',
    viharTime: 'Time',
    fromUpashray: 'From',
    toUpashray: 'To',
    approxKms: 'KMs',
    optIn: 'Opt In',
    optOut: 'Opt Out',
    participationUpdated: 'Participation updated!',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    totalVihars: 'Total Vihars',
    totalKms: 'Total KMs Covered',
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
  },
  gu: {
    dashboard: 'યુઝર ડેશબોર્ડ',
    allVihars: 'તમામ વિહારો',
    myVihars: 'મારા વિહારો',
    reports: 'મારા રિપોર્ટ્સ',
    profile: 'પ્રોફાઇલ',
    routeNo: 'રૂટ નંબર',
    gujaratiDate: 'ગુજરાતી તારીખ',
    sahebjiName: 'સાહેબજીનું નામ',
    viharDate: 'વિહાર તારીખ',
    viharTime: 'સમય',
    fromUpashray: 'થી',
    toUpashray: 'સુધી',
    approxKms: 'કિ.મી.',
    optIn: 'જોડાઓ',
    optOut: 'છોડો',
    participationUpdated: 'ભાગીદારી અપડેટ થઈ!',
    weekly: 'સાપ્તાહિક',
    monthly: 'માસિક',
    yearly: 'વાર્ષિક',
    totalVihars: 'કુલ વિહારો',
    totalKms: 'કુલ કિ.મી.',
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
    photo: user.photo || '',
    age: user.age || '',
    area: user.area || '',
    address: user.address || '',
    car: user.car || false,
  });

  useEffect(() => {
    if (activeTab === 'allVihars') {
      fetchAllVihars();
    } else if (activeTab === 'myVihars') {
      fetchMyVihars();
    } else if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, reportPeriod]);

  const fetchAllVihars = async () => {
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

  const fetchMyVihars = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/vihars/user/my-vihars');
      setMyVihars(response.data);
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
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipation = async (viharId, status) => {
    try {
      await axiosInstance.post(`/vihars/${viharId}/participate`, { vihar_id: viharId, status });
      toast.success(t.participationUpdated);
      if (activeTab === 'allVihars') {
        fetchAllVihars();
      } else {
        fetchMyVihars();
      }
    } catch (error) {
      toast.error('Failed to update participation');
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
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard" data-testid="user-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <img src="https://customer-assets.emergentagent.com/job_72a57afd-ffc1-4052-ab3e-887263a4efab/artifacts/lmq07cni_vsg%20group%20logo.png" alt="VSG Logo" />
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
            {loading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : vihars.length === 0 ? (
              <div className="empty-state">
                <h3>No vihars available</h3>
                <p>Check back later for new vihars</p>
              </div>
            ) : (
              <div className="vihar-grid">
                {vihars.map((vihar) => (
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
                    
                    <div className="btn-group">
                      <button
                        className="btn-in"
                        onClick={() => handleParticipation(vihar.id, 'in')}
                        data-testid={`opt-in-btn-${vihar.id}`}
                      >
                        {t.optIn}
                      </button>
                      <button
                        className="btn-out"
                        onClick={() => handleParticipation(vihar.id, 'out')}
                        data-testid={`opt-out-btn-${vihar.id}`}
                      >
                        {t.optOut}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Vihars Tab */}
        {activeTab === 'myVihars' && (
          <div className="card">
            <h3>{t.myVihars}</h3>
            {loading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : myVihars.length === 0 ? (
              <div className="empty-state">
                <h3>No vihars yet</h3>
                <p>Opt in to vihars to see them here</p>
              </div>
            ) : (
              <div className="vihar-grid">
                {myVihars.map((vihar) => (
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="card">
            <h3>{t.reports}</h3>
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card">
            <h3>{t.profile}</h3>
            <div style={{ maxWidth: '600px' }}>
              <div className="form-group">
                <label>{t.phone}</label>
                <input type="text" value={user.phone} disabled />
              </div>
              <div className="form-group">
                <label>Photo URL</label>
                <input
                  type="text"
                  value={profileForm.photo}
                  onChange={(e) => setProfileForm({ ...profileForm, photo: e.target.value })}
                  data-testid="profile-photo-input"
                />
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
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
