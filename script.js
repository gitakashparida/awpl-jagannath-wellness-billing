
let selectedProducts = [];

async function fetchProduct() {
    const productName = document.getElementById("product-name").value;
    const response = await fetch(`https://d69b05db-awpl-jagannath-wellness-billing.akashparida-official.workers.dev//get-product?name=${productName}`);
    const product = await response.json();

    if (product.length > 0) {
        selectedProducts.push(product[0]);
        document.getElementById("product-details").innerText = 
            `Added: ${product[0].name} - Price: $${product[0].price} - SP: ${product[0].SP}`;
    } else {
        document.getElementById("product-details").innerText = "Product not found";
    }
}

async function placeOrder() {
    const customerName = document.getElementById("customer-name").value;
    const productNames = selectedProducts.map(p => p.name).join(", ");
    const totalPrice = selectedProducts.reduce((sum, p) => sum + parseFloat(p.price), 0);
    const totalSP = selectedProducts.reduce((sum, p) => sum + p.SP, 0);

    const response = await fetch(`https://d69b05db-awpl-jagannath-wellness-billing.akashparida-official.workers.dev//place-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_name: customerName, product_names: productNames, total_cost: totalPrice, total_SP: totalSP })
    });

    if (response.ok) {
        alert("Order placed successfully!");
        selectedProducts = [];
    }
}

async function downloadOrderFile() {
    const customerName = document.getElementById('customer-name').value.trim();

    if (!customerName) {
        alert("Please enter a customer name before downloading the order.");
        return;
    }

    try {
        // Fetch the last order for the given customer
        const response = await fetch("https://d69b05db-awpl-jagannath-wellness-billing.akashparida-official.workers.dev/rest/v1/orders?customer_name=eq." + encodeURIComponent(customerName) + "&order=order_date.desc&limit=1", {
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
        const orderItems = JSON.parse(order.items);
        const orderDate = new Date(order.order_date).toLocaleString();

        // Create PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text("Order Invoice", 105, 20, { align: "center" });

        doc.setFontSize(12);
        doc.text(`Customer Name: ${order.customer_name}`, 20, 40);
        doc.text(`Order Date: ${orderDate}`, 20, 50);

        let y = 70;
        doc.text("Order Details:", 20, y);
        y += 10;

        orderItems.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.name}`, 20, y);
            doc.text(`Quantity: ${item.quantity}`, 60, y);
            doc.text(`Price: $${item.price}`, 120, y);
            doc.text(`Total: $${item.quantity * item.price}`, 160, y);
            y += 10;
        });

        doc.text(`Total Cost: $${order.total_cost}`, 20, y + 10);
        doc.text(`Total SP: ${order.total_sp}`, 20, y + 20);

        // Save the PDF
        const fileName = `Order_${order.customer_name}_${Date.now()}.pdf`;
        doc.save(fileName);

    } catch (error) {
        console.error("Error fetching order:", error);
        alert("Failed to fetch the last order. Please try again.");
    }
}


