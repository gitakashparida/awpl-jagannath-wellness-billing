/* === CUSTOMER MANAGEMENT === */

document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const addCustomerBtn = document.getElementById("add-customer-btn");
    const newCustomerName = document.getElementById("new-customer-name");
    const newCustomerPhone = document.getElementById("new-customer-phone");
    const newCustomerBalance = document.getElementById("new-customer-balance");
    const newCustomerSp = document.getElementById("new-customer-sp");

    const customerSearch = document.getElementById("customer-search");
    const customerSearchDropdown = document.getElementById("customer-search-dropdown");
    const loadCustomerBtn = document.getElementById("load-customer-btn");

    const customerSummary = document.getElementById("customer-summary");
    const customerSummaryHeader = document.getElementById("customer-summary-header");
    const customerCurrentBal = document.getElementById("customer-current-bal");
    const customerCurrentSp = document.getElementById("customer-current-sp");

    const customerActivityPanel = document.getElementById("customer-activity-panel");
    const paymentAmount = document.getElementById("activity-payment-amount");
    const recordPaymentBtn = document.getElementById("record-payment-btn");
    const spAmount = document.getElementById("activity-sp-amount");
    const recordSpBtn = document.getElementById("record-sp-btn");

    const activityHistoryDiv = document.getElementById("customer-activity-history");

    let activeCustomer = null;

    // Helper for Supabase REST calls
    async function supabaseFetch(path, opts = {}) {
        const headers = {
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
            "Content-Type": "application/json",
            ...opts.headers,
        };
        return fetch(`https://gfyuuslvnlkbqztbduys.supabase.co${path}`, { ...opts, headers });
    }

    /* --- Add new customer --- */
    if (addCustomerBtn) {
        addCustomerBtn.addEventListener("click", async () => {
            const payload = {
                name: newCustomerName.value.trim(),
                phone: newCustomerPhone.value.trim(),
                balance_due: parseFloat(newCustomerBalance.value) || 0,
                sp_due: parseFloat(newCustomerSp.value) || 0,
            };
            if (!payload.name) { alert("Enter customer name"); return; }

            const res = await supabaseFetch("/rest/v1/customers", {
                method: "POST",
                headers: { Prefer: "return=representation" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) { alert("Failed to add customer"); return; }
            const data = await res.json();
            alert(`Customer added with UID: ${data[0].uid}`);
            newCustomerName.value = newCustomerPhone.value = newCustomerBalance.value = newCustomerSp.value = "";
        });
    }

    /* --- Search customers --- */
    if (customerSearch) {
        customerSearch.addEventListener("input", async () => {
            const q = customerSearch.value.trim().toLowerCase();
            if (!customerSearchDropdown) return;
            
            customerSearchDropdown.innerHTML = "";
            if (!q) { customerSearchDropdown.style.display = "none"; return; }

            const res = await supabaseFetch(`/rest/v1/customers?select=uid,name,phone&or=(name.ilike.*${q}*,phone.ilike.*${q}*)&limit=10`);
            if (!res.ok) return;
            const list = await res.json();

            list.forEach(c => {
                const div = document.createElement("div");
                div.className = "dropdown-item";
                div.textContent = `${c.name}${c.phone ? " (" + c.phone + ")" : ""}`;
                div.addEventListener("click", () => {
                    customerSearch.value = c.name;
                    customerSearch.dataset.uid = c.uid;
                    customerSearchDropdown.style.display = "none";
                });
                customerSearchDropdown.appendChild(div);
            });
            customerSearchDropdown.style.display = list.length ? "block" : "none";
        });
    }

    /* --- Load customer + history --- */
    if (loadCustomerBtn) {
        loadCustomerBtn.addEventListener("click", async () => {
            const uid = customerSearch.dataset.uid;
            if (!uid) { alert("Pick from search dropdown"); return; }

            const res = await supabaseFetch(`/rest/v1/customers?uid=eq.${uid}&select=*`);
            const arr = await res.json();
            activeCustomer = arr[0];
            if (!activeCustomer) return;

            if (customerSummary) customerSummary.style.display = "block";
            if (customerActivityPanel) customerActivityPanel.style.display = "block";
            if (customerSummaryHeader) customerSummaryHeader.textContent = `${activeCustomer.name} (UID ${activeCustomer.uid})`;
            if (customerCurrentBal) customerCurrentBal.textContent = `Balance Due: ₹${parseFloat(activeCustomer.balance_due).toFixed(2)}`;
            if (customerCurrentSp) customerCurrentSp.textContent = `SP Due: ${parseFloat(activeCustomer.sp_due).toFixed(4)}`;

            loadHistory();
        });
    }

    /* --- Load activity history --- */
    async function loadHistory() {
        if (!activeCustomer || !activityHistoryDiv) return;
        
        const res = await supabaseFetch(`/rest/v1/customer_activities?customer_uid=eq.${activeCustomer.uid}&order=created_at.desc&limit=50`);
        const acts = await res.json();
        activityHistoryDiv.innerHTML = acts.map(a =>
            `<div><strong>${a.activity_type}</strong> • ${a.amount ? "₹" + a.amount : ""}${a.sp_amount ? " SP:" + a.sp_amount : ""} <em>${new Date(a.created_at).toLocaleString()}</em></div><br>`
        ).join("");
    }

    /* --- Record payment --- */
    if (recordPaymentBtn) {
        recordPaymentBtn.addEventListener("click", async () => {
            if (!activeCustomer) { alert("No customer selected"); return; }
            
            const amt = parseFloat(paymentAmount.value);
            if (!amt) return;
            
            await supabaseFetch("/rest/v1/customer_activities", {
                method: "POST",
                headers: { Prefer: "return=representation" },
                body: JSON.stringify({ customer_uid: activeCustomer.uid, activity_type: "Payment Received", amount: amt }),
            });
            
            const newBalance = parseFloat(activeCustomer.balance_due) - amt;
            await supabaseFetch(`/rest/v1/customers?uid=eq.${activeCustomer.uid}`, {
                method: "PATCH",
                headers: { Prefer: "return=representation" },
                body: JSON.stringify({ balance_due: newBalance }),
            });
            
            activeCustomer.balance_due = newBalance;
            if (customerCurrentBal) customerCurrentBal.textContent = `Balance Due: ₹${newBalance.toFixed(2)}`;
            paymentAmount.value = "";
            loadHistory();
        });
    }

    /* --- Record SP availed --- */
    if (recordSpBtn) {
        recordSpBtn.addEventListener("click", async () => {
            if (!activeCustomer) { alert("No customer selected"); return; }
            
            const sp = parseFloat(spAmount.value);
            if (!sp) return;
            
            await supabaseFetch("/rest/v1/customer_activities", {
                method: "POST",
                headers: { Prefer: "return=representation" },
                body: JSON.stringify({ customer_uid: activeCustomer.uid, activity_type: "SP Availed", sp_amount: sp }),
            });
            
            const newSpDue = parseFloat(activeCustomer.sp_due) - sp;
            await supabaseFetch(`/rest/v1/customers?uid=eq.${activeCustomer.uid}`, {
                method: "PATCH",
                headers: { Prefer: "return=representation" },
                body: JSON.stringify({ sp_due: newSpDue }),
            });
            
            activeCustomer.sp_due = newSpDue;
            if (customerCurrentSp) customerCurrentSp.textContent = `SP Due: ${newSpDue.toFixed(4)}`;
            spAmount.value = "";
            loadHistory();
        });
    }
});
