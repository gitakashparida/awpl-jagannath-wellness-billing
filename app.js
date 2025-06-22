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
    const orderNumberInput = document.getElementById("order-number");
    const nameInput = document.getElementById("new-product-name");
    const priceInput = document.getElementById("new-product-price");
    const mrpInput = document.getElementById("new-product-mrp");
    const spInput = document.getElementById("new-product-sp");
    const deleteProductInput = document.getElementById("delete-product-input");
    const deleteProductDropdown = document.getElementById("delete-product-dropdown");
    const editOrderNumberInput = document.getElementById("edit-order-number");
    const fetchOrderToEditBtn = document.getElementById("fetch-order-to-edit");
    const editOrderSection = document.getElementById("edit-order-section");
    const editOrderSummary = document.getElementById("edit-order-summary");
    const editTotalCostElement = document.getElementById("edit-total-cost");
    const editTotalSpElement = document.getElementById("edit-total-sp");
    const saveEditedOrderBtn = document.getElementById("save-edited-order");



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
        quantityInput.value = "0";
        dropdown.style.display = "none";
    }

    // Update order summary
    function updateOrderSummary() {
        orderSummary.innerHTML = "";
        let totalCost = 0;
        let totalSp = 0;

        selectedProducts.forEach((product, index) => {
            const itemCost = product.price * product.quantity;
            const itemSp = product.sp * product.quantity;
            totalCost += itemCost;
            totalSp += itemSp;

            const item = document.createElement("div");
            item.style.display = "flex";
            item.style.justifyContent = "space-between";
            item.style.alignItems = "center";
            item.style.marginBottom = "4px";
            item.style.fontSize = "14px";

            const infoSpan = document.createElement("span");
            infoSpan.textContent = `${product.name} (x${product.quantity}) - Rs. ${itemCost} (SP: ${itemSp})`;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove from Cart";
            removeBtn.style.fontSize = "15px";
            removeBtn.style.padding = "2px 6px";
            removeBtn.style.marginLeft = "300px";
            removeBtn.addEventListener("click", () => {
                selectedProducts.splice(index, 1);
                updateOrderSummary();
            });

            item.appendChild(infoSpan);
            item.appendChild(removeBtn);
            orderSummary.appendChild(item);
        });

        totalCostElement.textContent = `Total Cost: Rs. ${totalCost}`;
        totalSpElement.textContent = `Total SP: ${totalSp}`;
    }

    // Handle Add button to Cart click
    addProductButton.addEventListener("click", () => {
        const query = searchInput.value.toLowerCase().trim();
        const quantity = parseInt(quantityInput.value);

        if (!query || isNaN(quantity) || quantity <= 0) {
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
    // Fetch last 100 orders logic
        getOrdersButton.addEventListener("click", () => {
            const customerName = customerNameSearchInput.value.trim();
            let url = "https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/orders?select=*&order=order_date.desc&limit=100";

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
                            const wrapper = document.createElement("div");
                            wrapper.className = "order-item";

                            const header = document.createElement("h4");
                            header.textContent = `#${order.uid} - ${order.customer_name} - ₹${order.total_cost} (SP: ${order.total_sp})`;

                            const meta = document.createElement("p");
                            meta.style.fontSize = "12px";
                            meta.style.margin = "4px 0 6px";
                            meta.textContent = `🕒 ${new Date(order.order_date).toLocaleString()}`;

                            const items = document.createElement("p");
                            items.style.whiteSpace = "pre-wrap";
                            items.textContent = order.product_names;

                            const deleteBtn = document.createElement("button");
                            deleteBtn.textContent = "🗑️ Delete Order";
                            deleteBtn.style.fontSize = "12px";
                            deleteBtn.style.padding = "4px 8px";
                            deleteBtn.style.marginTop = "6px";
                            deleteBtn.style.backgroundColor = "#f44336";
                            deleteBtn.style.color = "white";
                            deleteBtn.style.border = "none";
                            deleteBtn.style.borderRadius = "4px";
                            deleteBtn.style.cursor = "pointer";

                            deleteBtn.addEventListener("click", () => {
                                if (confirm(`Are you sure you want to delete order #${order.uid}?`)) {
                                    fetch(`https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/orders?uid=eq.${order.uid}`, {
                                        method: "DELETE",
                                        headers: {
                                            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8", // Replace with your actual API key
                                                                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`, // Replace with your actual Bearer token
                                                                "Content-Type": "application/json",
                                        },
                                    })
                                        .then((response) => {
                                            if (response.ok) {
                                                alert("Order deleted successfully.");
                                                wrapper.remove(); // remove from DOM
                                            } else {
                                                alert("Failed to delete order.");
                                            }
                                        })
                                        .catch((error) => {
                                            console.error("Error deleting order:", error);
                                            alert("An error occurred while deleting the order.");
                                        });
                                }
                            });

                            wrapper.appendChild(header);
                            wrapper.appendChild(meta);
                            wrapper.appendChild(items);
                            wrapper.appendChild(deleteBtn);
                            wrapper.style.padding = "10px";
                            wrapper.style.border = "1px solid #ccc";
                            wrapper.style.marginBottom = "10px";
                            wrapper.style.borderRadius = "5px";
                            wrapper.style.background = "#f9f9f9";

                            orderHistoryElement.appendChild(wrapper);
                        });

                    }
                })
                .catch((error) => {
                    console.error("Error fetching orders:", error);
                    alert("Failed to load order history. Please try again later.");
                });
        });

// Add New Product to Database (Supabase)
const addNewProductButton = document.getElementById("add-new-product");
addNewProductButton.addEventListener("click", () => {
    const name = document.getElementById("new-product-name").value.trim();
    const price = parseFloat(document.getElementById("new-product-price").value);
    const mrp = parseFloat(document.getElementById("new-product-mrp").value);
    const sp = parseFloat(document.getElementById("new-product-sp").value);

    if (!name || isNaN(price) || isNaN(mrp) || isNaN(sp)) {
        alert("Please fill in all fields with valid values.");
        return;
    }

    const newProduct = {
        name,
        price,
        MRP: mrp,
        sp
    };

    const payload = {
        name: nameInput.value.trim(),
        price: parseFloat(priceInput.value),
        mrp: parseFloat(mrpInput.value),
        sp: parseFloat(spInput.value)
    };
    console.log("Adding product with:", payload);


    fetch("https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/products", {
        method: "POST",
        headers: {
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
            "Content-Type": "application/json",
            Prefer: "return=representation"  // Optional but useful
        },
        body: JSON.stringify({
            name: nameInput.value.trim(),
            price: parseFloat(priceInput.value),
            mrp: parseFloat(mrpInput.value),
            sp: parseFloat(spInput.value)
        })
    })
        .then((res) => {
            if (res.status === 201) {
                alert("Product added successfully!");
                document.getElementById("new-product-name").value = "";
                document.getElementById("new-product-price").value = "";
                document.getElementById("new-product-mrp").value = "";
                document.getElementById("new-product-sp").value = "";
                return res.json();
            } else {
                throw new Error("Failed to add product.");
            }
        })
        .then((data) => {
            products.push(data[0]); // Update local product list immediately
        })
        .catch((error) => {
            console.error("Error adding product:", error);
            alert("Error adding product. Please try again.");
        });
});

deleteProductInput.addEventListener("input", () => {
    const query = deleteProductInput.value.toLowerCase();
    deleteProductDropdown.innerHTML = "";

    if (query) {
        const filtered = products.filter((product) =>
            product.name.toLowerCase().includes(query)
        );

        filtered.forEach((product) => {
            const item = document.createElement("div");
            item.textContent = product.name;
            item.classList.add("dropdown-item");
            item.addEventListener("click", () => {
                deleteProductInput.value = product.name;
                deleteProductDropdown.style.display = "none";

                if (confirm(`Are you sure you want to delete '${product.name}'?`)) {
                    fetch(`https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/products?uid=eq.${product.uid}`, {
                        method: "DELETE",
                        headers: {
                            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
                                        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
                                        "Content-Type": "application/json",
                        },
                    })
                    .then((response) => {
                        if (response.ok) {
                            alert("Product deleted successfully.");
                            products = products.filter(p => p.uid !== product.uid);
                        } else {
                            alert("Failed to delete product.");
                        }
                    })
                    .catch((error) => {
                        console.error("Error deleting product:", error);
                        alert("An error occurred while deleting the product.");
                    });
                }
            });
            deleteProductDropdown.appendChild(item);
        });

        deleteProductDropdown.style.display = "block";
    } else {
        deleteProductDropdown.style.display = "none";
    }
});

document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target) && event.target !== searchInput) {
        dropdown.style.display = "none";
    }
    if (!deleteProductDropdown.contains(event.target) && event.target !== deleteProductInput) {
        deleteProductDropdown.style.display = "none";
    }
});

fetchOrderToEditBtn.addEventListener("click", async () => {
    const orderId = editOrderNumberInput.value.trim();

    if (!orderId || isNaN(orderId)) {
        alert("Please enter a valid order number.");
        return;
    }

    try {
        const response = await fetch(`https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/orders?uid=eq.${orderId}`, {
            headers: {
                apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
                "Content-Type": "application/json",
            }
        });

        const data = await response.json();

        if (data.length === 0) {
            alert("No such order found.");
            return;
        }

        const order = data[0];
        displayEditableOrder(order);
    } catch (err) {
        console.error("Failed to fetch order:", err);
        alert("Error fetching order. Try again.");
    }
});

function displayEditableOrder(order) {
    editOrderSection.style.display = "block";
    editOrderSummary.innerHTML = "";

    // Parse fresh copy of items every time to avoid duplicating
    const items = order.product_names.split(", ").map(item => {
        const [namePart, qtyPart, pricePart, spPart] = item.split(" x ");
        return {
            name: namePart.trim(),
            quantity: parseInt(qtyPart.split(": ")[1]),
            price: parseFloat(pricePart.split(": ")[1]),
            sp: parseFloat(spPart.split(": ")[1])
        };
    });

    function renderUI() {
        editOrderSummary.innerHTML = "";
        let totalCost = 0;
        let totalSp = 0;

        items.forEach((item, index) => {
            const row = document.createElement("div");
            row.style.display = "flex";
            row.style.justifyContent = "space-between";
            row.style.marginBottom = "6px";

            const nameSpan = document.createElement("span");
            nameSpan.textContent = item.name;

            const qtyInput = document.createElement("input");
            qtyInput.type = "number";
            qtyInput.min = "0";
            qtyInput.value = item.quantity;
            qtyInput.style.width = "60px";
            qtyInput.classList.add("edit-qty");

            qtyInput.setAttribute("data-price", item.price);
            qtyInput.setAttribute("data-sp", item.sp);

            qtyInput.addEventListener("input", () => {
                const newQty = parseInt(qtyInput.value);
                if (!isNaN(newQty)) {
                    item.quantity = newQty;
                    updateTotals();
                }
            });

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "❌";
            removeBtn.style.fontSize = "10px";
            removeBtn.style.marginLeft = "10px";
            removeBtn.addEventListener("click", () => {
                items.splice(index, 1);
                renderUI();  // re-render after removing
            });

            const itemGroup = document.createElement("div");
            itemGroup.appendChild(nameSpan);
            itemGroup.appendChild(qtyInput);
            itemGroup.appendChild(removeBtn);

            row.appendChild(itemGroup);
            editOrderSummary.appendChild(row);
        });

        updateTotals();
    }

    function updateTotals() {
        let totalCost = 0;
        let totalSp = 0;

        items.forEach(item => {
            totalCost += item.price * item.quantity;
            totalSp += item.sp * item.quantity;
        });

        editTotalCostElement.textContent = `Total Cost: ₹${totalCost.toFixed(2)}`;
        editTotalSpElement.textContent = `Total SP: ${totalSp.toFixed(2)}`;
    }

    // Prevent duplicate event bindings
    saveEditedOrderBtn.replaceWith(saveEditedOrderBtn.cloneNode(true));
    const newSaveBtn = document.getElementById("save-edited-order");

    newSaveBtn.onclick = () => {
        saveEditedOrder(order.uid, items);
    };

    renderUI();

    setTimeout(() => {
        document.querySelector(".edit-qty")?.focus();
    }, 100);
}



function saveEditedOrder(orderUid) {
    const rows = editOrderSummary.querySelectorAll("div[style*='display: flex']");
    const updatedItems = [];

    rows.forEach((row) => {
        const itemGroup = row.querySelector("div");
        if (!itemGroup) return;
        
        const name = itemGroup.querySelector("span")?.textContent.trim();
        const qtyInput = itemGroup.querySelector("input.edit-qty");
        if (!name || !qtyInput) return;
        
        const quantity = parseInt(qtyInput.value);
        const price = parseFloat(qtyInput.getAttribute("data-price"));
        const sp = parseFloat(qtyInput.getAttribute("data-sp"));

        if (isNaN(quantity) || isNaN(price) || isNaN(sp)) return;

        updatedItems.push({ name, quantity, price, sp });
    });

    if (updatedItems.length === 0) {
        alert("Cannot save an empty order.");
        return;
    }

    const updatedProductNames = updatedItems.map(item =>
        `${item.name} x Qty: ${item.quantity} x Price: ${item.price} x SP: ${item.sp}`
    ).join(", ");

    const updatedTotalCost = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const updatedTotalSp = updatedItems.reduce((sum, item) => sum + item.sp * item.quantity, 0);

    const updatedOrder = {
        product_names: updatedProductNames,
        total_cost: updatedTotalCost,
        total_sp: updatedTotalSp
    };

    console.log("Before patch request",updatedOrder);

    fetch(`https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/orders?uid=eq.${orderUid}`, {
        method: "PATCH",
        headers: {
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        },
        body: JSON.stringify(updatedOrder)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Update failed. Status: ${response.status}`);
        }
        alert("Order updated successfully!");
        editOrderSection.style.display = "none";
    })
    .catch(error => {
        console.error("Error saving edited order:", error);
        alert("Failed to update the order. Please try again.");
    });
}




    // Place order logic
    placeOrderButton.addEventListener("click", () => {
        if (selectedProducts.length === 0) {
            alert("No products selected!");
            return;
        }

        const customerName = customerNameInput.value.trim() || "Anonymous Customer";

        const orderData = {
            customer_name: customerName,
            product_names: selectedProducts.map((p) => `${p.name} x Qty: ${p.quantity} x Price: ${p.price} x SP: ${p.sp}`).join(", "),
            total_cost: selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0),
            total_sp: selectedProducts.reduce((sum, p) => sum + p.sp * p.quantity, 0),
        };
        console.log("orderData", orderData);
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
       // Handle Order File Download
               document.getElementById("download-order-details").addEventListener("click", downloadOrderFile);

               async function downloadOrderFile() {
                   const orderId = orderNumberInput.value.trim();

                   if (!orderId || isNaN(orderId)) {
                               alert("Please enter a valid order number.");
                               return;
                   }

                   try {
                       const response = await fetch(`https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/orders?uid=eq.${orderId}`,{
                           headers: {
                               "Content-Type": "application/json",
                               "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
                               "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8"
                           }
                       });

                       const orders = await response.json();

                       if (orders.length === 0) {
                           alert("No orders found for this customer.");
                           return;
                       }

                       const order = orders[0];
                       const orderItems = order.product_names.split(", ");
                       const orderDate = new Date(order.order_date);
                       // Convert to IST by adding 5.5 hours (330 minutes)
                       orderDate.setMinutes(orderDate.getMinutes() + 330);
                       // Format the date
                       const formattedDate = orderDate.toLocaleString('en-IN', {
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit',
                           second: '2-digit',
                           hour12: true
                       });

                       const { jsPDF } = window.jspdf;
                        const doc = new jsPDF();
                        // Add this after creating the doc
                        doc.setFontSize(12);
                        doc.setFont("helvetica", "bold");

                        // Add left image
//                        doc.addImage(data:image/png;base64,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, 'PNG', 10, 10, 20, 20);
                        doc.addImage('data:image/png;base64,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', 'PNG', 10, 5, 20, 15);

                        // Add text in the center
                        doc.text("JAGANNATH WELLNESS", 105, 5, { align: "center" });

                        // Add right image
//                        doc.addImage(data:image/png;base64,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, 'PNG', 180, 15, 20, 20);
                        doc.addImage('data:image/png;base64,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', 'PNG', 180, 5, 20, 15);
                        // Continue with the rest of your code
                        doc.setFont("helvetica", "normal");
                        doc.setFontSize(7);
                        doc.text("(An AWPL Franchise)", 105, 8, { align: "center" });
                        doc.setFontSize(9);
                        doc.text("BDA Colony, Chandrasekharpur, Khordha, Bhubaneswar - 751016", 105, 11, { align: "center" });
                        doc.text("Contact: +91-7381716240", 105, 15, { align: "center" });
                        doc.line(20, 20, 190, 20);
                        let y = 25;
                                    doc.text(`Customer Name: ${order.customer_name}`, 20, y);
                                    doc.setFont('helvetica', 'bold');
                                    const currentSize = doc.getFontSize();
                                    doc.setFontSize(currentSize + 2);
                                    doc.text(`Bill Number: ${order.uid}`, 160, y);
                                    doc.setFontSize(currentSize);
                                    doc.setFont('helvetica', 'normal');
                                    y += 5;
                                    doc.text(`Order Date: ${orderDate}`, 20, y);
                                    y += 5;
                                    doc.text("Order Details:", 20, y);
                                    y += 5;

                                    doc.text("Item", 20, y);
                                    doc.text("Qty", 70, y);
                                    doc.text("Price", 100, y);
                                    doc.text("SP", 130, y);
                                    doc.text("Product Cost", 160, y);
                                    y += 3;
                                    doc.line(20, y, 190, y);
                                    y += 4;

                                    orderItems.forEach((item, index) => {
                                        if (y > 270) {
                                            doc.addPage();
                                            y = 20;
                                        }

                                        const parts = item.split(" x ");
                                        const name = parts[0];
                                        const qty = parseInt(parts[1].split(": ")[1]);
                                        const priceVal = parseFloat(parts[2].split(": ")[1]);
                                        const sp = parts[3].split(": ")[1];
                                        const productCost = qty * priceVal;

                                        doc.text(`${index + 1}. ${name}`, 20, y);
                                        doc.text(`${qty}`, 70, y);
                                        doc.text(`Rs. ${priceVal.toFixed(2)}`, 100, y);
                                        doc.text(sp, 130, y);
                                        doc.text(`Rs. ${productCost.toFixed(2)}`, 160, y);
                                        y += 5;
                                    });

                                    y += 5;
                                    doc.text(`Total Cost: Rs. ${order.total_cost}`, 20, y);
                                    doc.text(`Total SP: ${order.total_sp}`, 20, y + 5);
                                    y += 10;
                                    doc.setFontSize(8);
                                    doc.text("Pay to | SBI A/c Name: Jagannath Wellness, A/c No.: 40877005106, IFSC: SBIN0017948 | UPI: 7381716240", 20, y);

                                    const fileName = `Order_${order.customer_name}_${order.uid}.pdf`;
                                    y += 10; // Add some space for the thank you message
                                    doc.setFontSize(10);
                                    doc.setFont('helvetica', 'bold');
                                    doc.text('Thank You for visiting. Hope to see you again', 105, y, { align: 'center' });
                                    doc.setFont('helvetica', 'normal');
                                    doc.save(fileName);

                   } catch (error) {
                       console.error("Error fetching order:", error);
                       alert("Failed to fetch the last order. Please try again.");
            }
        }
    });
