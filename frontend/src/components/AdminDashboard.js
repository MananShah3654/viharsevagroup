import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

const translations = {
  en: {
    dashboard: 'Admin Dashboard',
    vihars: 'Vihars',
    users: 'Users',
    reports: 'Reports',
    createVihar: 'Create New Vihar',
    routeNo: 'Route Number',
    gujaratiDate: 'Gujarati Calendar Date',
    sahebjiName: 'Sahebji Name',
    viharDate: 'Vihar Date',
    viharTime: 'Vihar Time',
    sadhuBhagvant: 'Sadhu Bhagvant Count',
    wheelchair: 'Wheelchair Required',
    luggage: 'Luggage',
    carRequired: 'Car Required for Luggage',
    fromUpashray: 'From Upashray',
    toUpashray: 'To Upashray',
    approxKms: 'Approx KMs',
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
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    totalVihars: 'Total Vihars',
    totalKms: 'Total KMs Covered',
    viharCreated: 'Vihar created successfully!',
    userCreated: 'User created successfully!',
    roleUpdated: 'Role updated successfully!',
    logout: 'Logout',
  },
  gu: {
    dashboard: 'એડમિન ડેશબોર્ડ',
    vihars: 'વિહારો',
    users: 'યુઝર્સ',
    reports: 'રિપોર્ટ્સ',
    createVihar: 'નવો વિહાર બનાવો',
    routeNo: 'રૂટ નંબર',
    gujaratiDate: 'ગુજરાતી કેલેન્ડર તારીખ',
    sahebjiName: 'સાહેબજીનું નામ',
    viharDate: 'વિહાર તારીખ',
    viharTime: 'વિહાર સમય',
    sadhuBhagvant: 'સાધુ ભગવંત સંખ્યા',
    wheelchair: 'વ્હીલચેર જરૂરી',
    luggage: 'સામાન',
    carRequired: 'સામાન માટે કાર જરૂરી',
    fromUpashray: 'ઉપાશ્રયથી',
    toUpashray: 'ઉપાશ્રય સુધી',
    approxKms: 'અંદાજિત કિ.મી.',
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
    weekly: 'સાપ્તાહિક',
    monthly: 'માસિક',
    yearly: 'વાર્ષિક',
    totalVihars: 'કુલ વિહારો',
    totalKms: 'કુલ કિ.મી. કવર કર્યા',
    viharCreated: 'વિહાર સફળતાપૂર્વક બનાવ્યો!',
    userCreated: 'યુઝર સફળતાપૂર્વક બનાવ્યો!',
    roleUpdated: 'ભૂમિકા અપડેટ થઈ!',
    logout: 'લોગઆઉટ',
  },
};

const AdminDashboard = ({ user, onLogout, language, setLanguage }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('vihars');
  const [showCreateVihar, setShowCreateVihar] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [vihars, setVihars] = useState([]);
  const [users, setUsers] = useState([]);
  const [reportPeriod, setReportPeriod] = useState('weekly');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Vihar form
  const [viharForm, setViharForm] = useState({
    route_no: '',
    gujarati_date: '',
    sahebji_name: '',
    vihar_date: '',
    vihar_time: '',
    sadhu_bhagvant: '',
    wheelchair: false,
    luggage: false,
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
  });

  useEffect(() => {
    if (activeTab === 'vihars') {
      fetchVihars();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, reportPeriod]);

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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
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

  const handleCreateVihar = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/vihars', {
        ...viharForm,
        sadhu_bhagvant: parseInt(viharForm.sadhu_bhagvant),
        approx_kms: parseFloat(viharForm.approx_kms),
      });
      
      if (response.status === 200) {
        toast.success(t.viharCreated);
        setShowCreateVihar(false);
        setViharForm({
          route_no: '',
          gujarati_date: '',
          sahebji_name: '',
          vihar_date: '',
          vihar_time: '',
          sadhu_bhagvant: '',
          wheelchair: false,
          luggage: false,
          car_required: false,
          from_upashray: '',
          to_upashray: '',
          approx_kms: '',
        });
        fetchVihars();
      }
    } catch (error) {
      console.error('Error creating vihar:', error);
      toast.error(error.response?.data?.detail || 'Failed to create vihar');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/admin/users', {
        ...userForm,
        age: userForm.age ? parseInt(userForm.age) : null,
      });
      toast.success(t.userCreated);
      setShowAddUser(false);
      setUserForm({ phone: '', password: '', name: '', age: '', area: '', address: '', car: false });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await axiosInstance.put('/admin/users/role', { user_id: userId, role: newRole });
      toast.success(t.roleUpdated);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="dashboard" data-testid="admin-dashboard">
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

        {/* Vihars Tab */}
        {activeTab === 'vihars' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>{t.allVihars}</h3>
              <button className="btn btn-primary" onClick={() => setShowCreateVihar(true)} data-testid="create-vihar-btn">
                {t.createVihar}
              </button>
            </div>

            {showCreateVihar && (
              <div className="card" style={{ background: 'rgba(168, 198, 159, 0.1)', marginBottom: '20px' }}>
                <h3>{t.createVihar}</h3>
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
                    <label>{t.gujaratiDate}</label>
                    <input
                      type="text"
                      value={viharForm.gujarati_date}
                      onChange={(e) => setViharForm({ ...viharForm, gujarati_date: e.target.value })}
                      data-testid="gujarati-date-input"
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
                    <input
                      type="number"
                      step="0.1"
                      value={viharForm.approx_kms}
                      onChange={(e) => setViharForm({ ...viharForm, approx_kms: e.target.value })}
                      data-testid="approx-kms-input"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={viharForm.wheelchair}
                      onChange={(e) => setViharForm({ ...viharForm, wheelchair: e.target.checked })}
                      data-testid="wheelchair-checkbox"
                    />
                    <label>{t.wheelchair}</label>
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
                  {viharForm.luggage && (
                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        checked={viharForm.car_required}
                        onChange={(e) => setViharForm({ ...viharForm, car_required: e.target.checked })}
                        data-testid="car-required-checkbox"
                      />
                      <label>{t.carRequired}</label>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button className="btn btn-primary" onClick={handleCreateVihar} disabled={loading} data-testid="submit-vihar-btn">
                    {t.create}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowCreateVihar(false)} data-testid="cancel-vihar-btn">
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : vihars.length === 0 ? (
              <div className="empty-state">
                <h3>No vihars yet</h3>
                <p>Create your first vihar to get started</p>
              </div>
            ) : (
              <div className="vihar-grid">
                {vihars.map((vihar) => (
                  <div key={vihar.id} className="vihar-card" data-testid={`vihar-card-${vihar.id}`}>
                    <h4>{vihar.sahebji_name}</h4>
                    <p><strong>{t.routeNo}:</strong> {vihar.route_no}</p>
                    <p><strong>{t.gujaratiDate}:</strong> {vihar.gujarati_date}</p>
                    <p><strong>{t.viharDate}:</strong> {vihar.vihar_date} at {vihar.vihar_time}</p>
                    <p><strong>{t.fromUpashray}:</strong> {vihar.from_upashray}</p>
                    <p><strong>{t.toUpashray}:</strong> {vihar.to_upashray}</p>
                    <p><strong>{t.approxKms}:</strong> {vihar.approx_kms} km</p>
                    <p><strong>{t.sadhuBhagvant}:</strong> {vihar.sadhu_bhagvant}</p>
                    {vihar.wheelchair && <span className="status-badge status-in">♿ {t.wheelchair}</span>}
                    {vihar.luggage && <span className="status-badge status-out">🧳 {t.luggage}</span>}
                  </div>
                ))}
              </div>
            )}
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
                <h3>{t.addUser}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  <div className="form-group">
                    <label>{t.phone}</label>
                    <input
                      type="tel"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      data-testid="user-phone-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      data-testid="user-password-input"
                    />
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
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button className="btn btn-primary" onClick={handleAddUser} disabled={loading} data-testid="submit-user-btn">
                    {t.create}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowAddUser(false)} data-testid="cancel-user-btn">
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t.phone}</th>
                    <th>{t.age}</th>
                    <th>{t.area}</th>
                    <th>Car</th>
                    <th>{t.role}</th>
                    <th>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} data-testid={`user-row-${u.id}`}>
                      <td>{u.phone}</td>
                      <td>{u.age || 'N/A'}</td>
                      <td>{u.area || 'N/A'}</td>
                      <td>{u.car ? 'Yes' : 'No'}</td>
                      <td><strong>{u.role}</strong></td>
                      <td>
                        {u.role === 'user' ? (
                          <button
                            className="btn-action btn-edit"
                            onClick={() => handleUpdateRole(u.id, 'admin')}
                            data-testid={`make-admin-btn-${u.id}`}
                          >
                            {t.makeAdmin}
                          </button>
                        ) : u.phone !== user.phone ? (
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleUpdateRole(u.id, 'user')}
                            data-testid={`make-user-btn-${u.id}`}
                          >
                            {t.makeUser}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
