import { fetchWrapper, history } from '@/_helpers';
import config from 'config';

const baseUrl = `${config.apiUrl}/proposals`;

export const estimateService = {
  list,
  pageData,
  hoursData,
  update
};

function list() {
  return fetchWrapper.get(baseUrl);
}
function pageData(page, pageSize, filter, sortBy) {
  const offset = page * pageSize;
  return fetchWrapper.get(`${baseUrl}/pagedata?offset=${offset}&limit=${pageSize}&filter=${filter}&sortBy=${JSON.stringify(sortBy)}`);
}
function hoursData(page, pageSize, filter, sortBy) {
  const offset = page * pageSize;
  return fetchWrapper.get(`${baseUrl}/hoursData?offset=${offset}&limit=${pageSize}&filter=${filter}&sortBy=${JSON.stringify(sortBy)}`);
}

function update(params) {
  return fetchWrapper.post(`${baseUrl}/update`, params);
} 