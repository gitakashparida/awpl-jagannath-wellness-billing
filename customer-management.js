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
    const activityDateFromInput = document.getElementById("activity-date-from");
    const activityDateToInput = document.getElementById("activity-date-to");
    const filterActivitiesBtn = document.getElementById("filter-activities");
    const clearActivityFilterBtn = document.getElementById("clear-activity-filter");
    const paginationControls = document.getElementById("pagination-controls");
    const paginationInfo = document.getElementById("pagination-info");
    const paginationButtons = document.getElementById("pagination-buttons");
    const printActivitiesBtn = document.getElementById("print-activities");

    let activeCustomer = null;
    let currentPage = 1;
    let totalActivities = 0;
    let activitiesPerPage = 50;
    let dateFilter = { from: null, to: null };
    
    // Initialize pagination controls
    if (paginationButtons) {
        paginationButtons.style.display = 'none'; // Hide pagination buttons initially
    }
    if (paginationInfo) {
        paginationInfo.textContent = 'No customer selected';
    }

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
                div.addEventListener("click", async () => {
                    customerSearch.value = c.name;
                    customerSearch.dataset.uid = c.uid;
                    customerSearchDropdown.style.display = "none";
                    
                    // Auto-load customer details
                    const uid = c.uid;
                    const res = await supabaseFetch(`/rest/v1/customers?uid=eq.${uid}&select=*`);
                    const arr = await res.json();
                    activeCustomer = arr[0];
                    if (!activeCustomer) return;

                    if (customerSummary) customerSummary.style.display = "block";
                    if (customerActivityPanel) customerActivityPanel.style.display = "block";
                    if (customerSummaryHeader) customerSummaryHeader.textContent = activeCustomer.name;
                    if (customerCurrentBal) customerCurrentBal.textContent = `₹${parseFloat(activeCustomer.balance_due).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    if (customerCurrentSp) customerCurrentSp.textContent = parseFloat(activeCustomer.sp_due).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                    loadHistory();
                });
                customerSearchDropdown.appendChild(div);
            });
            customerSearchDropdown.style.display = list.length ? "block" : "none";
        });
    }

    /* --- Load activity history with pagination --- */
    async function loadHistory(page = 1) {
        if (!activityHistoryDiv) return;
        if (!activeCustomer || !activeCustomer.uid) {
            console.error('No active customer or customer UID is missing');
            activityHistoryDiv.innerHTML = '<p>No customer selected</p>';
            return;
        }
        
        currentPage = page;
        
        // Show loading state
        activityHistoryDiv.innerHTML = '<p>Loading activity history...</p>';
        
        try {
            // Build URL with date filters if they exist
            let url = `/rest/v1/customer_activities?customer_uid=eq.${encodeURIComponent(activeCustomer.uid)}&order=created_at.desc`;
            
            // Add date range filters if specified
            if (dateFilter.from) {
                const startDate = new Date(dateFilter.from).toISOString();
                url += `&created_at=gte.${startDate}`;
            }
            if (dateFilter.to) {
                const endDate = new Date(dateFilter.to + 'T23:59:59.999').toISOString();
                url += `&created_at=lte.${endDate}`;
            }
            
            // First, get total count for pagination
            const countUrl = url.replace(/order=[^&]*&?/, '').replace(/&$/, '') + '&select=count';
            const countRes = await supabaseFetch(countUrl);
            
            if (countRes.ok) {
                const countData = await countRes.json();
                totalActivities = countData.length > 0 ? countData[0].count : 0;
            }
            
            // Calculate offset for pagination
            const offset = (page - 1) * activitiesPerPage;
            url += `&limit=${activitiesPerPage}&offset=${offset}`;
            
            console.log('Fetching from URL:', url);
            
            const res = await supabaseFetch(url);
            
            // Handle error response
            if (!res.ok) {
                let errorMessage = `Error ${res.status}: ${res.statusText}`;
                try {
                    const errorData = await res.json();
                    errorMessage += ` - ${JSON.stringify(errorData)}`;
                } catch (e) {
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
                
                // Store the balance after this transaction with 2 decimal precision
                activityCopy.updated_balance = runningBalance.toFixed(2);
                activityCopy.updated_sp_due = runningSpDue.toFixed(2);
                
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
                        <td class="text-right">${activity.sp_added ? parseFloat(activity.sp_added).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                        <td class="text-right">${activity.sp_reduced ? parseFloat(activity.sp_reduced).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                        <td class="text-right">₹${parseFloat(activity.updated_balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td class="text-right">${parseFloat(activity.updated_sp_due).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
            
            // Update pagination controls
            updatePaginationControls();
            
        } catch (error) {
            console.error('Error loading activity history:', error);
            activityHistoryDiv.innerHTML = '<p class="error">Error loading activity history. Please try again later.</p>';
        }
    }
    
    /* --- Update pagination controls --- */
    function updatePaginationControls() {
        if (!paginationInfo || !paginationButtons) return;
        
        const totalPages = Math.ceil(totalActivities / activitiesPerPage);
        const startItem = (currentPage - 1) * activitiesPerPage + 1;
        const endItem = Math.min(currentPage * activitiesPerPage, totalActivities);
        
        // Update pagination info
        if (totalActivities > 0) {
            paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalActivities} activities`;
            paginationButtons.style.display = 'flex'; // Show pagination buttons
        } else {
            paginationInfo.textContent = 'No activities found';
            paginationButtons.style.display = 'none'; // Hide pagination buttons when no activities
        }
        
        // Clear existing pagination buttons
        paginationButtons.innerHTML = '';
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Previous';
        prevBtn.disabled = currentPage === 1;
        prevBtn.style.cssText = 'padding: 5px 10px; margin-right: 5px; border: 1px solid #ccc; background: #f8f9fa; color: black; cursor: pointer;';
        if (currentPage > 1) {
            prevBtn.addEventListener('click', () => loadHistory(currentPage - 1));
        }
        paginationButtons.appendChild(prevBtn);
        
        // Page number buttons (show max 5 pages)
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.disabled = i === currentPage;
            pageBtn.style.cssText = i === currentPage 
                ? 'padding: 5px 10px; margin-right: 5px; border: 1px solid #007bff; background: #007bff; color: white; cursor: pointer;'
                : 'padding: 5px 10px; margin-right: 5px; border: 1px solid #ccc; background: #f8f9fa; color: black; cursor: pointer;';
            
            if (i !== currentPage) {
                pageBtn.addEventListener('click', () => loadHistory(i));
            }
            paginationButtons.appendChild(pageBtn);
        }
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
        nextBtn.style.cssText = 'padding: 5px 10px; border: 1px solid #ccc; background: #f8f9fa; color: black; cursor: pointer;';
        if (currentPage < totalPages && totalPages > 0) {
            nextBtn.addEventListener('click', () => loadHistory(currentPage + 1));
        }
        paginationButtons.appendChild(nextBtn);
    }
    
    /* --- Filter activities by date range --- */
    function applyDateFilter() {
        dateFilter.from = activityDateFromInput.value.trim() || null;
        dateFilter.to = activityDateToInput.value.trim() || null;
        currentPage = 1; // Reset to first page when applying filter
        loadHistory(1);
    }
    
    /* --- Clear date filter --- */
    function clearDateFilter() {
        activityDateFromInput.value = '';
        activityDateToInput.value = '';
        dateFilter = { from: null, to: null };
        currentPage = 1; // Reset to first page when clearing filter
        loadHistory(1);
    }

    // Get all note input elements
    const paymentNoteInput = document.getElementById("payment-note");
    const spUsedNoteInput = document.getElementById("sp-used-note");
    const spNotUsedNoteInput = document.getElementById("sp-notused-note");
    
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
            if (customerCurrentSp) customerCurrentSp.textContent = newSpDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
                        customerCurrentSp.textContent = newSpDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    
    /* --- Add event listeners for date filter buttons --- */
    if (filterActivitiesBtn) {
        filterActivitiesBtn.addEventListener("click", applyDateFilter);
    }
    
    if (clearActivityFilterBtn) {
        clearActivityFilterBtn.addEventListener("click", clearDateFilter);
    }
    
    if (printActivitiesBtn) {
        printActivitiesBtn.addEventListener("click", printCurrentPage);
    }
    
    /* --- Print current page activities --- */
    function printCurrentPage() {
        if (!activeCustomer) {
            alert("No customer selected");
            return;
        }
        
        const printWindow = window.open('', '_blank');
        const tableElement = document.querySelector('.activity-table');
        
        if (!tableElement) {
            alert("No activities to print");
            return;
        }
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Activity Report - ${activeCustomer.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { text-align: center; color: #2c3e50; margin-bottom: 10px; }
                        h2 { color: #2c3e50; margin-bottom: 15px; }
                        .customer-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .text-right { text-align: right; }
                        .footer-info { margin-top: 20px; font-size: 12px; color: #666; }
                        @media print { body { margin: 10px; } }
                    </style>
                </head>
                <body>
                    <h1>Jagannath Wellness - Customer Activity Report</h1>
                    
                    <div class="customer-info">
                        <h2>Customer Information</h2>
                        <div class="info-row">
                            <strong>Name:</strong> <span>${activeCustomer.name}</span>
                        </div>
                        <div class="info-row">
                            <strong>Phone:</strong> <span>${activeCustomer.phone || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <strong>Current Balance:</strong> <span>₹${parseFloat(activeCustomer.balance_due).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div class="info-row">
                            <strong>SP Due:</strong> <span>${parseFloat(activeCustomer.sp_due).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                    
                    <h2>Activity History - Page ${currentPage}</h2>
                    ${tableElement.outerHTML}
                    
                    <div class="footer-info">
                        <p><strong>Generated on:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-IN')}</p>
                        <p><strong>Page:</strong> ${currentPage} (Showing ${Math.min((currentPage - 1) * activitiesPerPage + 1, totalActivities)}-${Math.min(currentPage * activitiesPerPage, totalActivities)} of ${totalActivities} activities)</p>
                    </div>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }
    
    /* --- Add enter key support for date inputs --- */
    if (activityDateFromInput) {
        activityDateFromInput.addEventListener("keypress", (e) => {
            if (e.key === 'Enter') {
                applyDateFilter();
            }
        });
    }
    
    if (activityDateToInput) {
        activityDateToInput.addEventListener("keypress", (e) => {
            if (e.key === 'Enter') {
                applyDateFilter();
            }
        });
    }
});
