
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
        body: JSON.stringify({ customer_name: customerName, product_names: productNames, total_price: totalPrice, total_SP: totalSP })
    });

    if (response.ok) {
        alert("Order placed successfully!");
        selectedProducts = [];
    }
}
