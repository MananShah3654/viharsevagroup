import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routeData, getRoute1, getAllLocations, getRouteConnections, getAllCenters } from '../data/viharRoutesData';
import { axiosInstance } from '../App';
import './ViharPathMargdarshika.css';

const translations = {
  en: {
    title: 'Vihar Path Margdarshika',
    selectRoute: 'Select Route',
    from: 'From',
    to: 'To',
    search: 'Search',
    centers: 'Centers',
    noCenters: 'No centers found for this route',
    placeName: 'Place Name',
    villageName: 'Village Name',
    type: 'Type',
    kms: 'KMs',
    personName: 'Person Name',
    phoneNo: 'Phone No',
    backToHome: 'Back to Home',
    downloadPDF: 'Download PDF Guide',
    viewRoutes: 'View All Routes',
    routeNetwork: 'Route Network',
    allCenters: 'All Centers',
    totalRoutes: 'Total Routes',
    totalCenters: 'Total Centers',
    routeDetails: 'Route Details',
    showRoute: 'Show Route',
  },
  gu: {
    title: 'વિહાર પથ માર્ગદર્શિકા',
    selectRoute: 'રૂટ પસંદ કરો',
    from: 'થી',
    to: 'સુધી',
    search: 'શોધો',
    centers: 'કેન્દ્રો',
    noCenters: 'આ રૂટ માટે કોઈ કેન્દ્ર મળ્યું નથી',
    placeName: 'સ્થળનું નામ',
    villageName: 'ગામનું નામ',
    type: 'પ્રકાર',
    kms: 'કિ.મી.',
    personName: 'વ્યક્તિનું નામ',
    phoneNo: 'ફોન નંબર',
    backToHome: 'હોમ પર પાછા જાઓ',
    downloadPDF: 'PDF માર્ગદર્શિકા ડાઉનલોડ કરો',
    viewRoutes: 'બધા રૂટ જુઓ',
    routeNetwork: 'રૂટ નેટવર્ક',
    allCenters: 'બધા કેન્દ્રો',
    totalRoutes: 'કુલ રૂટ',
    totalCenters: 'કુલ કેન્દ્રો',
    routeDetails: 'રૂટ વિગતો',
    showRoute: 'રૂટ બતાવો',
  },
};


const ViharPathMargdarshika = ({ language, setLanguage }) => {
  const t = translations[language];
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'network', 'centers'
  const [loading, setLoading] = useState(false);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  
  const route1 = getRoute1();
  const locations = getAllLocations();
  const routeConnections = getRouteConnections();
  const allCentersList = getAllCenters();
  
  // Auto-select first and last locations when route1 loads
  useEffect(() => {
    if (route1 && route1.centers.length > 0) {
      setFromLocation(route1.centers[0].placeName);
      setToLocation(route1.centers[route1.centers.length - 1].placeName);
    }
  }, [route1]);
  
  // Filter centers based on selected from/to locations
  const selectedCenters = useMemo(() => {
    if (!route1 || !fromLocation || !toLocation) return route1 ? route1.centers : [];
    
    const fromIndex = route1.centers.findIndex(c => c.placeName === fromLocation);
    const toIndex = route1.centers.findIndex(c => c.placeName === toLocation);
    
    if (fromIndex === -1 || toIndex === -1) return [];
    
    // Get centers between from and to (inclusive)
    const startIndex = Math.min(fromIndex, toIndex);
    const endIndex = Math.max(fromIndex, toIndex);
    
    return route1.centers.slice(startIndex, endIndex + 1);
  }, [route1, fromLocation, toLocation]);
  
  // Calculate total distance for selected segment
  const selectedTotalKms = useMemo(() => {
    if (selectedCenters.length === 0) return 0;
    const firstCenter = selectedCenters[0];
    const lastCenter = selectedCenters[selectedCenters.length - 1];
    return lastCenter.cumulativeKms - firstCenter.cumulativeKms + firstCenter.kms;
  }, [selectedCenters]);
  
  const handleDownloadPDF = async () => {
    if (!route1 || !fromLocation || !toLocation) {
      alert(language === 'en' ? 'Please select both From and To locations' : 'કૃપા કરીને થી અને સુધી બંને સ્થાનો પસંદ કરો');
      return;
    }
    
    if (selectedCenters.length === 0) {
      alert(language === 'en' ? 'No centers found for selected route' : 'પસંદ કરેલા રૂટ માટે કોઈ કેન્દ્ર મળ્યું નથી');
      return;
    }
    
    setLoading(true);
    const startTime = Date.now();
    console.log('Starting PDF generation at:', new Date().toISOString());
    
    try {
      // Create filtered route data for PDF
      const filteredRoute = {
        routeNumber: route1.routeNumber,
        routeName: route1.routeName,
        from: fromLocation,
        to: toLocation,
        totalKms: selectedTotalKms,
        centers: selectedCenters.map(center => ({
          placeName: center.placeName || '',
          villageName: center.villageName || '',
          kms: center.kms || 0,
          cumulativeKms: center.cumulativeKms || 0,
          address: center.address || '',
          personName: center.personName || '',
          phoneNo: center.phoneNo || '',
          notes: center.notes || '',
        })),
      };
      
      console.log('Filtered route data prepared:', {
        routeNumber: filteredRoute.routeNumber,
        centersCount: filteredRoute.centers.length,
        totalKms: filteredRoute.totalKms,
      });
      
      // Send route data to backend to generate PDF report
      console.log('Sending PDF request with data:', filteredRoute);
      console.log('Number of centers:', filteredRoute.centers.length);
      console.log('From:', fromLocation, 'To:', toLocation);
      
      // Send PDF request directly (removed test endpoint to avoid timeout issues)
      console.log('Sending PDF request now...');
      const requestStartTime = Date.now();
      
      const response = await axiosInstance.post('/vihar-path/route1/pdf', filteredRoute, {
        responseType: 'blob',
        timeout: 90000, // 90 second timeout for PDF generation
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const requestTime = Date.now() - requestStartTime;
      console.log(`PDF response received after ${requestTime}ms (${(requestTime/1000).toFixed(2)}s)`);
      
      console.log('PDF response received:', response);
      console.log('Response headers:', response.headers);
      console.log('Response data type:', typeof response.data);
      console.log('Response data size:', response.data?.size || response.data?.length || 'unknown');
      
      // Check if response is actually a blob
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Ensure we have a proper blob
      let blob;
      if (response.data instanceof Blob) {
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], { type: 'application/pdf' });
      } else {
        // Convert to blob if it's not already
        blob = new Blob([response.data], { type: 'application/pdf' });
      }
      
      console.log('Blob created:', blob.size, 'bytes, type:', blob.type);
      
      // Verify blob is not empty
      if (blob.size === 0) {
        throw new Error('PDF file is empty');
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      
      // Create a safe filename (remove special characters)
      const fromName = fromLocation.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 20);
      const toName = toLocation.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 20);
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `vihar_path_route1_${dateStr}.pdf`;
      
      // Append to body
      document.body.appendChild(link);
      
      // Trigger download
      try {
        link.click();
        console.log('Download triggered');
      } catch (e) {
        console.error('Error triggering download:', e);
        // Fallback: open in new window
        window.open(url, '_blank');
      }
      
      // Show success message after a short delay
      setTimeout(() => {
        if (language === 'en') {
          console.log('PDF download initiated successfully');
        } else {
          console.log('PDF ડાઉનલોડ શરૂ થયું');
        }
      }, 500);
      
      // Clean up after a delay
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      
      let errorMessage = language === 'en' ? 'Error generating PDF report' : 'PDF રિપોર્ટ જનરેટ કરવામાં ભૂલ';
      
      if (error.message && error.message.includes('timeout')) {
        errorMessage += '\n' + (language === 'en' 
          ? 'Request timed out. The PDF generation is taking too long. Please try again.' 
          : 'રિક્વેસ્ટ ટાઇમઆઉટ થઈ. PDF જનરેશન લાંબો સમય લઈ રહ્યું છે. કૃપા કરીને ફરીથી પ્રયાસ કરો.');
      } else if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data;
        
        // Try to read error message from blob if it's a blob response
        if (data instanceof Blob) {
          data.text().then(text => {
            console.error('Error response text:', text);
            try {
              const jsonData = JSON.parse(text);
              errorMessage += `\n${jsonData.detail || jsonData.message || text}`;
            } catch {
              errorMessage += `\nStatus: ${status}`;
            }
          });
        } else if (typeof data === 'string') {
          errorMessage += `\n${data}`;
        } else if (data?.detail) {
          errorMessage += `\n${data.detail}`;
        } else {
          errorMessage += `\nStatus: ${status}`;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage += '\n' + (language === 'en' 
          ? 'No response from server. Please check if backend is running on port 8000.' 
          : 'સર્વરથી પ્રતિસાદ નથી. કૃપા કરીને તપાસો કે બેકએન્ડ પોર્ટ 8000 પર ચાલી રહ્યું છે કે નહીં.');
      } else {
        // Error in request setup
        errorMessage += `\n${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleShowRoute = () => {
    setActiveTab('search');
    // Scroll to route selection
    setTimeout(() => {
      document.querySelector('.route-selection-card')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="vihar-path-page">
      {/* Header */}
      <header className="vihar-path-header">
        <div className="vihar-path-header-content">
          <button 
            className="btn-back"
            onClick={() => navigate('/')}
          >
            ← {t.backToHome}
          </button>
          <h1 className="vihar-path-title">{t.title}</h1>
          <button 
            className="landing-language-toggle-btn"
            onClick={() => setLanguage(language === 'en' ? 'gu' : 'en')}
          >
            {language === 'en' ? 'ગુજરાતી' : 'English'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="vihar-path-container">
        {/* Tabs */}
        <div className="vihar-path-tabs">
          <button
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 {t.selectRoute}
          </button>
          <button
            className={`tab-btn ${activeTab === 'network' ? 'active' : ''}`}
            onClick={() => setActiveTab('network')}
          >
            🗺️ {t.routeNetwork}
          </button>
          <button
            className={`tab-btn ${activeTab === 'centers' ? 'active' : ''}`}
            onClick={() => setActiveTab('centers')}
          >
            📍 {t.allCenters}
          </button>
        </div>

        {/* Route Selection Tab */}
        {activeTab === 'search' && (
          <>
        <div className="route-selection-card">
          <h2>{t.selectRoute}</h2>
          <div className="route-selectors">
            <div className="form-group">
              <label>{t.from}</label>
              <select
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="route-select"
              >
                <option value="">-- {t.from} --</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>{t.to}</label>
              <select
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="route-select"
              >
                <option value="">-- {t.to} --</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            className="btn-download-pdf"
            onClick={handleDownloadPDF}
            disabled={loading || !fromLocation || !toLocation}
          >
            {loading ? '⏳ Generating PDF...' : '📄 ' + t.downloadPDF}
          </button>
        </div>

        {/* Centers Display - Table Format */}
        {route1 && fromLocation && toLocation && (
          <div className="centers-section">
            <div className="route-report-header">
              <h2>રૂટ રિપોર્ટ — ફોર્મેટ</h2>
              <div className="route-info">
                <p><strong>રૂટ નામ:</strong> {route1.routeName}</p>
                <p><strong>કુલ અંતર:</strong> {selectedTotalKms} કિ.મી.</p>
                <p><strong>રિપોર્ટ તારીખ:</strong> {new Date().toLocaleDateString('gu-IN')}</p>
                <p><strong>From:</strong> {fromLocation}</p>
                <p><strong>To:</strong> {toLocation}</p>
                <p className="note-text"><strong>નોંધ:</strong> સરનામું/સંપર્ક/ફોન ઉપલબ્ધ હોય તો ઉમેરવાના, નહિતર ખાલી.</p>
              </div>
            </div>
            
            {selectedCenters.length > 0 ? (
              <div className="route-table-container">
                <table className="route-table">
                  <thead>
                    <tr>
                      <th>ક્રમ</th>
                      <th>સ્થળનું નામ</th>
                      <th>કિ.મી.</th>
                      <th>સરનામું (જો મળે)</th>
                      <th>સંપર્ક વ્યક્તિ (જો મળે)</th>
                      <th>ફોન (જો મળે)</th>
                      <th>નોંધ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCenters.map((center, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{center.placeName}</td>
                        <td>{center.kms}</td>
                        <td>{center.address || ''}</td>
                        <td>{center.personName || ''}</td>
                        <td>
                          {center.phoneNo ? (
                            <a href={`tel:${center.phoneNo}`} className="phone-link">
                              {center.phoneNo}
                            </a>
                          ) : ''}
                        </td>
                        <td>{center.notes || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-centers">
                <p>{t.noCenters}</p>
              </div>
            )}
          </div>
        )}
          </>
        )}

        {/* Route Network Tab */}
        {activeTab === 'network' && (
          <div className="network-section">
            <div className="network-stats">
              <div className="stat-card">
                <div className="stat-value">{routeConnections.length}</div>
                <div className="stat-label">{t.totalRoutes}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{allCentersList.length}</div>
                <div className="stat-label">{t.totalCenters}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{locations.length}</div>
                <div className="stat-label">Locations</div>
              </div>
            </div>

            <div className="routes-grid">
              {routeConnections.map((connection, index) => (
                <div key={index} className="route-connection-card">
                  <div className="route-connection-header">
                    <div className="route-path">
                      <span className="route-from">{connection.from}</span>
                      <span className="route-arrow">→</span>
                      <span className="route-to">{connection.to}</span>
                    </div>
                    <button
                      className="btn-show-route"
                      onClick={handleShowRoute}
                    >
                      {t.showRoute}
                    </button>
                  </div>
                  <div className="route-connection-details">
                    <div className="connection-detail">
                      <span className="detail-icon">📍</span>
                      <span>{connection.centersCount} {t.centers}</span>
                    </div>
                    <div className="connection-detail">
                      <span className="detail-icon">📏</span>
                      <span>{connection.totalKms} {t.kms}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Centers Tab */}
        {activeTab === 'centers' && (
          <div className="all-centers-section">
            <h2>{t.allCenters} ({allCentersList.length})</h2>
            <div className="centers-grid">
              {allCentersList.map((center, index) => (
                <div key={index} className="center-card">
                  <div className="center-header">
                    <h3>{center.placeName}</h3>
                    <span className="center-type">{center.type}</span>
                  </div>
                  <div className="center-details">
                    <div className="detail-row">
                      <span className="detail-label">{t.villageName}:</span>
                      <span className="detail-value">{center.villageName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t.kms}:</span>
                      <span className="detail-value">{center.kms} km</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t.type}:</span>
                      <span className="detail-value">{center.type}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t.personName}:</span>
                      <span className="detail-value">{center.personName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t.phoneNo}:</span>
                      <a 
                        href={`tel:${center.phoneNo}`}
                        className="detail-value phone-link"
                      >
                        {center.phoneNo}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViharPathMargdarshika;

