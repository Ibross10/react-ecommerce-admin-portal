import { useMemo, useState, useEffect } from "react";
import {
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useProducts } from "./hooks/ProductsContext.jsx";

export function formatPrice(value) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function StorefrontLayout() {
  return (
    <div className="storefront-shell">
      <header className="storefront-header">
        <Link to="/" className="store-brand"><span className="store-brand-mark">CR</span><span>Coffee R Us</span></Link>
        <nav className="store-nav" aria-label="Store navigation">
          <NavLink end to="/" className={({ isActive }) => isActive ? "store-nav-link active" : "store-nav-link"}>Home</NavLink>
          <NavLink to="/shop" className={({ isActive }) => isActive ? "store-nav-link active" : "store-nav-link"}>Shop</NavLink>
          <Link className="store-nav-link" to="/admin">Admin Portal</Link>
        </nav>
      </header>
      <main className="store-main"><Outlet /></main>
      <footer className="store-footer"><span>Coffee R Us</span><span>The go-to store for your coffee needs.</span></footer>
    </div>
  );
}

function StoreHomePage() {
  return (
    <div className="store-home">
      <section className="store-hero">
        <div className="hero-decoration" aria-hidden="true"><span className="hero-circle" /><span className="hero-cup">☕</span><span className="hero-bean">◖</span></div>
        <div className="hero-copy">
          <span className="hero-eyebrow">A BETTER KIND OF COFFEE BREAK</span>
          <h1>Coffee R Us</h1>
          <p>The go-to store for your<br className="desktop-break" /> coffee needs.</p>
          <Link to="/shop" className="light-button">Explore the shop <span>→</span></Link>
        </div>
      </section>
      <section className="home-intro">
        <div><span className="section-eyebrow">OUR COFFEE, YOUR MOMENT</span><h2>Find a blend worth slowing down for.</h2></div>
        <p>Discover carefully selected coffees from different origins, each with its own character, aroma, and story. Browse the collection and find your next favourite.</p>
      </section>
      <div className="home-bottom-link"><Link to="/shop">Browse all coffee <span>↗</span></Link></div>
    </div>
  );
}

function StoreProductCard({ product }) {
  return (
    <article className="store-product-card">
      <Link to={`/shop/${product.id}`} className={`store-product-art ${product.accent || "cream"}`} aria-label={`View ${product.name}`}>
        <span className="art-brand">COFFEE R US</span><span className="art-cup" aria-hidden="true">☕</span>
        {product.badge && <span className="art-badge">{product.badge}</span>}
      </Link>
      <div className="store-product-copy">
        <span className="store-category">{product.category || "Coffee"}</span>
        <h2><Link to={`/shop/${product.id}`}>{product.name}</Link></h2>
        <p>{product.description}</p>
        <div className="store-product-meta"><span>Origin: {product.origin}</span><strong>{formatPrice(product.price)}</strong></div>
      </div>
    </article>
  );
}

function ShopPage() {
  const { products, loading, error } = useProducts();
  const [search, setSearch] = useState("");
  const [originsSelected, setOriginsSelected] = useState([]);

  const origins = useMemo(
    () => [...new Set(products.map((product) => product.origin).filter(Boolean))].sort(),
    [products]
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery = !query || [product.name, product.description, product.origin, product.category]
        .some((value) => String(value || "").toLowerCase().includes(query));
      const matchesOrigin = originsSelected.length === 0 || originsSelected.includes(product.origin);
      return matchesQuery && matchesOrigin;
    });
  }, [products, search, originsSelected]);

  function toggleOrigin(origin) {
    setOriginsSelected((current) => current.includes(origin)
      ? current.filter((item) => item !== origin)
      : [...current, origin]);
  }

  return (
    <section className="shop-page">
      <div className="shop-heading"><div><span className="section-eyebrow">FIND YOUR FAVOURITE</span><h1>Shop our coffee</h1><p>Fresh picks from coffee-growing regions around the world.</p></div><span className="product-count">{filtered.length} coffees</span></div>
      {error && <p className="notice error" role="alert">{error}</p>}
      <div className="shop-layout">
        <aside className="shop-sidebar" aria-label="Product filters">
          <label htmlFor="shop-search">Search</label>
          <input id="shop-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search coffee…" />
          <div className="origin-filters"><h2>Location</h2>
            {origins.map((origin) => <label key={origin} className="origin-option"><input type="checkbox" checked={originsSelected.includes(origin)} onChange={() => toggleOrigin(origin)} />{origin}</label>)}
          </div>
          {(search || originsSelected.length > 0) && <button className="filter-clear" type="button" onClick={() => { setSearch(""); setOriginsSelected([]); }}>Clear filters</button>}
          <div className="sidebar-admin"><span>Store administrator?</span><Link to="/admin">Manage products →</Link></div>
        </aside>
        <div className="shop-results">
          {loading ? <div className="empty-state">Loading coffee collection…</div> : filtered.length === 0
            ? <div className="empty-state"><h2>No coffee found</h2><p>Try another search or clear your filters.</p><button className="text-button" type="button" onClick={() => { setSearch(""); setOriginsSelected([]); }}>Show all coffee</button></div>
            : <div className="store-product-grid">{filtered.map((product) => <StoreProductCard key={product.id} product={product} />)}</div>}
        </div>
      </div>
    </section>
  );
}

function ShopProductPage() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find((item) => String(item.id) === String(id));

  if (loading) return <div className="empty-state">Loading coffee details…</div>;
  if (!product) return <div className="empty-state"><h1>Coffee not found</h1><Link to="/shop">Back to the shop</Link></div>;

  return (
    <section className="shop-detail-page">
      <Link to="/shop" className="back-to-shop">← Back to shop</Link>
      <div className="shop-detail">
        <div className={`shop-detail-art ${product.accent || "cream"}`} aria-hidden="true"><span>COFFEE R US</span><strong>☕</strong></div>
        <div className="shop-detail-copy"><span className="section-eyebrow">{product.category}</span><h1>{product.name}</h1><p className="detail-origin">Origin: {product.origin}</p><p className="detail-description">{product.description}</p><strong className="detail-price">{formatPrice(product.price)}</strong><span className="availability">{Number(product.stock) > 0 ? "Available now" : "Currently out of stock"}</span><Link to="/shop" className="light-button">Continue shopping <span>→</span></Link></div>
      </div>
    </section>
  );
}

function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand"><span>CR</span><span><strong>Coffee R Us</strong><small>ADMIN PORTAL</small></span></Link>
        <p className="nav-caption">WORKSPACE</p>
        <nav className="admin-nav" aria-label="Administrator navigation">
          <NavLink end to="/admin" className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}><span>⌂</span>Overview</NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}><span>▦</span>Products</NavLink>
          <NavLink to="/admin/products/new" className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}><span>＋</span>Add product</NavLink>
          <Link to="/shop" className="admin-nav-link"><span>↗</span>View storefront</Link>
        </nav>
        <div className="admin-user"><span>IA</span><div><strong>Store Admin</strong><small>Administrator</small></div></div>
      </aside>
      <div className="admin-content-column">
        <header className="admin-topbar"><span>Coffee R Us <b>/</b> Admin workspace</span><span className="active-status"><i />Store active</span></header>
        <main className="admin-main"><Outlet /></main>
        <footer className="admin-footer">Coffee R Us · Product management workspace</footer>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><span className="section-eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div>{action}</div>}</div>;
}

function ProductCard({ product, onDelete, showActions = true }) {
  return (
    <article className="admin-product-card">
      <div className={`admin-product-art ${product.accent || "cream"}`}><span>COFFEE R US</span><b>☕</b></div>
      <div className="admin-product-body">
        <div className="product-pills"><span>{product.category}</span>{product.badge && <em>{product.badge}</em>}</div>
        <h2><Link to={`/admin/products/${product.id}`}>{product.name}</Link></h2>
        <p className="admin-origin">{product.origin} · {product.stock} in stock</p>
        <p className="admin-description">{product.description}</p>
        <div className="admin-card-bottom"><strong>{formatPrice(product.price)}</strong>{showActions && <div><Link to={`/admin/products/${product.id}/edit`} aria-label={`Edit ${product.name}`}>Edit</Link><button type="button" onClick={() => onDelete?.(product)} aria-label={`Delete ${product.name}`}>Delete</button></div>}</div>
      </div>
    </article>
  );
}

function AdminOverview() {
  const { products, loading, error } = useProducts();
  const stats = useMemo(() => ({
    total: products.length,
    stock: products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
    low: products.filter((product) => Number(product.stock) <= 10).length,
  }), [products]);
  return (
    <>
      <PageHeading eyebrow="OVERVIEW" title="Good morning, admin" description="Here’s what’s happening with your store today. Manage your products and keep your catalogue up to date." action={<Link className="button primary-button" to="/admin/products/new">＋ Add a product</Link>} />
      <section className="admin-welcome"><span className="section-eyebrow">YOUR STORE, AT A GLANCE</span><h2>Make room for<br /><em>great coffee.</em></h2><p>Keep products organised, update prices, and make sure customers can find their next favourite cup.</p><Link to="/admin/products">Explore your products →</Link></section>
      {error && <p className="notice error" role="alert">{error}</p>}
      <section className="stats-grid" aria-label="Store statistics">
        <article className="stat-card"><span>Total products</span><strong>{loading ? "—" : stats.total}</strong><small>Items in your catalogue</small></article>
        <article className="stat-card"><span>Units in stock</span><strong>{loading ? "—" : stats.stock}</strong><small>Across all products</small></article>
        <article className="stat-card"><span>Low-stock items</span><strong>{loading ? "—" : stats.low}</strong><small>10 units or fewer</small></article>
      </section>
      <div className="section-row"><div><span className="section-eyebrow">RECENTLY ADDED</span><h2>Latest products</h2></div><Link to="/admin/products">View all products →</Link></div>
      {loading ? <div className="empty-state">Loading products…</div> : products.length ? <div className="admin-product-grid compact-grid">{products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} showActions={false} />)}</div> : <div className="empty-state"><h2>Your catalogue is waiting</h2><p>Add your first product to get started.</p><Link to="/admin/products/new" className="button primary-button">Add first product</Link></div>}
    </>
  );
}

function AdminProductsPage() {
  const { products, loading, error, deleteProduct } = useProducts();
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionError, setActionError] = useState("");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => !query || [product.name, product.description, product.origin, product.category]
      .some((value) => String(value || "").toLowerCase().includes(query)));
  }, [products, search]);

  async function confirmDelete() {
    try {
      await deleteProduct(pendingDelete.id);
      setPendingDelete(null);
      setActionError("");
    } catch (requestError) {
      setActionError(requestError.message);
    }
  }

  return (
    <>
      <PageHeading eyebrow="CATALOGUE MANAGEMENT" title="Your products" description="Search your catalogue, open product details, or make changes to what customers see." action={<Link to="/admin/products/new" className="button primary-button">＋ Add product</Link>} />
      <section className="catalogue-panel">
        <div className="catalogue-toolbar"><div><h2>All products</h2><p>{filtered.length} of {products.length} products</p></div><label className="admin-search"><span>⌕</span><input aria-label="Search products" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, origin or category…" /></label></div>
        {(error || actionError) && <p className="notice error" role="alert">{actionError || error}</p>}
        {loading ? <div className="empty-state">Loading products from the store API…</div> : filtered.length ? <div className="admin-product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onDelete={setPendingDelete} />)}</div> : <div className="empty-state"><h2>{search ? "No matching products" : "No products yet"}</h2><p>{search ? "Try another name, origin, or category." : "Add your first product to start building the catalogue."}</p>{!search && <Link className="button primary-button" to="/admin/products/new">Add a product</Link>}</div>}
      </section>
      {pendingDelete && <div className="modal-backdrop"><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><h2 id="confirm-title">Delete {pendingDelete.name}?</h2><p>This removes the product from your catalogue. This action cannot be undone.</p><div className="dialog-actions"><button className="button neutral-button" type="button" onClick={() => setPendingDelete(null)}>Cancel</button><button className="button danger-button" type="button" onClick={confirmDelete}>Delete product</button></div></section></div>}
    </>
  );
}

const blankProduct = { name: "", description: "", origin: "", category: "Whole Bean", price: "", stock: "", badge: "", accent: "cream" };

function ProductFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { products, loading, addProduct, updateProduct } = useProducts();
  const product = products.find((item) => String(item.id) === String(id));
  const [form, setForm] = useState(blankProduct);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) setForm({ ...blankProduct, ...product, price: String(product.price), stock: String(product.stock) });
  }, [product]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!form.name.trim() || !form.description.trim() || !form.origin.trim()) {
      setError("Complete the product name, description, and origin.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a price greater than zero.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number of zero or more.");
      return;
    }
    setSaving(true);
    setError("");
    const values = { ...form, name: form.name.trim(), description: form.description.trim(), origin: form.origin.trim(), price, stock };
    try {
      if (editing) {
        await updateProduct(id, values);
        navigate(`/admin/products/${id}`);
      } else {
        const created = await addProduct(values);
        navigate(`/admin/products/${created.id}`);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (editing && loading) return <div className="empty-state">Loading product…</div>;
  if (editing && !product) return <div className="empty-state"><h2>Product not found</h2><Link to="/admin/products">Return to products</Link></div>;

  return (
    <>
      <Link className="back-link" to={editing ? `/admin/products/${id}` : "/admin/products"}>← Back to {editing ? "product" : "products"}</Link>
      <PageHeading eyebrow={editing ? "EDIT CATALOGUE ITEM" : "NEW CATALOGUE ITEM"} title={editing ? "Edit product" : "Add a product"} description="Enter the product information, origin, price, and available stock." />
      <form className="product-form-panel" onSubmit={handleSubmit}>
        {error && <p className="notice error" role="alert">{error}</p>}
        <div className="form-section-title"><span>01</span><div><h2>Product information</h2><p>Give your product a clear name and description.</p></div></div>
        <div className="form-grid">
          <label className="form-field full-field"><span>Product name *</span><input name="name" value={form.name} onChange={updateField} maxLength="70" placeholder="e.g. Vanilla Bean" required /></label>
          <label className="form-field full-field"><span>Description *</span><textarea name="description" value={form.description} onChange={updateField} rows="4" maxLength="400" placeholder="Describe the flavour, aroma, or benefits…" required /></label>
          <label className="form-field"><span>Origin *</span><input name="origin" value={form.origin} onChange={updateField} placeholder="e.g. Colombia" required /></label>
          <label className="form-field"><span>Category</span><select name="category" value={form.category} onChange={updateField}><option>Whole Bean</option><option>Ground Coffee</option><option>Coffee Packs</option><option>Equipment</option><option>Accessories</option></select></label>
        </div>
        <div className="form-section-title second-section"><span>02</span><div><h2>Pricing & inventory</h2><p>Set the selling price and available quantity.</p></div></div>
        <div className="form-grid">
          <label className="form-field"><span>Price (KES) *</span><div className="price-input"><span>KSh</span><input name="price" aria-label="Price (KES) *" type="number" min="1" step="1" value={form.price} onChange={updateField} placeholder="850" required /></div></label>
          <label className="form-field"><span>Stock quantity *</span><input name="stock" type="number" min="0" step="1" value={form.stock} onChange={updateField} placeholder="20" required /></label>
          <label className="form-field"><span>Product label</span><select name="badge" value={form.badge} onChange={updateField}><option value="">No label</option><option>Bestseller</option><option>Popular</option><option>New arrival</option><option>Limited stock</option></select></label>
          <label className="form-field"><span>Card accent</span><select name="accent" value={form.accent} onChange={updateField}><option value="cream">Cream</option><option value="brown">Coffee brown</option><option value="orange">Sunrise</option><option value="sage">Sage green</option></select></label>
        </div>
        <div className="form-actions"><button className="button primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add product"}</button></div>
      </form>
    </>
  );
}

function AdminProductDetailPage() {
  const { id } = useParams();
  const { products, loading, updateProduct } = useProducts();
  const product = products.find((item) => String(item.id) === String(id));
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setPrice(String(product.price));
      setStock(String(product.stock));
    }
  }, [product]);

  async function saveQuickChanges(event) {
    event.preventDefault();
    const nextPrice = Number(price);
    const nextStock = Number(stock);
    if (!Number.isFinite(nextPrice) || nextPrice <= 0 || !Number.isInteger(nextStock) || nextStock < 0) {
      setError("Enter a positive price and a whole-number stock quantity of zero or more.");
      return;
    }
    setSaving(true);
    setNotice("");
    setError("");
    try {
      await updateProduct(id, { price: nextPrice, stock: nextStock });
      setNotice("Price and stock updated successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">Loading product…</div>;
  if (!product) return <div className="empty-state"><h2>Product not found</h2><Link to="/admin/products">Back to products</Link></div>;

  return (
    <>
      <Link className="back-link" to="/admin/products">← Back to products</Link>
      <PageHeading eyebrow="PRODUCT DETAILS" title={product.name} description="View this product and quickly change its price or available stock." action={<Link className="button neutral-button" to={`/admin/products/${id}/edit`}>Edit all details</Link>} />
      {notice && <p className="notice success" role="status">{notice}</p>}
      {error && <p className="notice error" role="alert">{error}</p>}
      <div className="admin-detail-grid">
        <section className="detail-information"><div className={`admin-detail-art ${product.accent || "cream"}`}>☕</div><div className="detail-information-copy"><span className="section-eyebrow">{product.category}</span><h2>About this product</h2><p>{product.description}</p><dl><div><dt>Origin</dt><dd>{product.origin}</dd></div><div><dt>Stock</dt><dd>{product.stock} units</dd></div><div><dt>Product ID</dt><dd>#{product.id}</dd></div></dl></div></section>
        <form className="quick-edit-panel" onSubmit={saveQuickChanges}><span className="section-eyebrow">QUICK UPDATE</span><h2>Price & inventory</h2><strong>{formatPrice(product.price)}</strong><label className="form-field"><span>New price (KES)</span><input type="number" min="1" step="1" value={price} onChange={(event) => setPrice(event.target.value)} required /></label><label className="form-field"><span>Available stock</span><input type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} required /></label><button className="button primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save price & stock"}</button></form>
      </div>
    </>
  );
}

function NotFoundPage() {
  return <div className="empty-state not-found"><span className="section-eyebrow">404 · PAGE NOT FOUND</span><h1>Looks like this page wandered off.</h1><Link to="/">Return to Coffee R Us</Link></div>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route index element={<StoreHomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="shop/:id" element={<ShopProductPage />} />
      </Route>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<AdminProductDetailPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
