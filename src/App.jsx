import React, { useMemo, useState } from "react";
import "./App.css";

const AUTH_KEY = "nexa_auth";
const INVOICE_KEY = "nexa_invoices";
const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "admin123";

const defaultInvoices = [
  {
    id: "INV-001",
    client: "Acme Inc",
    dueDate: "2026-06-01",
    amount: 850,
    description: "Website redesign",
    status: "Pending",
  },
];

const readLocal = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [activePage, setActivePage] = useState("Home");
  const [isLoggedIn, setIsLoggedIn] = useState(() => readLocal(AUTH_KEY, false));
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [invoices, setInvoices] = useState(() => readLocal(INVOICE_KEY, defaultInvoices));
  const [invoiceForm, setInvoiceForm] = useState({
    client: "",
    dueDate: "",
    amount: "",
    description: "",
  });

  const saveInvoices = (next) => {
    setInvoices(next);
    localStorage.setItem(INVOICE_KEY, JSON.stringify(next));
  };

  const handleLogin = (event) => {
    event.preventDefault();

    if (
      loginForm.username.trim() === ADMIN_USERNAME &&
      loginForm.password === ADMIN_PASSWORD
    ) {
      setIsLoggedIn(true);
      localStorage.setItem(AUTH_KEY, JSON.stringify(true));
      setLoginError("");
      return;
    }

    setLoginError("Invalid credentials. Use Admin / admin123.");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem(AUTH_KEY, JSON.stringify(false));
    setActivePage("Home");
  };

  const totals = useMemo(() => {
    const totalAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    const pendingCount = invoices.filter((invoice) => invoice.status === "Pending").length;
    return { totalAmount, pendingCount };
  }, [invoices]);

  const addInvoice = (event) => {
    event.preventDefault();
    if (!invoiceForm.client || !invoiceForm.dueDate || !invoiceForm.amount) return;

    const nextInvoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
      client: invoiceForm.client,
      dueDate: invoiceForm.dueDate,
      amount: Number(invoiceForm.amount),
      description: invoiceForm.description || "General service",
      status: "Pending",
    };

    saveInvoices([nextInvoice, ...invoices]);
    setInvoiceForm({ client: "", dueDate: "", amount: "", description: "" });
  };

  const markPaid = (id) => {
    const next = invoices.map((invoice) =>
      invoice.id === id ? { ...invoice, status: "Paid" } : invoice,
    );
    saveInvoices(next);
  };

  const deleteInvoice = (id) => {
    const next = invoices.filter((invoice) => invoice.id !== id);
    saveInvoices(next);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={handleLogin}>
          <h1>Nexa Lite</h1>
          <p>Sign in to manage invoice records.</p>
          <label>
            Username
            <input
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              placeholder="Admin"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="admin123"
            />
          </label>
          {loginError && <p className="error-text">{loginError}</p>}
          <button type="submit">Login</button>
          <small>Hardcoded login: Admin / admin123</small>
        </form>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar">
        <div className="logo">Nexa Lite</div>
        <ul className="nav-links">
          <li><button onClick={() => setActivePage("Home")}>Home</button></li>
          <li><button onClick={() => setActivePage("Invoices")}>Invoices</button></li>
        </ul>
        <div className="UserName">
          <p>{ADMIN_USERNAME}</p>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <section className="mainContent">
        {activePage === "Home" && (
          <div className="home">
            <h2>Invoice Record System</h2>
            <p>All invoice data is saved in localStorage and remains available on refresh.</p>
            <div className="stats-row">
              <div className="stat-card">
                <h3>Total Invoices</h3>
                <strong>{invoices.length}</strong>
              </div>
              <div className="stat-card">
                <h3>Pending</h3>
                <strong>{totals.pendingCount}</strong>
              </div>
              <div className="stat-card">
                <h3>Total Value</h3>
                <strong>${totals.totalAmount.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        )}

        {activePage === "Invoices" && (
          <div className="invoices-layout">
            <form className="invoice-form" onSubmit={addInvoice}>
              <h2>Create Invoice</h2>
              <input
                placeholder="Client name"
                value={invoiceForm.client}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, client: e.target.value })}
                required
              />
              <input
                type="date"
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                required
              />
              <input
                type="number"
                min="0"
                placeholder="Amount"
                value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={invoiceForm.description}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
              />
              <button type="submit">Save Invoice</button>
            </form>

            <div className="invoice-table-wrap">
              <h2>Invoice Records</h2>
              <table>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Client</th>
                    <th>Due Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.id}</td>
                      <td>{invoice.client}</td>
                      <td>{invoice.dueDate}</td>
                      <td>${Number(invoice.amount).toFixed(2)}</td>
                      <td>{invoice.status}</td>
                      <td className="actions-cell">
                        <button disabled={invoice.status === "Paid"} onClick={() => markPaid(invoice.id)}>Paid</button>
                        <button className="danger" onClick={() => deleteInvoice(invoice.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
