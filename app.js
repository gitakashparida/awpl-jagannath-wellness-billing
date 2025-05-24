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

        let currentIndex = 0;
        selectedProducts.forEach((product) => {
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
            removeBtn.classList.add("remove-btn");
            removeBtn.setAttribute("data-index", currentIndex);

            item.appendChild(infoSpan);
            item.appendChild();
            orderSummary.appendChild(item);
            currentIndex++;
        });

        totalCostElement.textContent = `Total Cost: Rs. ${totalCost}`;
        totalSpElement.textContent = `Total SP: ${totalSp}`;
        // Add event listeners for remove buttons
        orderSummary.addEventListener("click", (e) => {
            if (e.target.classList.contains("remove-btn")) {
                // Get the parent div and find its index in the orderSummary
                const parent = e.target.parentElement;
                const index = Array.from(orderSummary.children).indexOf(parent);
                selectedProducts.splice(index, 1);
                updateOrderSummary();
            }
        });
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
            let url = "https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/orders?select=*&order=order_date.desc&limit=20";

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
                        orders.forEach((order, index) => {
                                            const wrapper = document.createElement("div");
                                            wrapper.className = "order-item";

                                            const header = document.createElement("h4");
                                            header.textContent = `#${order.uid} - ${order.customer_name} - Rs. ${order.total_cost} (SP: ${order.total_sp})`;

                                            const meta = document.createElement("p");
                                            meta.style.fontSize = "12px";
                                            meta.style.margin = "4px 0 6px";
                                            meta.textContent = `🕒 ${new Date(order.order_date).toLocaleString()}`;

                                            const items = document.createElement("p");
                                            items.style.whiteSpace = "pre-wrap";
                                            items.textContent = order.product_names;

                                            wrapper.appendChild(header);
                                            wrapper.appendChild(meta);
                                            wrapper.appendChild(items);
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
                        doc.setFontSize(9);
                        doc.setFont("helvetica", "bold");
                        doc.text("JAGANNATH WELLNESS", 105, 20, { align: "center" });
                        doc.setFont("helvetica", "normal");
                                    doc.text("BDA Colony, Chandrasekharpur, Khordha, Bhubaneswar - 751016", 105, 28, { align: "center" });
                                    doc.text("Contact: +91-7381716240", 105, 35, { align: "center" });
                                    doc.line(20, 40, 190, 40);


                        doc.line(20, 40, 190, 40);
                        let y = 50;
                                    doc.text(`Customer Name: ${order.customer_name}`, 20, y);
                                    doc.text(`Bill Number: ${order.uid}`, 160, y);
                                    y += 10;
                                    doc.text(`Order Date: ${orderDate}`, 20, y);
                                    y += 10;
                                    doc.text("Order Details:", 20, y);
                                    y += 10;

                                    doc.text("Item", 20, y);
                                    doc.text("Qty", 70, y);
                                    doc.text("Price", 100, y);
                                    doc.text("SP", 130, y);
                                    doc.text("Product Cost", 160, y);
                                    y += 6;
                                    doc.line(20, y, 190, y);
                                    y += 6;

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
                                        y += 8;
                                    });

                                    y += 10;
                                    doc.text(`Total Cost: Rs. ${order.total_cost}`, 20, y);
                                    doc.text(`Total SP: ${order.total_sp}`, 20, y + 10);

                                    const fileName = `Order_${order.customer_name}_${order.uid}.pdf`;
                                    doc.save(fileName);

                   } catch (error) {
                       console.error("Error fetching order:", error);
                       alert("Failed to fetch the last order. Please try again.");
            }
        }
    });
