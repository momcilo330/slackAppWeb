import { fetchWrapper, history } from '@/_helpers';
import config from 'config';

const baseUrl = `${config.apiUrl}/proposals`;

export const estimateService = {
  list,
  update
};

function list() {
  return fetchWrapper.get(baseUrl);
}

function update(params) {
  return fetchWrapper.post(`${baseUrl}/update`, params);
} 