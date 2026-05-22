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

export default addInvoice;
