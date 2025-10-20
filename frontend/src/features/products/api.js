import { apiRequest } from '../../api/client';

export async function fetchProducts(token) {
  return apiRequest('products', {
    method: 'GET',
    token,
  });
}
