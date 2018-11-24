import React from 'react';

import logo from '../../assets/react.svg';
import styles from './Header.module.css';


export const Header = () => (
    <div className={styles.header}>
        <img src={logo} className={styles.logo} alt="logo" />
        <h2>Welcome to Razzle</h2>
    </div>
);
