import { isAuthenticated } from '@thorgate/spa-permissions';
import React from 'react';
import { connect } from 'react-redux';
import { NamedLink } from 'tg-named-routes';

import styles from './Menu.module.css';


const MenuBase = ({ isAuthenticated }) => (
    <ul className={styles.resources}>
        <li>
            <NamedLink name="home">Home</NamedLink>
        </li>
        <li>
            <NamedLink name="restricted">Restricted</NamedLink>
        </li>
        <li>
            <NamedLink name="restricted-redirect">Restricted Redirect</NamedLink>
        </li>
        <li>
            {isAuthenticated ? (
                <NamedLink name="logout">Logout</NamedLink>
            ) : (
                <NamedLink name="login">Login</NamedLink>
            )}
        </li>
        <li>
            <NamedLink name="error-test">Test error</NamedLink>
        </li>
    </ul>
);


const mapStateToProps = state => ({
    isAuthenticated: isAuthenticated(state),
});

export const Menu = connect(mapStateToProps)(MenuBase);
