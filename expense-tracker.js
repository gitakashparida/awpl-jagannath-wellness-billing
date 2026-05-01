// Expense Tracker JavaScript
document.addEventListener("DOMContentLoaded", () => {
    // Get DOM elements
    const expenseNameInput = document.getElementById("expense-name");
    const expenseAmountInput = document.getElementById("expense-amount");
    const expenseCategoryInput = document.getElementById("expense-category");
    const expenseDateInput = document.getElementById("expense-date");
    const expenseDescriptionInput = document.getElementById("expense-description");
    const addExpenseBtn = document.getElementById("add-expense-btn");
    const deleteExpenseInput = document.getElementById("delete-expense-input");
    const deleteExpenseDropdown = document.getElementById("delete-expense-dropdown");
    const getExpensesBtn = document.getElementById("get-expenses");
    const clearFilterBtn = document.getElementById("clear-filter");
    const printExpensesBtn = document.getElementById("print-expenses");
    const expenseDateFromInput = document.getElementById("expense-date-from");
    const expenseDateToInput = document.getElementById("expense-date-to");
    const expensesTable = document.getElementById("expenses-table");
    const expensesTbody = document.getElementById("expenses-tbody");
    const expensesTfoot = document.getElementById("expenses-tfoot");
    const totalAmountElement = document.getElementById("total-amount");
    const noExpensesMessage = document.getElementById("no-expenses-message");
    const expenseSummaryElement = document.getElementById("expense-summary");
    const expenseSummaryContent = document.getElementById("expense-summary-content");

    let expenses = [];

    // Set today's date as default for expense date
    const today = new Date().toISOString().split('T')[0];
    expenseDateInput.value = today;

    // Add expense functionality
    addExpenseBtn.addEventListener("click", () => {
        const name = expenseNameInput.value.trim();
        const amount = parseFloat(expenseAmountInput.value);
        const category = expenseCategoryInput.value.trim();
        const date = expenseDateInput.value;
        const description = expenseDescriptionInput.value.trim();

        if (!name || isNaN(amount) || amount <= 0) {
            alert("Please fill in expense name and valid amount.");
            return;
        }

        const expenseData = {
            expense_name: name,
            amount: amount,
            category: category || null,
            expense_date: date ? new Date(date).toISOString() : new Date().toISOString(),
            description: description || null
        };

        fetch("https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/expenses", {
            method: "POST",
            headers: {
                apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
                "Content-Type": "application/json",
                Prefer: "return=representation"
            },
            body: JSON.stringify(expenseData)
        })
        .then(response => {
            if (response.status === 201) {
                alert("Expense added successfully!");
                // Clear form
                expenseNameInput.value = "";
                expenseAmountInput.value = "";
                expenseCategoryInput.value = "";
                expenseDescriptionInput.value = "";
                expenseDateInput.value = today;
                // Refresh expense history
                loadExpenses();
            } else {
                throw new Error("Failed to add expense.");
            }
        })
        .catch(error => {
            console.error("Error adding expense:", error);
            alert("Failed to add expense. Please try again.");
        });
    });

    // Delete expense search functionality
    deleteExpenseInput.addEventListener("input", () => {
        const query = deleteExpenseInput.value.toLowerCase();
        deleteExpenseDropdown.innerHTML = "";

        if (query && expenses.length > 0) {
            const filtered = expenses.filter(expense =>
                expense.expense_name.toLowerCase().includes(query)
            );

            filtered.forEach(expense => {
                const item = document.createElement("div");
                item.textContent = `${expense.expense_name} - ₹${expense.amount} (${new Date(expense.expense_date).toLocaleDateString()})`;
                item.classList.add("dropdown-item");
                item.addEventListener("click", () => {
                    deleteExpenseInput.value = expense.expense_name;
                    deleteExpenseDropdown.style.display = "none";

                    if (confirm(`Are you sure you want to delete '${expense.expense_name}' (₹${expense.amount})?`)) {
                        fetch(`https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/expenses?uid=eq.${expense.uid}`, {
                            method: "DELETE",
                            headers: {
                                apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
                                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
                                "Content-Type": "application/json",
                            },
                        })
                        .then(response => {
                            if (response.ok) {
                                alert("Expense deleted successfully.");
                                expenses = expenses.filter(e => e.uid !== expense.uid);
                                loadExpenses(); // Refresh the display
                            } else {
                                alert("Failed to delete expense.");
                            }
                        })
                        .catch(error => {
                            console.error("Error deleting expense:", error);
                            alert("An error occurred while deleting the expense.");
                        });
                    }
                });
                deleteExpenseDropdown.appendChild(item);
            });

            deleteExpenseDropdown.style.display = "block";
        } else {
            deleteExpenseDropdown.style.display = "none";
        }
    });

    // Load expenses functionality
    getExpensesBtn.addEventListener("click", loadExpenses);
    clearFilterBtn.addEventListener("click", clearFilter);
    printExpensesBtn.addEventListener("click", printExpenses);

    function loadExpenses() {
        const fromDate = expenseDateFromInput.value.trim();
        const toDate = expenseDateToInput.value.trim();
        let url = "https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/expenses?select=*&order=expense_date.desc&limit=100";

        if (fromDate && toDate) {
            const startDate = `${fromDate}T00:00:00.000Z`;
            const endDate = `${toDate}T23:59:59.999Z`;
            url = `https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/expenses?expense_date=gte.${startDate}&expense_date=lte.${endDate}&select=*&order=expense_date.desc&limit=100`;
        } else if (fromDate) {
            const startDate = `${fromDate}T00:00:00.000Z`;
            url = `https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/expenses?expense_date=gte.${startDate}&select=*&order=expense_date.desc&limit=100`;
        } else if (toDate) {
            const endDate = `${toDate}T23:59:59.999Z`;
            url = `https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/expenses?expense_date=lte.${endDate}&select=*&order=expense_date.desc&limit=100`;
        }

        fetch(url, {
            headers: {
                apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
                "Content-Type": "application/json",
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            expenses = data;
            displayExpenses(data);
        })
        .catch(error => {
            console.error("Error fetching expenses:", error);
            alert("Failed to load expenses. Please try again later.");
        });
    }

    function clearFilter() {
        expenseDateFromInput.value = "";
        expenseDateToInput.value = "";
        loadExpenses();
    }

    function printExpenses() {
        const printContent = document.getElementById('expenses-table').outerHTML;
        const summaryContent = document.getElementById('expense-summary').outerHTML;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Expense Report - Jagannath Wellness</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { text-align: center; color: #2c3e50; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .total-row { font-weight: bold; background-color: #f9f9f9; }
                        .summary { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                        @media print { body { margin: 10px; } }
                    </style>
                </head>
                <body>
                    <h1>Jagannath Wellness - Expense Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                    ${summaryContent}
                    ${printContent}
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }

    function displayExpenses(expensesList) {
        expensesTbody.innerHTML = "";
        
        if (expensesList.length === 0) {
            expensesTable.style.display = "none";
            noExpensesMessage.style.display = "block";
            expenseSummaryElement.style.display = "none";
            return;
        }

        expensesTable.style.display = "table";
        noExpensesMessage.style.display = "none";
        expensesTfoot.style.display = "table-footer-group";

        let totalAmount = 0;
        const categoryTotals = {};

        expensesList.forEach((expense, index) => {
            totalAmount += parseFloat(expense.amount);
            
            if (expense.category) {
                categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + parseFloat(expense.amount);
            }

            const row = document.createElement("tr");
            row.style.cssText = "border-bottom: 1px solid #dee2e6;";
            
            // ID cell
            const idCell = document.createElement("td");
            idCell.textContent = expense.uid;
            idCell.style.cssText = "padding: 12px; border: 1px solid #dee2e6;";
            
            // Date cell
            const dateCell = document.createElement("td");
            dateCell.textContent = new Date(expense.expense_date).toLocaleDateString();
            dateCell.style.cssText = "padding: 12px; border: 1px solid #dee2e6;";
            
            // Name cell
            const nameCell = document.createElement("td");
            nameCell.textContent = expense.expense_name;
            nameCell.style.cssText = "padding: 12px; border: 1px solid #dee2e6; font-weight: 500;";
            
            // Category cell
            const categoryCell = document.createElement("td");
            categoryCell.textContent = expense.category || "-";
            categoryCell.style.cssText = "padding: 12px; border: 1px solid #dee2e6;";
            
            // Amount cell
            const amountCell = document.createElement("td");
            amountCell.textContent = `₹${parseFloat(expense.amount).toFixed(2)}`;
            amountCell.style.cssText = "padding: 12px; border: 1px solid #dee2e6; text-align: right; font-weight: bold; color: #e74c3c;";
            
            // Description cell
            const descriptionCell = document.createElement("td");
            descriptionCell.textContent = expense.description || "-";
            descriptionCell.style.cssText = "padding: 12px; border: 1px solid #dee2e6; max-width: 200px; word-wrap: break-word;";
            
            // Actions cell
            const actionsCell = document.createElement("td");
            actionsCell.style.cssText = "padding: 12px; border: 1px solid #dee2e6; text-align: center;";
            
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = `🗑️ Delete`;
            deleteBtn.title = "Delete Expense";
            deleteBtn.style.cssText = "background-color: #c0392b; color: black; border: 2px solid #a93226; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;";

            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete expense #${expense.uid}?`)) {
                    fetch(`https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/expenses?uid=eq.${expense.uid}`, {
                        method: "DELETE",
                        headers: {
                            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
                            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
                            "Content-Type": "application/json",
                        },
                    })
                    .then(response => {
                        if (response.ok) {
                            row.style.animation = 'fadeOut 0.3s ease';
                            setTimeout(() => {
                                row.remove();
                                const currentTotal = parseFloat(totalAmountElement.textContent.replace('₹', '').replace(',', ''));
                                const newTotal = currentTotal - parseFloat(expense.amount);
                                totalAmountElement.textContent = `₹${newTotal.toFixed(2)}`;
                                
                                // Update summary
                                if (expense.category) {
                                    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) - parseFloat(expense.amount);
                                    if (categoryTotals[expense.category] <= 0) {
                                        delete categoryTotals[expense.category];
                                    }
                                }
                                updateExpenseSummary(newTotal, categoryTotals);
                            }, 300);
                        } else {
                            throw new Error("Failed to delete expense");
                        }
                    })
                    .catch(error => {
                        console.error("Error deleting expense:", error);
                        alert("Failed to delete expense. Please try again.");
                    });
                }
            });

            actionsCell.appendChild(deleteBtn);
            
            row.appendChild(idCell);
            row.appendChild(dateCell);
            row.appendChild(nameCell);
            row.appendChild(categoryCell);
            row.appendChild(amountCell);
            row.appendChild(descriptionCell);
            row.appendChild(actionsCell);
            
            expensesTbody.appendChild(row);
        });

        totalAmountElement.textContent = `₹${totalAmount.toFixed(2)}`;
        updateExpenseSummary(totalAmount, categoryTotals);
    }

    function updateExpenseSummary(totalAmount, categoryTotals, isDelete = false, deletedCategory = null, deletedAmount = 0) {
        if (isDelete && deletedCategory) {
            categoryTotals[deletedCategory] = (categoryTotals[deletedCategory] || 0) - deletedAmount;
            if (categoryTotals[deletedCategory] <= 0) {
                delete categoryTotals[deletedCategory];
            }
        }

        expenseSummaryContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>Total Expenses:</strong> ₹${totalAmount.toFixed(2)}
                </div>
                <div>
                    <strong>Number of Expenses:</strong> ${expenses.length}
                </div>
            </div>
        `;

        if (Object.keys(categoryTotals).length > 0) {
            expenseSummaryContent.innerHTML += `
                <div style="margin-top: 15px;">
                    <strong>Expenses by Category:</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        ${Object.entries(categoryTotals).map(([category, amount]) => 
                            `<li>${category}: ₹${amount.toFixed(2)}</li>`
                        ).join('')}
                    </ul>
                </div>
            `;
        }

        expenseSummaryElement.style.display = "block";
    }

    // Hide dropdowns when clicking outside
    document.addEventListener("click", (event) => {
        if (!deleteExpenseDropdown.contains(event.target) && event.target !== deleteExpenseInput) {
            deleteExpenseDropdown.style.display = "none";
        }
    });

    // Load expenses on page load
    loadExpenses();
});
