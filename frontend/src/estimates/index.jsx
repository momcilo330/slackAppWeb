import React, { useState, useEffect } from 'react';
import { useTable, useSortBy, useFilters, useGlobalFilter, useAsyncDebounce  } from 'react-table';
require("regenerator-runtime/runtime");
import { Route, Switch } from 'react-router-dom';
import { estimateService, alertService } from '@/_services';
const moment = require('moment');
// https://www.copycat.dev/blog/react-table/
// https://blog.logrocket.com/react-table-complete-guide/
function Estimates({ match }) {
  const { path } = match;
  const [checkedState, setCheckedState] = useState([]);
  const [data, setData] = useState([]);

  const PSContent = ({ contents }) => {
    return (
      <>
        {contents.map((content, idx) => {
          return (
            <span key={idx} className="proposal_content">
              {content.hours} hours: {content.role} - {content.tasks}
            </span>
          );
        })}
      </>
    );
  };

  const PSUser = ({ profile }) => {
    return (
      <>
        <img src={profile.image} alt="" /> <strong style={{verticalAlign: "middle"}}>{profile.name}</strong>
      </>
    )
  }

  const PSStatus = ({ status }) => {
    if(status == -1) {
      return (
        <span className="badge badge-danger">Denied</span>
      )
    } else if(status == 1) {
      return (
        <span className="badge badge-success">Approved</span>
      )
    } else 
      return (
        <span className="badge badge-secondary">Pending</span>
      )
  }

  const PSDate = ({ time }) => {
    return (
      <span>{moment(new Date(time)).format('MM/DD/YYYY')}</span>
    )
  }
  const PSUpdatedDate = ({ row }) => {
    if(row.original.status == null) {
      return (
        <></>
      );
    } else if(row.original.status == 1)
      return (
        <span style={{color: "green"}}>{moment(new Date(row.original.updatedAt)).format('MM/DD/YYYY')}</span>
      );
    else 
      return (
        <span style={{color: "red"}}>{moment(new Date(row.original.updatedAt)).format('MM/DD/YYYY')}</span>
      );
  }
  
  const columns = React.useMemo(
    () => [
      {
        Header: 'Project Name',
        accessor: 'name',
      },
      {
        Header: 'Content',
        accessor: 'proposalcontents',
        Cell: ({ cell: { value } }) => <PSContent contents={value} />
      },
      {
        Header: 'Creator',
        accessor: 'crt',
        Cell: ({ cell: { value } }) => <PSUser profile={value} />
      },
      {
        Header: 'Acceptor',
        accessor: 'acpt',
        Cell: ({ cell: { value } }) => <PSUser profile={value} />
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ cell: { value } }) => <PSStatus status={value} />
        
      },
      {
        Header: 'Created Date',
        accessor: 'createdAt',
        Cell: ({ cell: { value } }) => <PSDate time={value} />
      },
      {
        Header: 'Approved Date',
        Cell: ({ row }) => <PSUpdatedDate row={row} />
      },
    ],
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    preGlobalFilteredRows,
    setGlobalFilter,
    state
  } = useTable({ columns, data }, useGlobalFilter, useSortBy)
  
  useEffect(() => {
    estimateService.list().then(estimates => {
      setData(estimates)
    });
  }, []);

  return (
    <div className="p-4">
      <div className="container">
        <GlobalFilterInput
          preGlobalFilteredRows={preGlobalFilteredRows}
          setGlobalFilter={setGlobalFilter} globalFilter={state.globalFilter}
        /><br/><br/>
        <table {...getTableProps()} className='table estimates-table'>
          <thead>
          {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                    <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        style={{
                          borderBottom: 'solid 3px red',
                          color: 'black',
                        }}
                    >
                      {column.render('Header')}
                      <span>
                        {column.isSorted
                            ? column.isSortedDesc
                                ? '🔽'
                                : '🔼'
                            : ''}
                      </span>
                    </th>
                ))}
              </tr>
          ))}
          </thead>
          <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row)
            return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return (
                        <td
                            {...cell.getCellProps()}
                            style={{
                              padding: '10px',
                              // border: 'solid 1px gray',
                            }}
                        >
                          {cell.render('Cell')}
                        </td>
                    )
                  })}
                </tr>
            )
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GlobalFilterInput({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter
}) {

  const count = preGlobalFilteredRows.length;
  const [ value, setValue ] = useState(globalFilter)
  const onChange = useAsyncDebounce((value) => {
    console.log('value: ', value);
      setGlobalFilter(value || undefined);
  }, 300);

  return (
    <span>
      Search: {''}
      <input
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
      />
    </span>
  );
}
export { Estimates };