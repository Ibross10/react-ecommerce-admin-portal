const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Could not connect to the store API. Make sure JSON Server is running on port 4000.");
  }

  if (!response.ok) {
    throw new Error(`The store API returned an error (${response.status}). Please try again.`);
  }

  if (response.status === 204) return null;
  const body = await response.text();
  return body ? JSON.parse(body) : null;
}

export function getProducts() {
  return request("/products?_sort=id&_order=desc");
}

export function getProduct(id) {
  return request(`/products/${id}`);
}

export function createProduct(product) {
  return request("/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export function patchProduct(id, changes) {
  return request(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function removeProduct(id) {
  return request(`/products/${id}`, { method: "DELETE" });
}
