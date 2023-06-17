import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useTable, useSortBy, useFilters, useGlobalFilter, useAsyncDebounce,  usePagination } from 'react-table';
import SortIcon from 'mdi-react/SortIcon'
import SortAscendingIcon from 'mdi-react/SortAscendingIcon'
import SortDescendingIcon from 'mdi-react/SortDescendingIcon'
require("regenerator-runtime/runtime");
import { estimateService, alertService } from '@/_services';
const moment = require('moment');

// https://dev.to/elangobharathi/server-side-pagination-using-react-table-v7-and-react-query-v3-3lck
const initialState = {
  queryPageIndex: 0,
  queryPageSize: 10,
  totalCount: null,
  queryPageFilter:"",
  queryPageSortBy: [],
};

const PAGE_CHANGED = 'PAGE_CHANGED';
const PAGE_SIZE_CHANGED = 'PAGE_SIZE_CHANGED';
const TOTAL_COUNT_CHANGED = 'TOTAL_COUNT_CHANGED';
const PAGE_FILTER_CHANGED = 'PAGE_FILTER_CHANGED';
const PAGE_SORT_CHANGED = 'PAGE_SORT_CHANGED';

const reducer = (state, { type, payload }) => {
  switch (type) {
    case PAGE_CHANGED:
      return {
        ...state,
        queryPageIndex: payload,
      };
    case PAGE_SIZE_CHANGED:
      return {
        ...state,
        queryPageSize: payload,
      };
    case TOTAL_COUNT_CHANGED:
      return {
        ...state,
        totalCount: payload,
      };
    case PAGE_SORT_CHANGED:
      return {
          ...state,
          queryPageSortBy: payload,
      };
    case PAGE_FILTER_CHANGED:
      return {
          ...state,
          queryPageFilter: payload,
      };
    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
};
const UsersFilter = ({onClickFilterCallback, defaultKeyword}) => {
  const [keyword, setKeyword] = React.useState(defaultKeyword)
  const onKeywordChange = ( e ) => {
      setKeyword( e.target.value )
  }
  const onClickSearch = () => {
      onClickFilterCallback(keyword)
  }
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onClickFilterCallback(keyword)
    }
  }
  return (
      <div className="form__form-group">
          {/* <div className="col-md-4 px-0">
              <Select
                  value={status}
                  onChange={onStatusChange}
                  options={statusOptions}
                  clearable={false}
                  className="react-select"
                  placeholder={statusPlaceholder}
                  classNamePrefix="react-select"
              />
          </div> */}
            <div className="">
                <input 
                    value={keyword}
                    onChange={onKeywordChange}
                    onKeyDown={handleKeyDown}
                    type="text"
                    placeholder="Search Role"
                />
                <button className="text-blue pointer" onClick={onClickSearch}>Search</button>
            </div>
      </div>
  )
}
const Sorting = ({ column }) => (
  <span className="react-table__column-header sortable">
    {column.isSortedDesc === undefined ? (
      <SortIcon />
    ) : (
      <span>
        {column.isSortedDesc
          ? <SortAscendingIcon />
          : <SortDescendingIcon />}
      </span>
    )}
  </span>
);

function HourTable() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Role',
        accessor: 'role',
        maxWidth: 100,
        width: "150px",
        // Cell: ({ cell: { value } }) => <PSContent contents={value} />
      },
      {
        Header: 'Tasks',
        accessor: 'tasks',
        isSorted: true,
        // Cell: ({ cell: { value } }) => <PSUser profile={value} />
      },
      {
        Header: 'Hours',
        accessor: 'hours',
        maxWidth: 50,
        width: "50px",
        fontWeight: "bold"
      }
    ],
    []
  )
  const [keyword, setKeyword] = useState('');
  const [useFilter, setUseFilter] = useState(false);
  const onClickFilterCallback = ( filter ) => {
 
    if(filter === keyword)   {
        alert('No change in search')
        return
    }
    setUseFilter(true)
    setKeyword(filter)
  }

  const [{ queryPageIndex, queryPageSize, totalCount, queryPageFilter, queryPageSortBy }, dispatch] = React.useReducer(reducer, initialState);
  const { isLoading, error, data, isSuccess } = useQuery(
    ['hourlist', queryPageIndex, queryPageSize, queryPageFilter, queryPageSortBy],
    () => estimateService.hoursData(queryPageIndex, queryPageSize, queryPageFilter, queryPageSortBy),
    {
      keepPreviousData: true,
      staleTime: Infinity,
    }
  );
 
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, sortBy },
  } = useTable({ 
    columns, 
    data: isSuccess ? data.results : [],
    initialState: {
      pageIndex: queryPageIndex,
      pageSize: queryPageSize,
      sortBy: queryPageSortBy,
    },
    manualPagination: true, 
    pageCount: isSuccess ? Math.ceil(totalCount / queryPageSize) : null,
    autoResetSortBy: false,
    autoResetExpanded: false,
    autoResetPage: false
   }, useSortBy,  usePagination)

   useEffect(() => {
    dispatch({ type: PAGE_CHANGED, payload: pageIndex });
  }, [pageIndex]);

  useEffect(() => {
    dispatch({ type: PAGE_SIZE_CHANGED, payload: pageSize });
    gotoPage(0);
  }, [pageSize, gotoPage]);

  useEffect(() => {
    if (data?.count) {
      dispatch({
        type: TOTAL_COUNT_CHANGED,
        payload: data.count,
      });
    }
  }, [data?.count]);

  useEffect(() => {
    dispatch({ type: PAGE_SORT_CHANGED, payload: sortBy });
    gotoPage(0);
  }, [sortBy, gotoPage]);

  useEffect(() => {
    if ( useFilter ) {
        dispatch({ type: PAGE_FILTER_CHANGED, payload: keyword });
        gotoPage(0);
    }
  }, [keyword, gotoPage, useFilter]);

  if (error) {
    return <p>Error</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="">
          <UsersFilter onClickFilterCallback={onClickFilterCallback} defaultKeyword={keyword} />
      </div>
      <table {...getTableProps()} className='table estimates-table hoursList'>
        <thead>
        {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                  <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      style={{
                        borderBottom: 'solid 3px red',
                        color: 'black',
                        maxWidth: column.maxWidth,
                        width: column.width
                      }}
                  >
                    {column.render('Header')}
                    {column.isSorted ? <Sorting column={column} /> : ''}
                  </th>
              ))}
            </tr>
        ))}
        </thead>
        <tbody {...getTableBodyProps()}>
        {page.map(row => {
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
                            maxWidth: cell.column.maxWidth,
                            width: cell.column.width,
                            fontWeight: cell.column.fontWeight
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
      <br />
      <div style={{textAlign: "center"}}>
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {'<<'}
          </button>{' '}
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            {'<'}
          </button>{' '}
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            {'>'}
          </button>{' '}
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
          >
            {'>>'}
          </button>{' '}
          <span>
            <span className='pageInfoTxt' style={{verticalAlign: "middle"}}>Page{' '}</span>
            <strong style={{verticalAlign: "middle"}}>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{' '}
          </span>
          <span>
            <span>&nbsp;| Go to page:{' '}</span>
            <input
              type="number"
              value={pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                gotoPage(page);
              }}
              style={{ width: '100px' }}
            />
          </span>{' '}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
      </div>
    </div>
  );
}

export default HourTable;