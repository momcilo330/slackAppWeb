import React from 'react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import Table from './table';

const queryClient = new QueryClient();

function Estimates({ match }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-4">
        <div className="container">
          <h3 style={{marginBottom: '20px'}}>Estimates</h3>
          <Table />
        </div>
      </div>
    </QueryClientProvider>
  );
}
export { Estimates };