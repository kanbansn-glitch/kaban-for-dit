import { apiRequest } from '../../api/client';

export function fetchProducts(token) {
  let value = apiRequest('products', {
    method: 'GET',
    token,
  });
  console.log('fetchProducts value:', value);
  return value;
}

export function fetchCategories(token) {
  return apiRequest('categories', {
    method: 'GET',
    token,
  });
}

export function fetchSuppliers(token) {
  return apiRequest('suppliers', {
    method: 'GET',
    token,
  });
}

export function createSupplier(token, payload) {
  return apiRequest('suppliers', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function createProduct(token, payload) {
  return apiRequest('products', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function updateProduct(token, productId, payload) {
  return apiRequest(`products/${productId}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

export function deleteProduct(token, productId) {
  return apiRequest(`products/${productId}`, {
    method: 'DELETE',
    token,
  });
}
