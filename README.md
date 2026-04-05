# Jagannath Wellness Billing System

A comprehensive web-based billing and management system for Jagannath Wellness, featuring order management, customer tracking, expense tracking, and administrative functions.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [User Guide](#user-guide)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Jagannath Wellness Billing System is a modern, responsive web application built with vanilla JavaScript, HTML, and CSS, integrated with Supabase for backend services. It provides a complete solution for managing billing operations, customer relationships, and expense tracking.

### Key Objectives

- **Simplified Billing**: Streamlined order creation and management
- **Customer Management**: Comprehensive customer data tracking and activity monitoring
- **Expense Tracking**: Detailed expense management with categorization and reporting
- **Real-time Updates**: Live data synchronization across all modules
- **User-friendly Interface**: Intuitive design optimized for daily use

## ✨ Features

### 🛒 Billing Dashboard
- **Product Search**: Real-time product search with autocomplete
- **Order Management**: Create, edit, and delete orders
- **Order History**: Advanced filtering and search capabilities
- **SP (Service Points) Tracking**: Built-in loyalty program management
- **Dynamic Pricing**: Support for MRP, selling price, and service points

### 👥 Customer Management
- **Customer Registration**: Quick customer onboarding
- **Activity Tracking**: Monitor customer purchases and payments
- **Balance Management**: Track outstanding balances and payments
- **Search Functionality**: Fast customer lookup with dropdown suggestions
- **Activity History**: Complete transaction history per customer

### 💰 Expense Tracker
- **Expense Categorization**: Pre-defined categories (utilities, rent, supplies, etc.)
- **Date-based Filtering**: Filter expenses by date ranges
- **Summary Statistics**: Real-time expense summaries (total, monthly, daily)
- **Database Integration**: Persistent storage with Supabase
- **Expense CRUD Operations**: Complete expense lifecycle management

### 🔐 Authentication System
- **Secure Login**: Admin-only access with session management
- **Session Persistence**: Automatic session restoration
- **Logout Functionality**: Secure session termination

## 🏗️ Architecture

### Frontend Architecture
```
├── index.html              # Main application shell
├── app.js                  # Core application logic
├── customer-management.js  # Customer management module
├── expense-tracker.js      # Expense tracking module
└── style.css              # Global styling
```

### Backend Architecture
```
Supabase Database
├── Authentication         # User management
├── Products Table         # Product catalog
├── Orders Table           # Order records
├── Customers Table        # Customer data
├── Expenses Table         # Expense records
└── Database Functions     # Server-side logic
```

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL + REST API)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with custom functions
- **Styling**: CSS3 with Flexbox/Grid
- **API**: RESTful API with Supabase

## 🚀 Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for Supabase connectivity
- Supabase project credentials

### Setup Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/jagannath-wellness-billing.git
   cd jagannath-wellness-billing
   ```

2. **Configure Supabase**
   - Create a new Supabase project
   - Run the `database_functions.sql` script in the Supabase SQL editor
   - Update Supabase credentials in `app.js`, `customer-management.js`, and `expense-tracker.js`

3. **Database Setup**
   ```sql
   -- Execute the provided database_functions.sql
   -- This will create all necessary tables and functions
   ```

4. **Launch the Application**
   ```bash
   # Option 1: Local server
   python -m http.server 8000
   
   # Option 2: Live Server (VS Code)
   # Use Live Server extension
   
   # Option 3: Any web server
   # Point to the project directory
   ```

5. **Access the Application**
   - Open `http://localhost:8000` in your browser
   - Login with admin credentials (default: JWAdmin)

## ⚙️ Configuration

### Supabase Configuration

Update the following constants in all JavaScript files:

```javascript
const SUPABASE_URL = "your-supabase-url";
const SUPABASE_ANON_KEY = "your-anon-key";
```

### Database Functions

Execute `database_functions.sql` in your Supabase SQL editor to set up:

- **Tables**: products, orders, customers, expenses
- **Functions**: Order number generation, expense summaries
- **Triggers**: Automatic timestamp updates
- **Indexes**: Performance optimization

### Environment Variables

For production deployment, consider using environment variables:

```javascript
const SUPABASE_URL = process.env.SUPABASE_URL || "fallback-url";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "fallback-key";
```

## 🗄️ Database Schema

### Products Table
```sql
CREATE TABLE products (
    uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    mrp DECIMAL(10,2) NOT NULL,
    sp DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Orders Table
```sql
CREATE TABLE orders (
    uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE,
    customer_name TEXT NOT NULL,
    product_names TEXT NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    total_sp DECIMAL(12,2) NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Customers Table
```sql
CREATE TABLE customers (
    uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    balance DECIMAL(12,2) DEFAULT 0,
    sp_balance DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
    uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT NOT NULL,
    expense_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📚 API Documentation

### Authentication Endpoints

#### Login
```javascript
// Client-side authentication
localStorage.setItem('jwb_auth_session', JSON.stringify({
    username: 'JWAdmin',
    expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
}));
```

### Product Management

#### Get All Products
```javascript
GET /rest/v1/products?select=*&order=name.asc
```

#### Add Product
```javascript
POST /rest/v1/products
{
    "name": "Product Name",
    "price": 100.00,
    "mrp": 120.00,
    "sp": 10.00
}
```

### Order Management

#### Get Orders
```javascript
GET /rest/v1/orders?select=*&order=order_date.desc&limit=100
```

#### Create Order
```javascript
POST /rest/v1/orders
{
    "customer_name": "John Doe",
    "product_names": "Product A x Qty: 2 x Price: 100 x SP: 10",
    "total_cost": 200.00,
    "total_sp": 20.00,
    "order_date": "2025-01-01T00:00:00Z"
}
```

### Customer Management

#### Get Customers
```javascript
GET /rest/v1/customers?select=*&order=name.asc
```

#### Create Customer
```javascript
POST /rest/v1/customers
{
    "name": "John Doe",
    "phone": "1234567890",
    "balance": 0,
    "sp_balance": 0
}
```

### Expense Management

#### Get Expenses
```javascript
GET /rest/v1/expenses?select=*&order=expense_date.desc
```

#### Create Expense
```javascript
POST /rest/v1/expenses
{
    "description": "Office Supplies",
    "amount": 1500.00,
    "category": "supplies",
    "expense_date": "2025-01-01"
}
```

## 📖 User Guide

### Getting Started

1. **Login**: Access the system using admin credentials
2. **Navigation**: Use radio buttons to switch between modules
3. **Dashboard**: View recent activities and quick actions

### Billing Operations

#### Creating an Order
1. Search for products using the search bar
2. Enter quantity and click "Add Product"
3. Repeat for all products
4. Enter customer name
5. Click "Place Order" to complete

#### Managing Orders
- **View History**: Click "Get Orders" to see recent orders
- **Edit Orders**: Use order number to load and modify
- **Delete Orders**: Remove orders with confirmation

### Customer Management

#### Adding Customers
1. Navigate to Customer Management
2. Fill in customer details
3. Click "Add Customer"

#### Customer Activities
- **Load Customer**: Search and select customer
- **Record Payments**: Add payment amounts
- **Record SP**: Add service points
- **View History**: See all customer activities

### Expense Tracking

#### Adding Expenses
1. Navigate to Expense Tracker
2. Fill in expense details
3. Select category
4. Choose date
5. Click "Add Expense"

#### Viewing Expenses
- **All Expenses**: Default view shows all expenses
- **Filter by Date**: Use date filters for specific periods
- **Filter by Category**: Select specific expense categories
- **View Summaries**: Check total, monthly, and today's expenses

## 🛠️ Development

### Code Structure

#### Modular Architecture
```javascript
// app.js - Main application logic
document.addEventListener("DOMContentLoaded", () => {
    // Authentication
    // Product management
    // Order processing
    // Navigation
});

// customer-management.js - Customer operations
document.addEventListener("DOMContentLoaded", () => {
    // Customer CRUD
    // Activity tracking
    // Balance management
});

// expense-tracker.js - Expense operations
document.addEventListener("DOMContentLoaded", () => {
    // Expense CRUD
    // Filtering
    // Summaries
});
```

#### Database Integration
```javascript
// Supabase configuration
const SUPABASE_URL = "your-project-url";
const SUPABASE_HEADERS = {
    apikey: "your-anon-key",
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json"
};

// Example API call
async function fetchData() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/table`, {
        headers: SUPABASE_HEADERS
    });
    return await response.json();
}
```

### Styling Guidelines

#### CSS Architecture
```css
/* Global styles */
:root { /* CSS variables */ }
body { /* Base styles */ }

/* Component styles */
.billing-section { /* Module specific */ }
.customer-section { /* Module specific */ }
.expense-section { /* Module specific */ }

/* Responsive design */
@media (max-width: 768px) { /* Mobile styles */ }
```

### JavaScript Best Practices

#### Error Handling
```javascript
try {
    const result = await apiCall();
    console.log('Success:', result);
} catch (error) {
    console.error('Error:', error);
    alert('Operation failed. Please try again.');
}
```

#### Data Validation
```javascript
function validateExpense(data) {
    if (!data.description || data.amount <= 0) {
        throw new Error('Invalid expense data');
    }
    return true;
}
```

## 🔧 Troubleshooting

### Common Issues

#### Authentication Problems
**Issue**: Login not working
**Solution**: 
- Check localStorage for expired session
- Verify admin credentials (JWAdmin)
- Clear browser cache and retry

#### Database Connection Issues
**Issue**: Data not loading
**Solution**:
- Verify Supabase URL and keys
- Check network connectivity
- Review Supabase project status

#### Order Creation Failures
**Issue**: Orders not saving
**Solution**:
- Check required fields
- Verify product availability
- Review database permissions

#### Expense Tracking Issues
**Issue**: Expenses not appearing
**Solution**:
- Check date format (YYYY-MM-DD)
- Verify category selection
- Review database table structure

### Debug Tools

#### Browser Console
```javascript
// Check for JavaScript errors
console.log('Debug info:', data);

// Network requests monitoring
// Use browser DevTools Network tab
```

#### Database Debugging
```sql
-- Check table contents
SELECT COUNT(*) FROM orders;
SELECT * FROM orders LIMIT 5;

-- Verify functions
SELECT * FROM pg_proc WHERE proname LIKE 'order%';
```

### Performance Optimization

#### Frontend Optimization
- Minimize DOM manipulations
- Use event delegation
- Implement lazy loading
- Optimize image sizes

#### Database Optimization
- Add appropriate indexes
- Use database functions
- Implement pagination
- Cache frequent queries

## 🤝 Contributing

### Development Workflow

1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Make Changes**
   - Follow coding standards
   - Add appropriate comments
   - Test thoroughly
4. **Submit Pull Request**
   - Describe changes
   - Include screenshots
   - Request review

### Code Standards

#### JavaScript Standards
- Use ES6+ features
- Implement proper error handling
- Add JSDoc comments
- Follow consistent naming conventions

#### CSS Standards
- Use BEM methodology
- Implement responsive design
- Optimize for performance
- Maintain consistency

#### Documentation Standards
- Update README for new features
- Add inline code comments
- Document API changes
- Maintain changelog

### Testing Guidelines

#### Manual Testing
- Test all user flows
- Verify responsive design
- Check cross-browser compatibility
- Validate error handling

#### Database Testing
- Test all CRUD operations
- Verify data integrity
- Check performance
- Test edge cases

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and inquiries:

- **Email**: support@jagannathwellness.com
- **Documentation**: [Wiki](https://github.com/your-org/jagannath-wellness-billing/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/jagannath-wellness-billing/issues)

## 🔄 Version History

### v1.0.0 (2025-01-01)
- Initial release
- Core billing functionality
- Customer management system
- Expense tracking module
- Authentication system
- Database integration

### Upcoming Features
- **Advanced Reporting**: Detailed analytics and reports
- **Inventory Management**: Stock tracking and alerts
- **Multi-user Support**: Role-based access control
- **Mobile App**: Native mobile applications
- **API Integration**: Third-party service integrations

---

**Jagannath Wellness Billing System** - Built with ❤️ for better business management
