import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";
import { ProductsProvider } from "./hooks/ProductsContext.jsx";

const starterProducts = [
  {
    id: 1,
    name: "Vanilla Bean",
    description: "A smooth medium roast with vanilla notes.",
    origin: "Colombia",
    category: "Whole Bean",
    price: 850,
    stock: 24,
    badge: "Bestseller",
    accent: "cream",
  },
  {
    id: 2,
    name: "House Blend",
    description: "A rich dark roast with a bold flavour.",
    origin: "Vietnam",
    category: "Ground Coffee",
    price: 950,
    stock: 18,
    badge: "Popular",
    accent: "brown",
  },
  {
    id: 3,
    name: "Ethiopian Sunrise",
    description: "A bright light roast with citrus notes.",
    origin: "Ethiopia",
    category: "Whole Bean",
    price: 1100,
    stock: 12,
    badge: "New arrival",
    accent: "orange",
  },
];

let products;
let nextId;

function installApiMock() {
  vi.stubGlobal("fetch", vi.fn(async (input, options = {}) => {
    const url = new URL(typeof input === "string" ? input : input.url, "http://localhost");
    const method = (options.method || "GET").toUpperCase();
    const match = url.pathname.match(/^\/products(?:\/(\d+))?$/);
    if (!match) {
      return { ok: false, status: 404, text: async () => JSON.stringify({ message: "Not found" }) };
    }

    const id = match[1];
    let result = null;

    if (method === "GET" && !id) {
      result = [...products].sort((a, b) => Number(b.id) - Number(a.id));
    } else if (method === "GET" && id) {
      result = products.find((product) => String(product.id) === id) || null;
      if (!result) return { ok: false, status: 404, text: async () => "Not found" };
    } else if (method === "POST") {
      const body = JSON.parse(options.body);
      result = { id: nextId++, ...body };
      products.unshift(result);
    } else if (method === "PATCH" && id) {
      const body = JSON.parse(options.body);
      products = products.map((product) => String(product.id) === id ? { ...product, ...body } : product);
      result = products.find((product) => String(product.id) === id);
    } else if (method === "DELETE" && id) {
      products = products.filter((product) => String(product.id) !== id);
      return { ok: true, status: 200, text: async () => JSON.stringify({}) };
    }

    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify(result),
    };
  }));
}

function renderAt(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ProductsProvider>
        <App />
      </ProductsProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  products = starterProducts.map((product) => ({ ...product }));
  nextId = 4;
  installApiMock();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Coffee R Us application routes", () => {
  it("navigates between the home, shop, and administrator pages", async () => {
    const user = userEvent.setup();
    renderAt("/");

    expect(screen.getByRole("heading", { name: "Coffee R Us" })).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: /Explore the shop/i }));
    expect(await screen.findByRole("heading", { name: "Shop our coffee" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Admin Portal" }));
    expect(await screen.findByRole("heading", { name: "Good morning, admin" })).toBeInTheDocument();
  });

  it("filters shop products by name, description, and origin", async () => {
    const user = userEvent.setup();
    renderAt("/shop");

    expect(await screen.findByText("Vanilla Bean")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "Ethiopia");

    expect(screen.getByText("Ethiopian Sunrise")).toBeInTheDocument();
    expect(screen.queryByText("Vanilla Bean")).not.toBeInTheDocument();
  });
});

describe("administrator product management", () => {
  it("creates a product and updates its price and stock", async () => {
    const user = userEvent.setup();
    renderAt("/admin/products/new");

    await user.type(await screen.findByLabelText("Product name *"), "Moringa House Blend");
    await user.type(screen.getByLabelText("Description *"), "A balanced medium roast made for everyday coffee.");
    await user.type(screen.getByLabelText("Origin *"), "Kenya");
    await user.type(screen.getByRole("spinbutton", { name: "Price (KES) *" }), "1250");
    await user.type(screen.getByLabelText("Stock quantity *"), "15");
    await user.click(screen.getByRole("button", { name: "Add product" }));

    expect(await screen.findByRole("heading", { name: "Moringa House Blend" })).toBeInTheDocument();
    await user.clear(screen.getByLabelText("New price (KES)"));
    await user.type(screen.getByLabelText("New price (KES)"), "1350");
    await user.clear(screen.getByLabelText("Available stock"));
    await user.type(screen.getByLabelText("Available stock"), "10");
    await user.click(screen.getByRole("button", { name: "Save price & stock" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Price and stock updated successfully.");
    expect(products.find((product) => product.name === "Moringa House Blend")).toMatchObject({
      price: 1350,
      stock: 10,
    });
  });

  it("deletes a product after administrator confirmation", async () => {
    const user = userEvent.setup();
    renderAt("/admin/products");

    expect(await screen.findByRole("heading", { name: "Your products" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete Vanilla Bean" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete product" }));

    await waitFor(() => {
      expect(screen.queryByRole("link", { name: "Vanilla Bean" })).not.toBeInTheDocument();
    });
    expect(products.some((product) => product.name === "Vanilla Bean")).toBe(false);
  });
});
