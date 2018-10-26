import { Status } from '@thorgate/spa-components';
import React from 'react';

import logo from '../assets/react.svg';
import './Home.css';


class PageNotFound extends React.Component {
    render() {
        return (
            <Status code={404}>
                <div className="Home">
                    <div className="Home-header">
                        <img src={logo} className="Home-logo" alt="logo" />
                        <h2>Page not found</h2>
                    </div>
                </div>
            </Status>
        );
    }
}

export default PageNotFound;
