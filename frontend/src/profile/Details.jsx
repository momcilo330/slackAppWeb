import React from 'react';
import { Link } from 'react-router-dom';

import { accountService } from '@/_services';

function Details({ match }) {
    const { path } = match;
    const user = accountService.userValue;

    return (
        <div>
            <h1>My Profile</h1><br /><br />
            <h4>
                <strong>Name: </strong> {user.firstName} {user.lastName}<br />
                <strong>Email: </strong> {user.email}
            </h4>
            <p><Link to={`${path}/update`}>Update Profile</Link></p>
        </div>
    );
}

export { Details };