import React, { useMemo, useState } from "react";
import "./App.css";

const AUTH_KEY = "real_estate_crm_auth";
const DATA_KEY = "real_estate_crm_data";
const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "admin123";

const initialData = {
  clients: [
    {
      id: "CL-001",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "(555) 012-9021",
      type: "Buyer",
      budget: 650000,
      notes: "Looking for 3 bed near downtown.",
    },
  ],
  properties: [
    {
      id: "PR-001",
      title: "Maple Street Family Home",
      address: "145 Maple St, Austin, TX",
      price: 589000,
      status: "Available",
      beds: 3,
      baths: 2,
      sqft: 1860,
    },
  ],
  deals: [
    {
      id: "DL-001",
      clientId: "CL-001",
      propertyId: "PR-001",
      stage: "Viewing",
      value: 589000,
      closeDate: "2026-06-18",
    },
  ],
  tasks: [
    {
      id: "TK-001",
      title: "Schedule viewing with Sarah",
      dueDate: "2026-05-25",
      priority: "High",
      done: false,
    },
  ],
};

const readLocal = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const idFor = (prefix, list) => `${prefix}-${String(list.length + 1).padStart(3, "0")}`;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => readLocal(AUTH_KEY, false));
  const [tab, setTab] = useState("Dashboard");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [data, setData] = useState(() => readLocal(DATA_KEY, initialData));

  const [clientForm, setClientForm] = useState({ name: "", email: "", phone: "", type: "Buyer", budget: "", notes: "" });
  const [propertyForm, setPropertyForm] = useState({ title: "", address: "", price: "", status: "Available", beds: "", baths: "", sqft: "" });
  const [dealForm, setDealForm] = useState({ clientId: "", propertyId: "", stage: "Lead", value: "", closeDate: "" });
  const [taskForm, setTaskForm] = useState({ title: "", dueDate: "", priority: "Medium" });

  const persistData = (next) => {
    setData(next);
    localStorage.setItem(DATA_KEY, JSON.stringify(next));
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (loginForm.username.trim() === ADMIN_USERNAME && loginForm.password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem(AUTH_KEY, JSON.stringify(true));
      setLoginError("");
      return;
    }
    setLoginError("Invalid credentials. Use Admin / admin123");
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem(AUTH_KEY, JSON.stringify(false));
  };

  const metrics = useMemo(() => {
    const pipeline = data.deals.reduce((sum, d) => sum + Number(d.value || 0), 0);
    const openTasks = data.tasks.filter((t) => !t.done).length;
    const availableProps = data.properties.filter((p) => p.status === "Available").length;
    return { pipeline, openTasks, availableProps };
  }, [data]);

  const addClient = (event) => {
    event.preventDefault();
    const next = {
      id: idFor("CL", data.clients),
      name: clientForm.name,
      email: clientForm.email,
      phone: clientForm.phone,
      type: clientForm.type,
      budget: Number(clientForm.budget || 0),
      notes: clientForm.notes,
    };
    persistData({ ...data, clients: [next, ...data.clients] });
    setClientForm({ name: "", email: "", phone: "", type: "Buyer", budget: "", notes: "" });
  };

  const addProperty = (event) => {
    event.preventDefault();
    const next = {
      id: idFor("PR", data.properties),
      title: propertyForm.title,
      address: propertyForm.address,
      price: Number(propertyForm.price || 0),
      status: propertyForm.status,
      beds: Number(propertyForm.beds || 0),
      baths: Number(propertyForm.baths || 0),
      sqft: Number(propertyForm.sqft || 0),
    };
    persistData({ ...data, properties: [next, ...data.properties] });
    setPropertyForm({ title: "", address: "", price: "", status: "Available", beds: "", baths: "", sqft: "" });
  };

  const addDeal = (event) => {
    event.preventDefault();
    if (!dealForm.clientId || !dealForm.propertyId) return;
    const next = {
      id: idFor("DL", data.deals),
      clientId: dealForm.clientId,
      propertyId: dealForm.propertyId,
      stage: dealForm.stage,
      value: Number(dealForm.value || 0),
      closeDate: dealForm.closeDate,
    };
    persistData({ ...data, deals: [next, ...data.deals] });
    setDealForm({ clientId: "", propertyId: "", stage: "Lead", value: "", closeDate: "" });
  };

  const addTask = (event) => {
    event.preventDefault();
    const next = {
      id: idFor("TK", data.tasks),
      title: taskForm.title,
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
      done: false,
    };
    persistData({ ...data, tasks: [next, ...data.tasks] });
    setTaskForm({ title: "", dueDate: "", priority: "Medium" });
  };

  const toggleTask = (id) => {
    persistData({ ...data, tasks: data.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });
  };

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <form className="card" onSubmit={handleLogin}>
          <h1>Real Estate CRM</h1>
          <p>Login to manage your agency.</p>
          <input placeholder="Username" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} />
          <input type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
          {loginError && <p className="error">{loginError}</p>}
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar">
        <h2>Real Estate CRM</h2>
        <div className="tabs">
          {["Dashboard", "Clients", "Properties", "Deals", "Tasks"].map((name) => (
            <button key={name} onClick={() => setTab(name)}>{name}</button>
          ))}
        </div>
        <button onClick={logout}>Logout</button>
      </nav>

      <main className="layout">
        {tab === "Dashboard" && (
          <section className="grid3">
            <article className="card"><h3>Clients</h3><strong>{data.clients.length}</strong></article>
            <article className="card"><h3>Available Properties</h3><strong>{metrics.availableProps}</strong></article>
            <article className="card"><h3>Open Tasks</h3><strong>{metrics.openTasks}</strong></article>
            <article className="card span2"><h3>Pipeline Value</h3><strong>${metrics.pipeline.toLocaleString()}</strong></article>
          </section>
        )}

        {tab === "Clients" && (
          <section className="split">
            <form className="card" onSubmit={addClient}>
              <h3>Add Client</h3>
              <input required placeholder="Name" value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} />
              <input required placeholder="Email" value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} />
              <input required placeholder="Phone" value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
              <select value={clientForm.type} onChange={(e) => setClientForm({ ...clientForm, type: e.target.value })}><option>Buyer</option><option>Seller</option><option>Investor</option></select>
              <input type="number" placeholder="Budget" value={clientForm.budget} onChange={(e) => setClientForm({ ...clientForm, budget: e.target.value })} />
              <textarea placeholder="Notes" value={clientForm.notes} onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })} />
              <button type="submit">Save Client</button>
            </form>
            <div className="card tableWrap"><h3>Client List</h3>{data.clients.map((c) => <p key={c.id}><b>{c.name}</b> ({c.type}) • {c.phone}</p>)}</div>
          </section>
        )}

        {tab === "Properties" && (
          <section className="split">
            <form className="card" onSubmit={addProperty}>
              <h3>Add Property</h3>
              <input required placeholder="Title" value={propertyForm.title} onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })} />
              <input required placeholder="Address" value={propertyForm.address} onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })} />
              <input type="number" required placeholder="Price" value={propertyForm.price} onChange={(e) => setPropertyForm({ ...propertyForm, price: e.target.value })} />
              <input type="number" placeholder="Beds" value={propertyForm.beds} onChange={(e) => setPropertyForm({ ...propertyForm, beds: e.target.value })} />
              <input type="number" placeholder="Baths" value={propertyForm.baths} onChange={(e) => setPropertyForm({ ...propertyForm, baths: e.target.value })} />
              <input type="number" placeholder="Sq Ft" value={propertyForm.sqft} onChange={(e) => setPropertyForm({ ...propertyForm, sqft: e.target.value })} />
              <select value={propertyForm.status} onChange={(e) => setPropertyForm({ ...propertyForm, status: e.target.value })}><option>Available</option><option>Under Contract</option><option>Sold</option></select>
              <button type="submit">Save Property</button>
            </form>
            <div className="card tableWrap"><h3>Property List</h3>{data.properties.map((p) => <p key={p.id}><b>{p.title}</b> • ${p.price.toLocaleString()} • {p.status}</p>)}</div>
          </section>
        )}

        {tab === "Deals" && (
          <section className="split">
            <form className="card" onSubmit={addDeal}>
              <h3>Create Deal</h3>
              <select required value={dealForm.clientId} onChange={(e) => setDealForm({ ...dealForm, clientId: e.target.value })}><option value="">Select Client</option>{data.clients.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}</select>
              <select required value={dealForm.propertyId} onChange={(e) => setDealForm({ ...dealForm, propertyId: e.target.value })}><option value="">Select Property</option>{data.properties.map((p) => <option value={p.id} key={p.id}>{p.title}</option>)}</select>
              <select value={dealForm.stage} onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value })}><option>Lead</option><option>Viewing</option><option>Offer</option><option>Negotiation</option><option>Closed</option></select>
              <input type="number" placeholder="Deal Value" value={dealForm.value} onChange={(e) => setDealForm({ ...dealForm, value: e.target.value })} />
              <input type="date" value={dealForm.closeDate} onChange={(e) => setDealForm({ ...dealForm, closeDate: e.target.value })} />
              <button type="submit">Save Deal</button>
            </form>
            <div className="card tableWrap"><h3>Deal Pipeline</h3>{data.deals.map((d) => <p key={d.id}><b>{d.id}</b> • {d.stage} • ${d.value.toLocaleString()}</p>)}</div>
          </section>
        )}

        {tab === "Tasks" && (
          <section className="split">
            <form className="card" onSubmit={addTask}>
              <h3>Add Task</h3>
              <input required placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
              <input type="date" required value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select>
              <button type="submit">Save Task</button>
            </form>
            <div className="card tableWrap"><h3>Task List</h3>{data.tasks.map((t) => <p key={t.id}><input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} /> {t.title} ({t.priority})</p>)}</div>
          </section>
        )}
      </main>
    </div>
  );
}
