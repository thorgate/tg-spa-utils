import { loginRequired } from '@thorgate/spa-permissions';
import React from 'react';

import './Home.css';
import { withView } from '../withView';


class Restricted extends React.Component {
    render() {
        return (
            <div className="Home">
                <p className="Home-intro">
                    Welcome home, <strong>FooBar</strong>
                </p>
            </div>
        );
    }
}

export default loginRequired(withView(Restricted));
