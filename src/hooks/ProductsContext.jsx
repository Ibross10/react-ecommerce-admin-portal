import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createProduct as createProductRequest,
  getProducts,
  patchProduct,
  removeProduct,
} from "../services/productsApi.js";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await getProducts();
      setProducts(Array.isArray(rows) ? rows : []);
      return rows;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts().catch(() => {});
  }, [refreshProducts]);

  const addProduct = useCallback(async (values) => {
    setError("");
    try {
      const created = await createProductRequest(values);
      setProducts((current) => [created, ...current]);
      return created;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }, []);

  const updateProduct = useCallback(async (id, changes) => {
    setError("");
    try {
      const updated = await patchProduct(id, changes);
      setProducts((current) => current.map((product) =>
        String(product.id) === String(id) ? { ...product, ...updated } : product
      ));
      return updated;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    setError("");
    try {
      await removeProduct(id);
      setProducts((current) => current.filter((product) => String(product.id) !== String(id)));
      return true;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }, []);

  const clearError = useCallback(() => setError(""), []);
  const value = useMemo(() => ({
    products,
    loading,
    error,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    clearError,
  }), [products, loading, error, refreshProducts, addProduct, updateProduct, deleteProduct, clearError]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts must be used inside ProductsProvider.");
  return context;
}
