/**
 * @fileoverview Expense Tracker functionality for Jagannath Wellness Billing System
 * @description This module provides complete expense tracking functionality including
 * adding, viewing, filtering, and deleting expenses. It integrates with Supabase
 * database for persistent storage and provides real-time summaries.
 * @version 1.0.0
 * @author Jagannath Wellness Team
 * @since 2025-01-01
 */

// =============================================================================
// EXPENSE TRACKER INITIALIZATION
// =============================================================================

/**
 * Expense tracker initialization
 * Sets up DOM elements, event listeners, and database integration
 * @listens DOMContentLoaded
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", () => {
    
    // =============================================================================
    // DOM ELEMENT REFERENCES
    // =============================================================================
    
    // Form Elements
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const expenseDescription = document.getElementById('expense-description');
    const expenseAmount = document.getElementById('expense-amount');
    const expenseCategory = document.getElementById('expense-category');
    const expenseDate = document.getElementById('expense-date');
    
    // Display Elements
    const expenseList = document.getElementById('expense-list');
    const totalExpensesSpan = document.getElementById('total-expenses');
    const monthExpensesSpan = document.getElementById('month-expenses');
    const todayExpensesSpan = document.getElementById('today-expenses');
    
    // Filter Elements
    const filterStartDate = document.getElementById('filter-start-date');
    const filterEndDate = document.getElementById('filter-end-date');
    const filterCategory = document.getElementById('filter-category');
    const filterExpensesBtn = document.getElementById('filter-expenses-btn');
    const clearFilterBtn = document.getElementById('clear-filter-btn');

    // =============================================================================
    // GLOBAL VARIABLES
    // =============================================================================
    
    let expenses = [];
    let filteredExpenses = [];

    // =============================================================================
    // SUPABASE CONFIGURATION
    // =============================================================================
    
    /**
     * Supabase database configuration
     * Uses same credentials as main application for consistency
     * @constant {string} SUPABASE_URL - Base URL for Supabase REST API
     * @constant {string} SUPABASE_ANON_KEY - Anonymous API key for authentication
     * @constant {Object} SUPABASE_HEADERS - Default headers for API requests
     */
    const SUPABASE_URL = "https://gfyuuslvnlkbqztbduys.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8";
    const SUPABASE_HEADERS = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
    };

    // =============================================================================
    // INITIALIZATION
    // =============================================================================
    
    /**
     * Set today's date as default for expense date input
     * Provides better user experience by defaulting to current date
     */
    const today = new Date().toISOString().split('T')[0];
    if (expenseDate) {
        expenseDate.value = today;
    }

    // =============================================================================
    // DATABASE OPERATIONS
    // =============================================================================
    
    /**
     * Load expenses from Supabase database
     * Fetches expenses from database with optional filtering parameters
     * @async
     * @param {string|null} startDate - Filter start date (YYYY-MM-DD format)
     * @param {string|null} endDate - Filter end date (YYYY-MM-DD format)
     * @param {string|null} category - Filter by expense category
     * @returns {Promise<void>}
     */
    async function loadExpenses(startDate = null, endDate = null, category = null) {
        try {
            let url = `${SUPABASE_URL}/rest/v1/expenses?select=*&order=expense_date.desc,created_at.desc`;
            
            // Add filters if provided
            const filters = [];
            if (startDate) filters.push(`expense_date=gte.${startDate}`);
            if (endDate) filters.push(`expense_date=lte.${endDate}`);
            if (category) filters.push(`category=eq.${category}`);
            
            if (filters.length > 0) {
                url += '&' + filters.join('&');
            }

            console.log('Loading expenses from:', url);
            const response = await fetch(url, { headers: SUPABASE_HEADERS });
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to load expenses: ${response.status} - ${errorText}`);
            }
            
            expenses = await response.json();
            console.log('Loaded expenses:', expenses);
            filteredExpenses = [...expenses];
            displayExpenses();
            updateSummary();
        } catch (error) {
            console.error('Error loading expenses:', error);
            if (expenseList) {
                expenseList.innerHTML = `<p style="color: red; text-align: center;">Error loading expenses: ${error.message}</p>`;
            }
        }
    }

    /**
     * Add new expense to database
     * Creates new expense record in Supabase database with validation
     * @async
     * @param {Object} expenseData - Expense data object
     * @param {string} expenseData.p_description - Expense description
     * @param {number} expenseData.p_amount - Expense amount
     * @param {string} expenseData.p_category - Expense category
     * @param {string} expenseData.p_expense_date - Expense date (YYYY-MM-DD)
     * @param {string|null} [expenseData.p_notes] - Optional notes about expense
     * @returns {Promise<Object>} Created expense record
     * @throws {Error} If validation fails or database error occurs
     */
    async function addExpenseToDatabase(expenseData) {
        try {
            const payload = {
                description: expenseData.p_description,
                amount: expenseData.p_amount,
                category: expenseData.p_category,
                expense_date: expenseData.p_expense_date,
                notes: expenseData.p_notes || null
            };

            console.log('Adding expense with payload:', payload);
            const response = await fetch(`${SUPABASE_URL}/rest/v1/expenses`, {
                method: 'POST',
                headers: SUPABASE_HEADERS,
                body: JSON.stringify(payload)
            });

            console.log('Add expense response status:', response.status);
            console.log('Add expense response headers:', response.headers);

            if (!response.ok) {
                // Try to get error text, fall back to status if not JSON
                let errorMessage = `Failed to add expense: ${response.status}`;
                try {
                    const errorText = await response.text();
                    console.error('Error response text:', errorText);
                    errorMessage += ` - ${errorText}`;
                } catch (textError) {
                    console.error('Could not read error response:', textError);
                }
                throw new Error(errorMessage);
            }

            // Check if response has content before trying to parse JSON
            const contentType = response.headers.get('content-type');
            console.log('Response content-type:', contentType);
            
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                console.log('Expense added successfully:', result);
                return result;
            } else {
                // If no JSON response, that's still OK for POST operations
                const responseText = await response.text();
                console.log('Expense added (non-JSON response):', responseText);
                return { success: true, message: 'Expense added successfully' };
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            throw error;
        }
    }

    // =============================================================================
    // EXPENSE DELETION OPERATIONS
    // =============================================================================

    /**
     * Delete expense from database
     * Removes expense record from Supabase database with proper error handling
     * @async
     * @param {string} expenseUid - Expense unique identifier to delete
     * @returns {Promise<boolean>} True if deletion successful
     * @throws {Error} If validation fails or database error occurs
     */
    async function deleteExpenseFromDatabase(expenseUid) {
        try {
            console.log('Deleting expense:', expenseUid);
            
            const response = await fetch(`${SUPABASE_URL}/rest/v1/expenses?uid=eq.${expenseUid}`, {
                method: 'DELETE',
                headers: SUPABASE_HEADERS
            });

            console.log('Delete expense response status:', response.status);

            if (!response.ok) {
                let errorMessage = `Failed to delete expense: ${response.status}`;
                try {
                    const errorText = await response.text();
                    console.error('Delete error response:', errorText);
                    errorMessage += ` - ${errorText}`;
                } catch (textError) {
                    console.error('Could not read delete error response:', textError);
                }
                throw new Error(errorMessage);
            }

            console.log('Expense deleted successfully:', expenseUid);
            return true;
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    }

    // =============================================================================
    // EXPENSE SUMMARY CALCULATIONS
    // =============================================================================

    /**
     * Get expense summary from database
     * Calculates expense statistics with optional filtering parameters
     * @async
     * @param {string|null} startDate - Filter start date (YYYY-MM-DD format)
     * @param {string|null} endDate - Filter end date (YYYY-MM-DD format)
     * @param {string|null} category - Filter by expense category
     * @returns {Promise<Object>} Summary object with totals and counts
     * @throws {Error} If database error occurs
     */
    async function getExpenseSummary(startDate = null, endDate = null, category = null) {
        try {
            // Build query with filters for summary calculation
            let url = `${SUPABASE_URL}/rest/v1/expenses?select=amount,expense_date`;
            
            const filters = [];
            if (startDate) filters.push(`expense_date=gte.${startDate}`);
            if (endDate) filters.push(`expense_date=lte.${endDate}`);
            if (category) filters.push(`category=eq.${category}`);
            
            if (filters.length > 0) {
                url += '&' + filters.join('&');
            }

            const response = await fetch(url, { headers: SUPABASE_HEADERS });
            
            if (!response.ok) {
                throw new Error(`Failed to get expenses for summary: ${response.status}`);
            }

            const expenses = await response.json();
            
            // Calculate summary statistics locally
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const todayStr = now.toISOString().split('T')[0];

            let total = 0;
            let monthTotal = 0;
            let todayTotal = 0;

            expenses.forEach(expense => {
                const amount = parseFloat(expense.amount);
                total += amount;
                
                const expenseDate = new Date(expense.expense_date);
                if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
                    monthTotal += amount;
                }
                
                if (expense.expense_date === todayStr) {
                    todayTotal += amount;
                }
            });

            const result = {
                total_expenses: total,
                month_expenses: monthTotal,
                today_expenses: todayTotal,
                expense_count: expenses.length,
                category_breakdown: {}
            };

            console.log('Summary calculated:', result);
            return result;
        } catch (error) {
            console.error('Error getting summary:', error);
            return {
                total_expenses: 0,
                month_expenses: 0,
                today_expenses: 0,
                expense_count: 0,
                category_breakdown: {}
            };
        }
    }

    // Add new expense
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', async () => {
            const description = expenseDescription.value.trim();
            const amount = parseFloat(expenseAmount.value);
            const category = expenseCategory.value;
            const date = expenseDate.value;

            if (!description || isNaN(amount) || amount <= 0 || !category || !date) {
                alert('Please fill in all fields with valid values.');
                return;
            }

            try {
                addExpenseBtn.disabled = true;
                addExpenseBtn.textContent = 'Adding...';

                await addExpenseToDatabase({
                    p_description: description,
                    p_amount: amount,
                    p_category: category,
                    p_expense_date: date
                });

                // Clear form
                expenseDescription.value = '';
                expenseAmount.value = '';
                expenseCategory.value = '';
                expenseDate.value = today;

                // Refresh display
                await loadExpenses();
                
                alert('Expense added successfully!');
            } catch (error) {
                alert(`Error adding expense: ${error.message}`);
            } finally {
                addExpenseBtn.disabled = false;
                addExpenseBtn.textContent = 'Add Expense';
            }
        });
    }

    // Display expenses
    function displayExpenses() {
        if (!expenseList) return;
        
        expenseList.innerHTML = '';

        if (filteredExpenses.length === 0) {
            expenseList.innerHTML = '<p style="color: #666; text-align: center;">No expenses found.</p>';
            return;
        }

        filteredExpenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                margin-bottom: 8px;
                background: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 6px;
                transition: background-color 0.2s;
            `;

            expenseItem.innerHTML = `
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: #2c3e50;">${expense.description}</div>
                    <div style="font-size: 12px; color: #666;">
                        ${new Date(expense.expense_date).toLocaleDateString()} • ${getCategoryLabel(expense.category)}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="font-weight: bold; color: #e74c3c; font-size: 16px;">₹${parseFloat(expense.amount).toFixed(2)}</div>
                    <button onclick="deleteExpense('${expense.uid}')" style="
                        background: #e74c3c;
                        color: white;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Delete</button>
                </div>
            `;

            expenseItem.addEventListener('mouseenter', () => {
                expenseItem.style.backgroundColor = '#f0f0f0';
            });

            expenseItem.addEventListener('mouseleave', () => {
                expenseItem.style.backgroundColor = '#f9f9f9';
            });

            expenseList.appendChild(expenseItem);
        });
    }

    // Get category label
    function getCategoryLabel(category) {
        const labels = {
            utilities: 'Utilities',
            rent: 'Rent',
            supplies: 'Supplies',
            marketing: 'Marketing',
            maintenance: 'Maintenance',
            salary: 'Salary',
            other: 'Other'
        };
        return labels[category] || category;
    }

    // Delete expense
    window.deleteExpense = async function(expenseUid) {
        if (confirm('Are you sure you want to delete this expense?')) {
            try {
                await deleteExpenseFromDatabase(expenseUid);
                await loadExpenses();
                alert('Expense deleted successfully!');
            } catch (error) {
                alert(`Error deleting expense: ${error.message}`);
            }
        }
    };

    // Update summary
    async function updateSummary() {
        if (!totalExpensesSpan || !monthExpensesSpan || !todayExpensesSpan) return;
        
        try {
            const summary = await getExpenseSummary();
            totalExpensesSpan.textContent = parseFloat(summary.total_expenses).toFixed(2);
            monthExpensesSpan.textContent = parseFloat(summary.month_expenses).toFixed(2);
            todayExpensesSpan.textContent = parseFloat(summary.today_expenses).toFixed(2);
        } catch (error) {
            console.error('Error updating summary:', error);
            totalExpensesSpan.textContent = '0.00';
            monthExpensesSpan.textContent = '0.00';
            todayExpensesSpan.textContent = '0.00';
        }
    }

    // Filter expenses
    if (filterExpensesBtn) {
        filterExpensesBtn.addEventListener('click', async () => {
            const startDate = filterStartDate.value;
            const endDate = filterEndDate.value;
            const category = filterCategory.value;

            await loadExpenses(startDate, endDate, category);
        });
    }

    // Clear filter
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
            filterStartDate.value = '';
            filterEndDate.value = '';
            filterCategory.value = '';
            loadExpenses(); // Load all expenses
        });
    }

    // Auto-load expenses when page loads
    loadExpenses();
});
