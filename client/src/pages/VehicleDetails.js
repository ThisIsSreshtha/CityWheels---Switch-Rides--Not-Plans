import React from 'react';
import { useParams } from 'react-router-dom';

const VehicleDetails = () => {
  const { id } = useParams();

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1>Vehicle Details</h1>
      <p>Vehicle ID: {id}</p>
      <p>This page will show detailed vehicle information, map, and booking options.</p>
    </div>
  );
};

export default VehicleDetails;
