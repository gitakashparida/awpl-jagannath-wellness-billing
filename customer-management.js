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
        const baseUrl = 'https://gfyuuslvnlkbqztbduys.supabase.co';
        const fullUrl = `${baseUrl}${path}`;
        
        const headers = {
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
            "Content-Type": "application/json",
            ...opts.headers,
        };

        console.log('Making request to:', fullUrl);
        console.log('Request options:', { method: opts.method || 'GET', headers });

        try {
            const response = await fetch(fullUrl, { 
                ...opts, 
                headers,
                mode: 'cors', // Explicitly set CORS mode
                credentials: 'same-origin' // Include credentials for same-origin requests
            });

            // Clone the response so we can read it multiple times
            const responseClone = response.clone();
            
            if (!response.ok) {
                try {
                    const errorText = await response.text();
                    console.error('Request failed:', {
                        status: response.status,
                        statusText: response.statusText,
                        url: fullUrl,
                        error: errorText
                    });
                } catch (e) {
                    console.error('Failed to read error response:', e);
                }
                // Return the original response for error handling by the caller
                return response;
            }

            // For successful responses, return the cloned response
            return responseClone;
        } catch (error) {
            console.error('Fetch error:', {
                url: fullUrl,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
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
            if (customerSummaryHeader) customerSummaryHeader.textContent = activeCustomer.name;
            if (customerCurrentBal) customerCurrentBal.textContent = `₹${parseFloat(activeCustomer.balance_due).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            if (customerCurrentSp) customerCurrentSp.textContent = parseFloat(activeCustomer.sp_due).toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

            loadHistory();
        });
    }

    /* --- Load activity history --- */
    async function loadHistory() {
        if (!activityHistoryDiv) return;
        if (!activeCustomer || !activeCustomer.uid) {
            console.error('No active customer or customer UID is missing');
            activityHistoryDiv.innerHTML = '<p>No customer selected</p>';
            return;
        }
        
        // Show loading state
        activityHistoryDiv.innerHTML = '<p>Loading activity history...</p>';
        
        try {
            const url = `/rest/v1/customer_activities?customer_uid=eq.${encodeURIComponent(activeCustomer.uid)}&order=created_at.desc&limit=50`;
            console.log('Fetching from URL:', url);
            
            const res = await supabaseFetch(url);
            
            // Handle error response
            if (!res.ok) {
                let errorMessage = `Error ${res.status}: ${res.statusText}`;
                try {
                    const errorData = await res.json();
                    errorMessage += ` - ${JSON.stringify(errorData)}`;
                } catch (e) {
                    // If we can't parse JSON, try to get text
                    try {
                        const errorText = await res.text();
                        if (errorText) errorMessage += ` - ${errorText}`;
                    } catch (textError) {
                        console.error('Could not read error response:', textError);
                    }
                }
                console.error('API Error:', errorMessage);
                activityHistoryDiv.innerHTML = `<p class="error">Error loading activity history: ${res.status} ${res.statusText}</p>`;
                return;
            }
            
            // If we get here, the request was successful
            const acts = await res.json();
            if (!Array.isArray(acts)) {
                console.error('Unexpected response format:', acts);
                throw new Error('Invalid response format from server');
            }
            
            // Sort activities by date descending (newest first)
            const sortedActs = [...acts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            // Calculate running totals starting from the current balance
            let runningBalance = parseFloat(activeCustomer.balance_due);
            let runningSpDue = parseFloat(activeCustomer.sp_due);
            
            // Calculate the balance before each transaction by working backwards
            const activitiesWithBalances = sortedActs.map(activity => {
                const activityCopy = { ...activity };
                
                // Store the balance after this transaction
                activityCopy.updated_balance = runningBalance.toFixed(2);
                activityCopy.updated_sp_due = runningSpDue.toFixed(4);
                
                // Now adjust the running balance to what it was before this transaction
                if (activity.balance_reduced) {
                    runningBalance += parseFloat(activity.balance_reduced || 0);
                } else if (activity.balance_added) {
                    runningBalance -= parseFloat(activity.balance_added || 0);
                }
                
                if (activity.sp_reduced) {
                    runningSpDue += parseFloat(activity.sp_reduced || 0);
                } else if (activity.sp_added) {
                    runningSpDue -= parseFloat(activity.sp_added || 0);
                }
                
                return activityCopy;
            });
            
            // Create table with headers
            let html = `
                <table class="activity-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>New Order Amount (₹)</th>
                            <th>Payment Received (₹)</th>
                            <th>New Order SP</th>
                            <th>SP Used</th>
                            <th>Balance Not Paid (₹)</th>
                            <th>SP Not Used</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            // Add rows for each activity
            activitiesWithBalances.forEach(activity => {
                const date = new Date(activity.created_at);
                const formattedDate = date.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
                
                html += `
                    <tr>
                        <td>${formattedDate}</td>
                        <td>${activity.note || '-'}</td>
                        <td class="text-right">${activity.balance_added ? '₹' + parseFloat(activity.balance_added).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                        <td class="text-right">${activity.balance_reduced ? '₹' + parseFloat(activity.balance_reduced).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                        <td class="text-right">${activity.sp_added ? parseFloat(activity.sp_added).toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : '-'}</td>
                        <td class="text-right">${activity.sp_reduced ? parseFloat(activity.sp_reduced).toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : '-'}</td>
                        <td class="text-right">₹${parseFloat(activity.updated_balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td class="text-right">${parseFloat(activity.updated_sp_due).toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
                    </tr>
                `;
            });
            
            // Close table
            html += `
                    </tbody>
                </table>
                ${acts.length === 0 ? '<p>No activity history found.</p>' : ''}
            `;
            
            // Wrap the table in a container for better responsiveness
            if (acts.length > 0) {
                html = `
                <div class="table-container">
                    ${html}
                </div>`;
            }
            
            activityHistoryDiv.innerHTML = html;
        } catch (error) {
            console.error('Error loading activity history:', error);
            activityHistoryDiv.innerHTML = '<p class="error">Error loading activity history. Please try again later.</p>';
        }
    }

    // Get all note input elements
    const paymentNoteInput = document.getElementById("payment-note");
    const spUsedNoteInput = document.getElementById("sp-used-note");
    const spNotUsedNoteInput = document.getElementById("sp-notused-note");
    const advancePaymentNoteInput = document.getElementById("advance-payment-note");
    
    /* --- Record payment --- */
    if (recordPaymentBtn) {
        recordPaymentBtn.addEventListener("click", async () => {
            if (!activeCustomer) { alert("No customer selected"); return; }
            
            const amt = parseFloat(paymentAmount.value);
            if (!amt) return;
            
            // Get the payment note text or use a default message
            const noteText = paymentNoteInput.value.trim() || "Amount Received";
            
            await supabaseFetch("/rest/v1/customer_activities", {
                method: "POST",
                headers: { Prefer: "return=representation" },
                body: JSON.stringify({ 
                    customer_uid: activeCustomer.uid, 
                    balance_reduced: amt,
                    note: noteText
                }),
            });
            
            // Clear the note input after submission
            paymentNoteInput.value = "";
            
            const newBalance = parseFloat(activeCustomer.balance_due) - amt;
            await supabaseFetch(`/rest/v1/customers?uid=eq.${activeCustomer.uid}`, {
                method: "PATCH",
                headers: { Prefer: "return=representation" },
                body: JSON.stringify({ balance_due: newBalance }),
            });
            
            activeCustomer.balance_due = newBalance;
            if (customerCurrentBal) customerCurrentBal.textContent = `₹${newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            paymentAmount.value = "";
            loadHistory();
        });
    }

    /* --- Record Advance Payment --- */
    const recordAdvancePaymentBtn = document.getElementById("record-advance-payment-btn");
    const advancePaymentAmount = document.getElementById("advance-payment-amount");
    
    if (recordAdvancePaymentBtn) {
        recordAdvancePaymentBtn.addEventListener("click", async () => {
            if (!activeCustomer) { alert("No customer selected"); return; }
            
            const amt = parseFloat(advancePaymentAmount.value);
            if (!amt || amt <= 0) { alert("Please enter a valid amount"); return; }
            
            // Get the advance payment note text or use the default message
            const noteText = advancePaymentNoteInput.value.trim() || "Advance Payment Received";
            
            await supabaseFetch("/rest/v1/customer_activities", {
                method: "POST",
                headers: { Prefer: "return=representation" },
                body: JSON.stringify({ 
                    customer_uid: activeCustomer.uid, 
                    balance_reduced: amt,
                    note: noteText
                }),
            });
            
            // Clear the note input after submission
            advancePaymentNoteInput.value = "";
            
            const newBalance = parseFloat(activeCustomer.balance_due) - amt;
            await supabaseFetch(`/rest/v1/customers?uid=eq.${activeCustomer.uid}`, {
                method: "PATCH",
                headers: { Prefer: "return=representation" },
                body: JSON.stringify({ balance_due: newBalance }),
            });
            
            activeCustomer.balance_due = newBalance;
            if (customerCurrentBal) customerCurrentBal.textContent = `₹${newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            advancePaymentAmount.value = "";
            loadHistory();
        });
    }

    /* --- Record SP availed --- */
    if (recordSpBtn) {
        recordSpBtn.addEventListener("click", async () => {
            if (!activeCustomer) { alert("No customer selected"); return; }
            
            const sp = parseFloat(spAmount.value);
            if (!sp) return;
            
            // Get the SP used note text or use a default message
            const noteText = spUsedNoteInput.value.trim() || "SP Used";
            
            await supabaseFetch("/rest/v1/customer_activities", {
                method: "POST",
                headers: { Prefer: "return=representation" },
                body: JSON.stringify({ 
                    customer_uid: activeCustomer.uid, 
                    sp_reduced: sp,
                    note: noteText
                }),
            });
            
            // Clear the note input after submission
            spUsedNoteInput.value = "";
            
            const newSpDue = parseFloat(activeCustomer.sp_due) - sp;
            await supabaseFetch(`/rest/v1/customers?uid=eq.${activeCustomer.uid}`, {
                method: "PATCH",
                headers: { Prefer: "return=representation" },
                body: JSON.stringify({ sp_due: newSpDue }),
            });
            
            activeCustomer.sp_due = newSpDue;
            if (customerCurrentSp) customerCurrentSp.textContent = newSpDue.toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
            spAmount.value = "";
            loadHistory();
        });
    }

    /* --- Combined Update for New Order --- */
    const updateOrderBtn = document.getElementById("update-order-btn");
    const addBalanceAmount = document.getElementById("add-balance-amount");
    const addSpAmount = document.getElementById("add-sp-amount");
    const orderNoteInput = document.getElementById("order-note");
    
    if (updateOrderBtn) {
        updateOrderBtn.addEventListener("click", async () => {
            if (!activeCustomer) { 
                alert("No customer selected"); 
                return; 
            }
            
            const balanceAmount = parseFloat(addBalanceAmount.value) || 0;
            const spAmount = parseFloat(addSpAmount.value) || 0;
            
            if (balanceAmount <= 0 && spAmount <= 0) { 
                alert("Please enter a valid amount for either Balance or SP or both"); 
                return; 
            }
            
            // Get the note text or use a default message
            const noteText = orderNoteInput.value.trim() || "New Order Received";
            
            try {
                // Create a single activity entry for both balance and SP
                const activityPayload = {
                    customer_uid: activeCustomer.uid,
                    note: noteText
                };
                
                // Add balance and SP to the payload if they have values
                if (balanceAmount > 0) {
                    activityPayload.balance_added = balanceAmount;
                }
                if (spAmount > 0) {
                    activityPayload.sp_added = spAmount;
                }
                
                // Create the activity entry
                await supabaseFetch("/rest/v1/customer_activities", {
                    method: "POST",
                    headers: { Prefer: "return=representation" },
                    body: JSON.stringify(activityPayload)
                });
                
                // Update customer's balance and SP in a single operation
                const updatePayload = {};
                if (balanceAmount > 0) {
                    const newBalance = parseFloat(activeCustomer.balance_due) + balanceAmount;
                    updatePayload.balance_due = newBalance;
                    activeCustomer.balance_due = newBalance;
                    if (customerCurrentBal) {
                        customerCurrentBal.textContent = `₹${newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    }
                    addBalanceAmount.value = "";
                }
                
                if (spAmount > 0) {
                    const newSpDue = parseFloat(activeCustomer.sp_due) + spAmount;
                    updatePayload.sp_due = newSpDue;
                    activeCustomer.sp_due = newSpDue;
                    if (customerCurrentSp) {
                        customerCurrentSp.textContent = newSpDue.toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
                    }
                    addSpAmount.value = "";
                }
                
                // Only update the customer if there's something to update
                if (Object.keys(updatePayload).length > 0) {
                    await supabaseFetch(`/rest/v1/customers?uid=eq.${activeCustomer.uid}`, {
                        method: "PATCH",
                        headers: { Prefer: "return=representation" },
                        body: JSON.stringify(updatePayload)
                    });
                }
                
                orderNoteInput.value = "";
                loadHistory();
                
            } catch (error) {
                console.error("Error updating order:", error);
                alert("An error occurred while updating the order. Please try again.");
            }
        });
    }
});
