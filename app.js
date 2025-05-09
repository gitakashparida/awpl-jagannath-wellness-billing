// Improved styling for modern look
let fetchedProducts = [];

function addProductRow(product) {
  const table = document.getElementById("productTable");
  const tbody = document.getElementById("productRows");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="px-4 py-2">${product.name}</td>
    <td class="px-4 py-2">${product.mrp}</td>
    <td class="px-4 py-2">${product.price}</td>
    <td class="px-4 py-2">${product.sp}</td>
    <td class="px-4 py-2"><input type="number" value="1" min="1" class="quantity border rounded px-2 py-1" onchange="updateTotals()"></td>
    <td class="px-4 py-2 subtotal">${product.price}</td>
    <td class="px-4 py-2"><button class="remove-btn bg-red-500 text-white rounded px-2 py-1" onclick="removeProduct(this)">Remove</button></td>
  `;

  tbody.appendChild(row);
  table.style.display = "table";
  fetchedProducts.push(product);
  updateTotals();
}

function removeProduct(button) {
  const row = button.parentNode.parentNode;
  const index = row.rowIndex - 1;
  fetchedProducts.splice(index, 1);
  row.remove();
  updateTotals();
  if (fetchedProducts.length === 0) {
    document.getElementById("productTable").style.display = "none";
  }
}

function updateTotals() {
  let totalCost = 0;
  let totalSP = 0;

  const rows = document.querySelectorAll("#productRows tr");

  rows.forEach((row, index) => {
    const quantity = parseInt(row.querySelector(".quantity").value);
    const price = parseFloat(fetchedProducts[index].price);
    const sp = parseInt(fetchedProducts[index].sp);

    const subtotal = quantity * price;
    row.querySelector(".subtotal").textContent = subtotal.toFixed(2);

    totalCost += subtotal;
    totalSP += quantity * sp;
  });

  document.getElementById("totalCost").textContent = totalCost.toFixed(2);
  document.getElementById("totalSP").textContent = totalSP;
}

async function fetchProduct() {
  const name = document.getElementById('productName').value.trim();

  if (!name) {
    alert("Please enter a product name");
    return;
  }

  try {
    const response = await fetch(`https://delicate-meadow-ca6a.akashparida-official.workers.dev/get-product?name=${encodeURIComponent(name)}`);
    const data = await response.json();

    if (data.length === 0) {
      alert("Product not found.");
      return;
    }

    addProductRow(data[0]);
    document.getElementById('productName').value = '';

  } catch (error) {
    console.error("Error fetching product:", error.message);
    alert("Failed to fetch product details: " + error.message);
  }
}

async function placeOrder() {
  const customerName = document.getElementById("customerName").value.trim();
  const customerPhone = document.getElementById("customerPhone").value.trim();

  if (!customerName || !customerPhone || fetchedProducts.length === 0) {
    alert("Please fill in all customer details and add at least one product.");
    return;
  }

  const orderPayload = fetchedProducts.map(product => ({
    customer_name: customerName,
    product_names: product.name,
    total_price: parseFloat(document.getElementById("totalCost").textContent),
    total_SP: parseInt(document.getElementById("totalSP").textContent),
    order_date: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }));

  try {
    const response = await fetch('https://delicate-meadow-ca6a.akashparida-official.workers.dev/place-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    if (response.ok) {
      alert("Order placed successfully!");
      document.getElementById("productRows").innerHTML = "";
      document.getElementById("totalCost").textContent = "0";
      document.getElementById("totalSP").textContent = "0";
      fetchedProducts = [];
      document.getElementById("productTable").style.display = "none";
    } else {
      throw new Error(`Failed to place order. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error placing order:", error.message);
    alert("Failed to place order. Error: " + error.message);
  }
}

// Align customer details
const customerDetails = document.querySelectorAll(".customer-detail");
customerDetails.forEach(element => {
  element.style.display = "flex";
  element.style.alignItems = "center";
  element.style.marginBottom = "1rem";
});
