
const menu = [
  { id: 1, name: "Veg Fried Rice", price: 99 },
  { id: 2, name: "Schezwan Fried Rice", price: 109 },
  { id: 3, name: "Masala Maggi", price: 59 },
  { id: 4, name: "Matar Maggi", price: 69 },
  { id: 5, name: "Veg Manchurian Gravy", price: 119 },
  { id: 6, name: "Desi Masala Pasta", price: 99 }
];

const cart = {};

function renderMenu() {
  document.getElementById("menuGrid").innerHTML =
    menu.map(item => `
      <div class="menu-card">
        <h3>${item.name}</h3>
        <div class="menu-bottom">
          <span class="price">₹${item.price}</span>
          <button class="add-btn" onclick="changeQty(${item.id}, 1)">
            + ADD
          </button>
        </div>
      </div>
    `).join("");
}

function changeQty(id, change) {
  cart[id] = (cart[id] || 0) + change;

  if (cart[id] <= 0) {
    delete cart[id];
  }

  renderCart();
}

function getSubtotal() {
  return menu.reduce(
    (sum, item) => sum + item.price * (cart[item.id] || 0),
    0
  );
}

function renderCart() {
  const selected = menu.filter(item => cart[item.id]);
  const container = document.getElementById("cartItems");

  if (selected.length === 0) {
    container.innerHTML = "Your cart is empty.";
  } else {
    container.innerHTML = selected.map(item => `
      <div class="cart-row">
        <span>${item.name} × ${cart[item.id]}</span>
        <span>
          ₹${item.price * cart[item.id]}
          <button onclick="changeQty(${item.id}, -1)">−</button>
          <button onclick="changeQty(${item.id}, 1)">+</button>
        </span>
      </div>
    `).join("");
  }

  const subtotal = getSubtotal();
  document.getElementById("subtotal").textContent = `₹${subtotal}`;
  document.getElementById("total").textContent =
    `₹${subtotal === 0 ? 0 : subtotal + 10 + 30}`;
}

function payWithRazorpay(orderDetails) {
  // RAZORPAY WILL BE CONNECTED HERE LATER.
  // Secure backend must create the Razorpay order
  // and verify payment. Never put Key Secret here.

  alert("Online payment is not active yet. Please try after payment setup.");
}

document.getElementById("orderForm").addEventListener("submit", function(event) {
  event.preventDefault();

  if (getSubtotal() === 0) {
    alert("Please add items to your cart first.");
    return;
  }

  const orderDetails = {
    name: document.getElementById("customerName").value.trim(),
    phone: document.getElementById("customerPhone").value.trim(),
    address: document.getElementById("customerAddress").value.trim(),
    note: document.getElementById("deliveryNote").value.trim(),
    items: menu.filter(item => cart[item.id]).map(item => ({
      name: item.name,
      quantity: cart[item.id],
      price: item.price
    })),
    subtotal: getSubtotal(),
    packing: 10,
    deliveryEstimate: 30,
    totalEstimate: getSubtotal() + 40
  };

  if (!/^[0-9]{10}$/.test(orderDetails.phone)) {
    alert("Enter a valid 10-digit mobile number.");
    return;
  }

  payWithRazorpay(orderDetails);
});
function payWithRazorpay(orderDetails) {
    // 1. Charges calculate karein
    const packingCharge = 25;
    const deliveryCharge = 40;
    
    // Agar orderDetails me total pehle se hai toh wo use karega, nahi toh fallback calculation
    let itemTotal = orderDetails.total || orderDetails.subtotal || 350;
    let finalAmount = itemTotal + packingCharge + deliveryCharge;

    var options = {
        "key": "rzp_test_YOUR_KEY_HERE", // Yahan Razorpay Test Key ID daalein
        "amount": finalAmount * 100, // Amount paise me (Rs * 100)
        "currency": "INR",
        "name": "NIGHT WOK",
        "description": "Order (Food + Packing + Delivery)",
        
        "handler": function (response) {
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            console.log("Payment Details:", response);
            // Optional: Agar cart clear karni ho:
            // cart = [];
            // renderCart();
        },
        
        "prefill": {
            "name": orderDetails.name || "",
            "contact": orderDetails.phone || ""
        },
        
        "theme": {
            "color": "#0c2340"
        }
    };

    var rzp = new Razorpay(options);
    
    rzp.on('payment.failed', function (response) {
        alert("Payment Cancelled/Failed: " + response.error.description);
    });

    rzp.open();
}
function updateOpeningStatus() {
  const now = new Date();
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();

  let isOpen;

  if (day === 0) {
    isOpen = minutes >= 420 && minutes < 720;
  } else {
    isOpen = minutes >= 1080 || minutes < 60;
  }

  document.getElementById("openingStatus").textContent =
    isOpen ? "OPEN NOW — TAKING ORDERS" : "CURRENTLY CLOSED";
}

renderMenu();
renderCart();
updateOpeningStatus();
