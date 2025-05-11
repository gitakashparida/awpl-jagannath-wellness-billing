document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("product-search");
    const customerNameInput = document.getElementById("customer-name");
    const dropdown = document.getElementById("dropdown");
    const orderSummary = document.getElementById("order-summary");
    const placeOrderButton = document.getElementById("place-order");
    const totalCostElement = document.getElementById("total-cost");
    const totalSpElement = document.getElementById("total-sp");
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
            console.log("Fetched products:", products); // Log the fetched data
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
            alert("Failed to load product list. Please try again later.");
        });

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
                    addProductToOrder(product);
                    searchInput.value = "";
                    dropdown.innerHTML = "";
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

    // Add selected product to order
    function addProductToOrder(product) {
        selectedProducts.push(product);
        updateOrderSummary();
    }

    // Update order summary
    function updateOrderSummary() {
        orderSummary.innerHTML = "";
        let totalCost = 0;
        let totalSp = 0;

        selectedProducts.forEach((product) => {
            const item = document.createElement("div");
            item.textContent = `${product.name} - ₹${product.price} (SP: ${product.sp})`;
            orderSummary.appendChild(item);
            totalCost += product.price;
            totalSp += product.sp;
        });

        totalCostElement.textContent = `Total Cost: ₹${totalCost}`;
        totalSpElement.textContent = `Total SP: ${totalSp}`;
    }

    // Place order
    placeOrderButton.addEventListener("click", () => {
        if (selectedProducts.length === 0) {
            alert("No products selected!");
            return;
        }

        const customerName = customerNameInput.value.trim() || "Anonymous Customer";

        const orderData = {
            customer_name: customerName,
            product_names: selectedProducts.map((p) => p.name),
            total_cost: selectedProducts.reduce((sum, p) => sum + p.price, 0),
            total_sp: selectedProducts.reduce((sum, p) => sum + p.sp, 0),
        };
        console.log(orderData);

        fetch("https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/orders", {
            method: "POST",
            headers: {
                apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData)
        })
            .then((response) => response.json())
            .then((data) => {
                alert("Order placed successfully!");
                selectedProducts = [];
                customerNameInput.value = "";
                updateOrderSummary();
            })
            .catch((error) => {
                console.error("Error placing order:", error);
                alert("Failed to place order. Please try again.");
            });
    });
});
