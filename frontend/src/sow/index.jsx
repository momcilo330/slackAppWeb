import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { sowService, alertService } from '@/_services';

function Sow({ match }) {
  const { path } = match;
  const [users, setUsers] = useState(null);
  const [checkedState, setCheckedState] = useState([]);
  const handleOnChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );
    setCheckedState(updatedCheckedState);
    //
    sowService.update({id: users[position].id, status: updatedCheckedState[position]})
    .then(() => {
        alertService.success('Update successful', { keepAfterRouteChange: true });
    })
    .catch(error => {
        alertService.error(error);
    });
  }
  const updateGrants = () => {
  }
  useEffect(() => {
    sowService.list().then(users => {
      let checkedArr = [];
      users.forEach(user => {
        checkedArr.push(user ? user.status : false)
      });
      setCheckedState(checkedArr);
      setUsers(users)
    });
  }, []);

  return (
    <div className="p-4">
      <div className="container">
        <h3 style={{marginBottom: '20px'}}>Access to generate SOWs</h3>
        <table className="table sowTable">
          <thead>
            <tr>
              <th scope="col" style={{
                          borderBottom: 'solid 3px red',
                          color: 'black',
                        }}>Name</th>
              <th scope="col" style={{
                          borderBottom: 'solid 3px red',
                          color: 'black',
                        }}>Title</th>
              <th scope="col" style={{
                          borderBottom: 'solid 3px red',
                          color: 'black',
                        }}>Admin</th>
              <th scope="col" style={{
                          borderBottom: 'solid 3px red',
                          color: 'black',
                        }}>Owner</th>
              <th scope="col" style={{
                          borderBottom: 'solid 3px red',
                          color: 'black',
                        }}>Approve</th>
            </tr>
          </thead>
          <tbody>
          {users && users.map((user, index) =>
            <tr key={user.id}>
              <td><img src={user.image} style={{marginRight: '14px'}} alt="" /><strong style={{fontSize: '20px',verticalAlign: 'middle'}}>{user.name}</strong></td>
              <td>{user.title}</td>
              <td>{user.admin ? <span className="badge badge-info">Yes</span> : 'No'}</td>
              <td>{user.owner ? <span className="badge badge-info">Yes</span> : 'No'}</td>
              <td><input type="checkbox" checked={checkedState[index]} style={{width: '24px',height: '24px',verticalAlign: 'middle'}} onChange={e => handleOnChange(index)} /></td>
            </tr>
          )}
          </tbody>
        </table>

        {!users &&
          <span className="spinner-border spinner-border-lg align-center"></span>
        }

        {/* <button className="btn btn-primary mr-2" onClick={e => updateGrants()}>
          SAVE
        </button> */}
      </div>
    </div>
  );
}

export { Sow };