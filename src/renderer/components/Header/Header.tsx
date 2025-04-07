import React, { useState } from 'react';
import { NavItem } from './types';
import { Home, FileUpIcon, HomeIcon } from 'lucide-react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

const defaultNavItems: NavItem[] = [
  {
    label: 'Home',
    icon: Home,
    onClick: () => console.log('Home clicked')
  }
];

const Header= () => {

  const navigate = useNavigate();
  const clickHome = () => {
    navigate( '/' );
  };


  return (
    <header className="header-container">
      <div className="header_main-row">
        <div className="header_main-row_left-aligned-container">
          <HomeIcon className="home-icon" onClick={clickHome} />
        </div>
      </div>
      <div className="header_secondary-row">
        <div className="export-queue-button-container">
          Export Queue
          <FileUpIcon />
        </div>
      </div>
    </header>
  );
};

export default Header;