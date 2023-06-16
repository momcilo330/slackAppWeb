import { fetchWrapper, history } from '@/_helpers';
import config from 'config';

const baseUrl = `${config.apiUrl}/proposals`;

export const estimateService = {
  list,
  pageData,
  update
};

function list() {
  return fetchWrapper.get(baseUrl);
}

function pageData(page, pageSize) {
  const offset = page * pageSize;
  return fetchWrapper.get(`${baseUrl}/pagedata?offset=${offset}&limit=${pageSize}`);
}

function update(params) {
  return fetchWrapper.post(`${baseUrl}/update`, params);
} 