import React, { useState, useEffect, ReactElement } from 'react';
import './HomePage.css';


// Stub interface to replace missing type
interface Project {
  id: number;
  name: string;
}

const HomePage: React.FC = () => {
  return (
    <div className="home-page-modules-container">
      <h1>Hello World</h1>
    </div>
  );
};

export default HomePage;