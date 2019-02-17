import React from 'react';

import './Home.css';
import { withView } from '../withView';


class Home extends React.Component {
    render() {
        return (
            <div className="Home">
                <p className="Home-intro">
                    I take longer to load.
                </p>
            </div>
        );
    }
}

export default withView(Home);
