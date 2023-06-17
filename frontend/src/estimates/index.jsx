import React, { useState, useEffect } from 'react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import Table from './table';
import HourTable from './hourTable';

const queryClient = new QueryClient();

function Estimates({ match }) {
  const [topping, setTopping] = useState("Normal")
  const onOptionChange = e => {
    setTopping(e.target.value)
  }
  const normalSection = (
    <div className="container">
      <h3 style={{marginBottom: '20px'}}>Estimates</h3>
      <Table />
    </div>
  );
  const hourListSection = (
    <div className="container">
      <h3 style={{marginBottom: '20px'}}>Hours</h3>
      <HourTable />
    </div>
  )

  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-4">
        <div className="container sectionSwitch">
          <div>
            <input type="radio" name="topping" value="Normal" id="normal" checked={topping === "Normal"} onChange={onOptionChange}/>
            <label htmlFor="normal">Total</label>&nbsp;&nbsp;&nbsp;
            <input type="radio" name="topping" value="Hour" id="hour" checked={topping === "Hour"} onChange={onOptionChange}/>
            <label htmlFor="hour">Hours</label>
          </div>
          
        </div>
        {topping == "Normal" ? normalSection : hourListSection}
      </div>
    </QueryClientProvider>
  );
}
export { Estimates };