import React from 'react';

import './Home.css';
import { withView } from '../withView';


class Home extends React.Component {
    render() {
        return (
            <div className="Home">
                <p className="Home-intro">
                    To get started, edit <code>src/App.js</code> or{' '}
                    <code>src/Home.js</code> and save to reload.
                </p>
            </div>
        );
    }
}

export default withView(Home);
