import { fetchWrapper, history } from '@/_helpers';
import config from 'config';

const baseUrl = `${config.apiUrl}/grants`;

export const sowService = {
  list
};

function list() {
  return fetchWrapper.get(baseUrl);
}