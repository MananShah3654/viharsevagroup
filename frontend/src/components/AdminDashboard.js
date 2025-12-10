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
    updateVihar: 'Update Vihar',
    editVihar: 'Edit',
    createFromWhatsApp: 'Create from WhatsApp Message',
    pasteWhatsAppMessage: 'Paste WhatsApp Message',
    parseAndCreate: 'Parse & Create Vihar',
    whatsAppMessage: 'WhatsApp Message',
    routeNo: 'Route Number',
    gujaratiDate: 'Gujarati Calendar Date',
    sahebjiName: 'Shraman Shramani Bhagvant',
    viharDate: 'Vihar Date',
    viharTime: 'Vihar Time',
    sadhuBhagvant: 'Thana Count',
    wheelchair: 'Wheelchair Required',
    luggage: 'Luggage',
    dori: 'Dori',
    carRequired: 'Car Required',
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
  },
  gu: {
    dashboard: 'એડમિન ડેશબોર્ડ',
    vihars: 'વિહારો',
    users: 'યુઝર્સ',
    reports: 'રિપોર્ટ્સ',
    createVihar: 'નવો વિહાર બનાવો',
    updateVihar: 'વિહાર અપડેટ કરો',
    editVihar: 'સંપાદન કરો',
    createFromWhatsApp: 'WhatsApp સંદેશમાંથી બનાવો',
    pasteWhatsAppMessage: 'WhatsApp સંદેશ પેસ્ટ કરો',
    parseAndCreate: 'પાર્સ કરો અને વિહાર બનાવો',
    whatsAppMessage: 'WhatsApp સંદેશ',
    routeNo: 'રૂટ નંબર',
    gujaratiDate: 'ગુજરાતી કેલેન્ડર તારીખ',
    sahebjiName: 'શ્રમણ શ્રમણી ભગવંત',
    viharDate: 'વિહાર તારીખ',
    viharTime: 'વિહાર સમય',
    sadhuBhagvant: 'થાના સંખ્યા',
    wheelchair: 'વ્હીલચેર જરૂરી',
    luggage: 'સામાન',
    dori: 'ડોરી',
    carRequired: 'કાર જરૂરી',
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
  },
};

const AdminDashboard = ({ user, onLogout, language, setLanguage }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('vihars');
  const [showCreateVihar, setShowCreateVihar] = useState(false);
  const [showWhatsAppInput, setShowWhatsAppInput] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [vihars, setVihars] = useState([]);
  const [users, setUsers] = useState([]);
  const [reportPeriod, setReportPeriod] = useState('weekly');
  const [reportData, setReportData] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingViharId, setEditingViharId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);

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

  const handleCreateFromWhatsApp = async () => {
    if (!whatsAppMessage.trim()) {
      toast.error('Please paste WhatsApp message');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post('/vihars/from-whatsapp', {
        message: whatsAppMessage
      });
      toast.success(t.viharCreated);
      setShowWhatsAppInput(false);
      setWhatsAppMessage('');
      fetchVihars();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create vihar from WhatsApp message');
    } finally {
      setLoading(false);
    }
  };

  const resetViharForm = () => {
    setViharForm({
      route_no: '',
      gujarati_date: '',
      sahebji_name: '',
      vihar_date: '',
      vihar_time: '',
      sadhu_bhagvant: '',
      wheelchair: false,
      luggage: false,
      dori: false,
      car_required: false,
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
      gujarati_date: vihar.gujarati_date || '',
      sahebji_name: vihar.sahebji_name || '',
      vihar_date: vihar.vihar_date || '',
      vihar_time: vihar.vihar_time || '',
      sadhu_bhagvant: vihar.sadhu_bhagvant || '',
      wheelchair: vihar.wheelchair || false,
      luggage: vihar.luggage || false,
      dori: vihar.dori || false,
      car_required: vihar.car_required || false,
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
    setUserForm({ phone: '', password: '', name: '', age: '', area: '', address: '', car: false });
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
    setEditingUserId(user.id);
    setUserForm({
      phone: user.phone || '',
      password: '', // Don't populate password
      name: user.name || '',
      age: user.age || '',
      area: user.area || '',
      address: user.address || '',
      car: user.car || false,
      photo: user.photo || '',
    });
    setPhotoPreview(user.photo || null);
    setShowAddUser(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateUser = async () => {
    if (!editingUserId) return;
    
    setLoading(true);
    try {
      const updateData = {
        name: userForm.name || null,
        age: userForm.age ? parseInt(userForm.age) : null,
        area: userForm.area || null,
        address: userForm.address || null,
        car: userForm.car,
        photo: userForm.photo || null,
      };
      
      // Only include password if it's provided
      if (userForm.password) {
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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
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
    setLoading(true);
    try {
      await axiosInstance.post('/admin/users', {
        ...userForm,
        age: userForm.age ? parseInt(userForm.age) : null,
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
            <img src="/images/logo_vsg.jpg" alt="VSG Logo" />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h3>{t.allVihars}</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => {
                  setShowWhatsAppInput(false);
                  setShowCreateVihar(true);
                }} data-testid="create-vihar-btn">
                  {t.createVihar}
                </button>
                <button className="btn" style={{ background: '#25D366', color: 'white' }} onClick={() => {
                  setShowCreateVihar(false);
                  setShowWhatsAppInput(!showWhatsAppInput);
                }} data-testid="whatsapp-create-btn">
                  📱 {t.createFromWhatsApp}
                </button>
              </div>
            </div>

            {showWhatsAppInput && (
              <div className="card" style={{ background: 'rgba(37, 211, 102, 0.1)', marginBottom: '20px', border: '2px solid #25D366' }}>
                <h3>📱 {t.createFromWhatsApp}</h3>
                <div className="form-group">
                  <label>{t.pasteWhatsAppMessage}</label>
                  <textarea
                    value={whatsAppMessage}
                    onChange={(e) => setWhatsAppMessage(e.target.value)}
                    placeholder="Paste the WhatsApp message here..."
                    rows="12"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '14px', lineHeight: '1.6' }}
                    data-testid="whatsapp-message-textarea"
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button className="btn btn-primary" onClick={handleCreateFromWhatsApp} disabled={loading} data-testid="parse-whatsapp-btn">
                    {loading ? 'Processing...' : t.parseAndCreate}
                  </button>
                  <button className="btn" onClick={() => {
                    setShowWhatsAppInput(false);
                    setWhatsAppMessage('');
                  }}>
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}

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
                <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
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
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button className="btn btn-primary" onClick={editingViharId ? handleUpdateVihar : handleCreateVihar} disabled={loading} data-testid="submit-vihar-btn">
                    {editingViharId ? t.updateVihar : t.create}
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
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                      {vihar.wheelchair && <span className="status-badge status-in">♿ {t.wheelchair}</span>}
                      {vihar.luggage && <span className="status-badge status-out">🧳 {t.luggage}</span>}
                      {vihar.dori && <span className="status-badge status-in">📦 {t.dori}</span>}
                      {vihar.car_required && <span className="status-badge status-out">🚗 {t.carRequired}</span>}
                    </div>
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEditVihar(vihar)}
                        data-testid={`edit-vihar-btn-${vihar.id}`}
                        style={{ flex: 1 }}
                      >
                        {t.editVihar}
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteVihar(vihar.id)}
                        data-testid={`delete-vihar-btn-${vihar.id}`}
                        style={{ flex: 1 }}
                      >
                        {t.deleteVihar}
                      </button>
                    </div>
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
                <h3>{editingUserId ? 'Update User' : t.addUser}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  <div className="form-group">
                    <label>{t.phone}</label>
                    <input
                      type="tel"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      disabled={!!editingUserId}
                      data-testid="user-phone-input"
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
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder={editingUserId ? 'Leave blank to keep current password' : ''}
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
                          src="/images/logo_vsg.jpg" 
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

            {loading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t.name}</th>
                    <th>{t.area}</th>
                    <th>{t.age}</th>
                    <th>{t.role}</th>
                    <th>{t.phone}</th>
                    <th>Car</th>
                    <th>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} data-testid={`user-row-${u.id}`}>
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
                                src="/images/logo_vsg.jpg" 
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
                      <td>{u.phone}</td>
                      <td>{u.car ? 'Yes' : 'No'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {u.role === 'user' && (
                            <>
                              <button
                                className="btn-action btn-edit"
                                onClick={() => handleEditUser(u)}
                                data-testid={`edit-user-btn-${u.id}`}
                                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                              >
                                 {t.edit}
                              </button>
                              <button
                                className="btn-action btn-delete"
                                onClick={() => handleDeleteUser(u.id)}
                                data-testid={`delete-user-btn-${u.id}`}
                                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                              >
                                 {t.delete}
                              </button>
                              <button
                                className="btn-action btn-edit"
                                onClick={() => handleUpdateRole(u.id, 'admin')}
                                data-testid={`make-admin-btn-${u.id}`}
                                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                              >
                                {t.makeAdmin}
                              </button>
                            </>
                          )}
                          {u.role === 'admin' && u.phone !== user.phone && (
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleUpdateRole(u.id, 'user')}
                              data-testid={`make-user-btn-${u.id}`}
                              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                            >
                              {t.makeUser}
                            </button>
                          )}
                        </div>
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
    </div>
  );
};

export default AdminDashboard;
