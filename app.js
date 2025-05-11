document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("product-search");
    const quantityInput = document.getElementById("product-quantity");
    const customerNameInput = document.getElementById("customer-name");
    const dropdown = document.getElementById("dropdown");
    const orderSummary = document.getElementById("order-summary");
    const placeOrderButton = document.getElementById("place-order");
    const totalCostElement = document.getElementById("total-cost");
    const totalSpElement = document.getElementById("total-sp");
    const addProductButton = document.getElementById("add-product");
    const getOrdersButton = document.getElementById("get-orders");
    const orderHistoryElement = document.getElementById("order-history");
    const customerNameSearchInput = document.getElementById("customer-name-search");

    let products = [];
    let selectedProducts = [];

    // Fetch the product list from the backend
    fetch("https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/products", {
        headers: {
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            products = data;
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
            alert("Failed to load product list. Please try again later.");
        });

    // Add better spacing between quantity field and add button
    quantityInput.style.marginRight = "12px";

    // Filter and display the dropdown as user types
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        dropdown.innerHTML = "";

        if (query) {
            const filtered = products.filter((product) =>
                product.name.toLowerCase().includes(query)
            );

            filtered.forEach((product) => {
                const item = document.createElement("div");
                item.textContent = product.name;
                item.classList.add("dropdown-item");
                item.addEventListener("click", () => {
                    searchInput.value = product.name;
                    dropdown.style.display = "none";
                });
                dropdown.appendChild(item);
            });

            dropdown.style.display = "block";
        } else {
            dropdown.style.display = "none";
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!dropdown.contains(event.target) && event.target !== searchInput) {
            dropdown.style.display = "none";
        }
    });

    // Add product to order with quantity
    function addProductToOrder(product, quantity) {
        const existingProduct = selectedProducts.find(p => p.uid === product.uid);

        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            product.quantity = quantity;
            selectedProducts.push(product);
        }

        updateOrderSummary();
        searchInput.value = "";
        quantityInput.value = "1";
        dropdown.style.display = "none";
    }

    // Update order summary
    function updateOrderSummary() {
        orderSummary.innerHTML = "";
        let totalCost = 0;
        let totalSp = 0;

        selectedProducts.forEach((product) => {
            const itemCost = product.price * product.quantity;
            const itemSp = product.sp * product.quantity;
            totalCost += itemCost;
            totalSp += itemSp;

            const item = document.createElement("div");
            item.textContent = `${product.name} (x${product.quantity}) - ₹${itemCost} (SP: ${itemSp})`;
            orderSummary.appendChild(item);
        });

        totalCostElement.textContent = `Total Cost: ₹${totalCost}`;
        totalSpElement.textContent = `Total SP: ${totalSp}`;
    }

    // Handle Add button click
    addProductButton.addEventListener("click", () => {
        const query = searchInput.value.toLowerCase().trim();
        const quantity = parseInt(quantityInput.value) || 1;

        if (!query || quantity <= 0) {
            alert("Please enter a valid product name and quantity.");
            return;
        }

        const matchingProduct = products.find(p => p.name.toLowerCase() === query);

        if (matchingProduct) {
            addProductToOrder(matchingProduct, quantity);
        } else {
            alert("Product not found. Please select a valid product from the list.");
        }
    });
    // Fetch last 10 orders logic
        getOrdersButton.addEventListener("click", () => {
            const customerName = customerNameSearchInput.value.trim();
            let url = "https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/orders?select=*&order=order_date.desc&limit=10";
            console.log("customerName", customerName);
            if (customerName) {
                // Ensure the value is URL encoded correctly
                url += `&customer_name=eq.${encodeURIComponent(customerName)}`;
            }

            fetch(url, {
                headers: {
                    apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8", // Replace with your actual API key
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`, // Replace with your actual Bearer token
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Request failed with status ${response.status}`);
                    }
                    return response.json();
                })
                .then((orders) => {
                    orderHistoryElement.innerHTML = "";
                    if (orders.length === 0) {
                        orderHistoryElement.textContent = "No orders found.";
                    } else {
                        orders.forEach((order) => {
                            const orderItem = document.createElement("div");
                            orderItem.textContent = `Customer: ${order.customer_name}, Products: ${order.product_names}, Total Cost: ₹${order.total_cost}, Total SP: ${order.total_sp}, Order Date: ${new Date(order.order_date).toLocaleString()}`;
                            orderHistoryElement.appendChild(orderItem);
                        });
                    }
                })
                .catch((error) => {
                    console.error("Error fetching orders:", error);
                    alert("Failed to load order history. Please try again later.");
                });
        });

    // Place order logic
    placeOrderButton.addEventListener("click", () => {
        if (selectedProducts.length === 0) {
            alert("No products selected!");
            return;
        }

        const customerName = customerNameInput.value.trim() || "Anonymous Customer";

        const orderData = {
            customer_name: customerName,
            product_names: selectedProducts.map((p) => `${p.name} x ${p.quantity}`),
            total_cost: selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0),
            total_sp: selectedProducts.reduce((sum, p) => sum + p.sp * p.quantity, 0),
        };

        fetch("https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/orders", {
            method: "POST",
            headers: {
                apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        })
            .then((response) => {
                if (response.status === 201) {
                    alert("Order placed successfully!");
                    selectedProducts = [];
                    customerNameInput.value = "";
                    updateOrderSummary();
                } else {
                    throw new Error(`Failed to place order. Status: ${response.status}`);
                }
            })
            .catch((error) => {
                console.error("Error placing order:", error);
                alert("Failed to place order. Please try again.");
            });
    });
});
