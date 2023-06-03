import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { sowService } from '@/_services';
function Sow({ match }) {
    const { path } = match;
    const [users, setUsers] = useState(null);

    useEffect(() => {
        sowService.list().then(x => setUsers(x));
    }, []);
    return (
        <div className="p-4">
            <div className="container">
                <h1>Streamlined SOW</h1>
                <h3>Access to generate SOWs</h3>
                <div>

                </div>
            </div>
        </div>
    );
}

export { Sow };