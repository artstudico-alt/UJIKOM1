import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrganizerSettings: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to profile page
    navigate('/organizer/profile', { replace: true });
  }, [navigate]);
  
  return null;
};

export default OrganizerSettings;
