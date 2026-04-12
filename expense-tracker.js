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
    const expenseDateSearchInput = document.getElementById("expense-date-search");
    const expenseHistoryElement = document.getElementById("expense-history");
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

    function loadExpenses() {
        const selectedDate = expenseDateSearchInput.value.trim();
        let url = "https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/expenses?select=*&order=expense_date.desc&limit=100";

        if (selectedDate) {
            const startDate = `${selectedDate}T00:00:00.000Z`;
            const endDate = `${selectedDate}T23:59:59.999Z`;
            url = `https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/expenses?expense_date=gte.${startDate}&expense_date=lte.${endDate}&select=*&order=expense_date.desc&limit=100`;
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

    function displayExpenses(expensesList) {
        expenseHistoryElement.innerHTML = "";
        
        if (expensesList.length === 0) {
            expenseHistoryElement.textContent = "No expenses found.";
            expenseSummaryElement.style.display = "none";
            return;
        }

        let totalAmount = 0;
        const categoryTotals = {};

        expensesList.forEach((expense, index) => {
            totalAmount += parseFloat(expense.amount);
            
            if (expense.category) {
                categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + parseFloat(expense.amount);
            }

            const wrapper = document.createElement("div");
            wrapper.className = "expense-item";
            wrapper.style.cssText = "border: 1px solid #ccc; margin-bottom: 10px; border-radius: 5px; background: #f9f9f9; padding: 15px;";

            const header = document.createElement("h4");
            header.textContent = `#${expense.uid} - ${expense.expense_name}`;

            const amount = document.createElement("div");
            amount.className = "expense-amount";
            amount.textContent = `₹${parseFloat(expense.amount).toFixed(2)}`;
            amount.style.cssText = "font-weight: bold; color: #e74c3c; font-size: 18px; margin: 5px 0;";

            const meta = document.createElement("div");
            meta.className = "expense-meta";
            meta.style.cssText = "color: #666; font-size: 14px; margin: 5px 0;";
            
            const dateIcon = document.createElement("span");
            dateIcon.textContent = "🕒";
            dateIcon.style.fontSize = "0.9em";
            
            const dateText = document.createElement("span");
            dateText.textContent = new Date(expense.expense_date).toLocaleDateString();
            
            meta.appendChild(dateIcon);
            meta.appendChild(dateText);

            if (expense.category) {
                const category = document.createElement("div");
                category.className = "expense-category";
                category.textContent = `Category: ${expense.category}`;
                category.style.cssText = "display: inline-block; background: #3498db; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; margin-left: 10px;";
                meta.appendChild(category);
            }

            const description = document.createElement("div");
            description.className = "expense-description";
            if (expense.description) {
                description.textContent = `Description: ${expense.description}`;
                description.style.cssText = "color: #555; font-style: italic; margin: 5px 0;";
            }

            const actions = document.createElement("div");
            actions.className = "expense-actions";
            actions.style.cssText = "margin-top: 10px;";

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn-delete";
            deleteBtn.innerHTML = `🗑️ Delete`;
            deleteBtn.title = "Delete Expense";
            deleteBtn.style.cssText = "background-color: #c0392b; color: black; border: 2px solid #a93226; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);";

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
                            wrapper.style.animation = 'fadeOut 0.3s ease';
                            setTimeout(() => {
                                wrapper.remove();
                                // Update totals
                                const currentTotal = parseFloat(totalAmount);
                                totalAmount = currentTotal - parseFloat(expense.amount);
                                updateExpenseSummary(totalAmount, categoryTotals, true, expense.category, expense.amount);
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

            actions.appendChild(deleteBtn);
            
            wrapper.appendChild(header);
            wrapper.appendChild(amount);
            wrapper.appendChild(meta);
            if (expense.description) {
                wrapper.appendChild(description);
            }
            wrapper.appendChild(actions);
            
            expenseHistoryElement.appendChild(wrapper);
            
            // Add animation
            wrapper.style.opacity = '0';
            wrapper.style.transform = 'translateY(10px)';
            setTimeout(() => {
                wrapper.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                wrapper.style.opacity = '1';
                wrapper.style.transform = 'translateY(0)';
            }, 10);
        });

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
