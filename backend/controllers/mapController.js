const getNearbyRequests = (req, res) => {
  // Mock data matching the frontend
  const requests = [
    {
      id: 1,
      type: 'request',
      category: 'grocery',
      title: 'Grocery request',
      distance: '0.3 km',
      urgency: 'medium',
      color: '#FCD34D',
      coordinates: { top: '35%', left: '30%' }
    },
    {
      id: 2,
      type: 'offer',
      category: 'transport',
      title: 'Transport offer',
      distance: '0.5 km',
      urgency: 'high',
      color: '#EF4444', 
      coordinates: { top: '25%', left: '60%' }
    },
    {
      id: 3,
      type: 'request',
      category: 'medicine',
      title: 'Medicine request',
      distance: '0.8 km',
      urgency: 'high',
      color: '#EF4444', 
      coordinates: { top: '55%', left: '45%' }
    },
    {
      id: 4,
      type: 'offer',
      category: 'education',
      title: 'Education offer',
      distance: '1.2 km',
      urgency: 'low',
      color: '#10B981', 
      coordinates: { top: '50%', left: '70%' }
    },
    {
      id: 5,
      type: 'request',
      category: 'repair',
      title: 'Repair request',
      distance: '0.4 km',
      urgency: 'medium',
      color: '#FCD34D', 
      coordinates: { top: '45%', left: '25%' }
    }
  ];

  res.status(200).json(requests);
};

module.exports = {
  getNearbyRequests
};
