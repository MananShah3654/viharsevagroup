// Vihar Path Margdarshika Route Data
// Route 1: Shankheshwar → Patadi → Limbdi → Dhandhuka → Palitana
// Total Distance: 298 km
// 
// Data Structure for Route 1:
// Each center contains:
//   - placeName: Name of the place/center (સ્થળનું નામ)
//   - villageName: Gam nu name (Village name)
//   - kms: Distance in kilometers from previous stop (incremental)
//   - cumulativeKms: Cumulative distance from starting point
//   - address: Address if available (સરનામું)
//   - personName: Contact person's name (સંપર્ક વ્યક્તિ)
//   - phoneNo: Contact phone number (ફોન)
//   - notes: Notes if any (નોંધ)

export const routeData = [
  {
    routeNumber: 1,
    routeName: 'રૂટ ૧ : સાંખેશ્વર → પાટડી → લિંબડી → ધંધુકા → પાલીતાણા',
    from: 'સાંખેશ્વર',
    to: 'પાલીતાણા તળેટી',
    totalKms: 298,
    centers: [
      { placeName: 'પાવાપુરીધામ', villageName: 'પાવાપુરીધામ', kms: 6, cumulativeKms: 6, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'પંચાસર', villageName: 'પંચાસર', kms: 4, cumulativeKms: 10, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'પાવા – ગોશાળા', villageName: 'પાવા – ગોશાળા', kms: 4, cumulativeKms: 14, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'વડગામ', villageName: 'વડગામ', kms: 5, cumulativeKms: 19, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'જારતલાવપુર', villageName: 'જારતલાવપુર', kms: 5, cumulativeKms: 24, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'દસાડા', villageName: 'દસાડા', kms: 2, cumulativeKms: 26, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'જૈનાબાદ', villageName: 'જૈનાબાદ', kms: 6, cumulativeKms: 32, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'પાટડી', villageName: 'પાટડી', kms: 11, cumulativeKms: 43, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'બલાણા', villageName: 'બલાણા', kms: 6, cumulativeKms: 49, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'માવતળા', villageName: 'માવતળા', kms: 6, cumulativeKms: 55, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'ખેડા', villageName: 'ખેડા', kms: 7, cumulativeKms: 62, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'મેટાવા', villageName: 'મેટાવા', kms: 7, cumulativeKms: 69, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'સહાદ', villageName: 'સહાદ', kms: 5, cumulativeKms: 74, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'લખતર', villageName: 'લખતર', kms: 4, cumulativeKms: 78, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'દેવળીયા', villageName: 'દેવળીયા', kms: 11, cumulativeKms: 89, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'લાવી', villageName: 'લાવી', kms: 8, cumulativeKms: 97, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'શિશ્યાણી તીર્થ', villageName: 'શિશ્યાણી તીર્થ', kms: 5, cumulativeKms: 102, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'ઘાઘરેટીયા', villageName: 'ઘાઘરેટીયા', kms: 6, cumulativeKms: 108, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'ભલગામડા', villageName: 'ભલગામડા', kms: 5, cumulativeKms: 113, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'લિંબડી', villageName: 'લિંબડી', kms: 2, cumulativeKms: 115, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'બોરાણા', villageName: 'બોરાણા', kms: 7, cumulativeKms: 122, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'કુણીયાઆશ્રમ', villageName: 'કુણીયાઆશ્રમ', kms: 4, cumulativeKms: 126, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'રણગામ', villageName: 'રણગામ', kms: 6, cumulativeKms: 132, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'વણાણા', villageName: 'વણાણા', kms: 4, cumulativeKms: 136, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'રંગપુર', villageName: 'રંગપુર', kms: 4, cumulativeKms: 140, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'ધંધુકા', villageName: 'ધંધુકા', kms: 8, cumulativeKms: 148, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'તગડી', villageName: 'તગડી', kms: 10, cumulativeKms: 158, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'પોલારપુર', villageName: 'પોલારપુર', kms: 7, cumulativeKms: 165, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'રોજદ', villageName: 'રોજદ', kms: 6, cumulativeKms: 171, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'ભરદાળા', villageName: 'ભરદાળા', kms: 6, cumulativeKms: 177, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'પાણળી', villageName: 'પાણળી', kms: 10, cumulativeKms: 187, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'મુલધરાઈ', villageName: 'મુલધરાઈ', kms: 6, cumulativeKms: 193, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'અમરેલિયાપુરમ', villageName: 'અમરેલિયાપુરમ', kms: 6, cumulativeKms: 199, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'વલ્લભીપુર', villageName: 'વલ્લભીપુર', kms: 6, cumulativeKms: 205, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'મહેન્દ્રપુરમ', villageName: 'મહેન્દ્રપુરમ', kms: 5, cumulativeKms: 210, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'વિમલધામ', villageName: 'વિમલધામ', kms: 6, cumulativeKms: 216, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'નવાગામ', villageName: 'નવાગામ', kms: 6, cumulativeKms: 222, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'સોનગઢ', villageName: 'સોનગઢ', kms: 6, cumulativeKms: 228, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'ગુણોદયધામ', villageName: 'ગુણોદયધામ', kms: 2, cumulativeKms: 230, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'કીર્તિધામ', villageName: 'કીર્તિધામ', kms: 5, cumulativeKms: 235, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'રાજેન્દ્રધામ', villageName: 'રાજેન્દ્રધામ', kms: 3, cumulativeKms: 238, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'શાંતિવનધામ', villageName: 'શાંતિવનધામ', kms: 4, cumulativeKms: 242, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'મોકડકા', villageName: 'મોકડકા', kms: 3, cumulativeKms: 245, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: '૧૦૦ અહિદ્વીપ', villageName: '૧૦૦ અહિદ્વીપ', kms: 3, cumulativeKms: 248, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'ગુરૂકુલધામ', villageName: 'ગુરૂકુલધામ', kms: 3, cumulativeKms: 251, address: '', personName: '', phoneNo: '', notes: '' },
      { placeName: 'પાલીતાણા તળેટી', villageName: 'પાલીતાણા તળેટી', kms: 3, cumulativeKms: 254, address: '', personName: '', phoneNo: '', notes: 'અંતિમ સ્ટોપ' },
    ],
  },
];

// Helper function to get Route 1 data
export const getRoute1 = () => {
  return routeData.find(r => r.routeNumber === 1) || routeData[0];
};

// Helper function to get all locations (for dropdown) - returns all center place names
export const getAllLocations = () => {
  const route1 = getRoute1();
  if (!route1) return [];
  // Return all place names from centers
  return route1.centers.map(center => center.placeName);
};

// Helper function to get route connections (for network visualization)
export const getRouteConnections = () => {
  const route1 = getRoute1();
  return [{
    from: route1.from,
    to: route1.to,
    centersCount: route1.centers.length,
    totalKms: route1.totalKms,
  }];
};

// Helper function to get all centers
export const getAllCenters = () => {
  const route1 = getRoute1();
  return route1.centers.map(center => ({
    placeName: center.placeName,
    villageName: center.villageName,
    kms: center.kms,
    cumulativeKms: center.cumulativeKms,
    address: center.address,
    personName: center.personName,
    phoneNo: center.phoneNo,
    notes: center.notes,
  }));
};
