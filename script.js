const API_URL = "https://shoemob.onrender.com/api";
let allProducts = [];

// 🎬 CINEMATIC INTRO LOGIC
// Website load hote hi intro start hoga
window.addEventListener('load', () => {
    console.log("SHOEMOB Engine Starting...");
    
    // 4.5 Seconds baad intro gayab hoga
    setTimeout(hideIntro, 4500); 
    
    // Backend se products load karein
    fetchInventory();
});

function hideIntro() {
    const intro = document.getElementById('intro-screen');
    if(intro) {
        intro.style.opacity = '0';
        intro.style.transition = '1.5s ease-in-out';
        setTimeout(() => {
            intro.style.display = 'none';
            document.body.style.overflowY = 'auto'; // Scroll enable karein
        }, 1500);
    }
}

// 🛒 BACKEND SE PRODUCTS LENA
async function fetchInventory() {
    try {
        const res = await fetch(`${API_URL}/products`);
        allProducts = await res.json();
        renderProducts(allProducts);
    } catch (err) {
        console.error("Inventory Load Error:", err);
        document.getElementById('productGrid').innerHTML = "<p>Store update ho raha hai... Kripya intezar karein.</p>";
    }
}

// 👟 PRODUCTS KO SCREEN PAR DIKHANA
function renderProducts(data) {
    const grid = document.getElementById('productGrid');
    if(!grid) return;
    
    if(data.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 50px;">
                <p style="letter-spacing:2px; color:#888;">CURATING NEW ARRIVALS...</p>
            </div>`;
        return;
    }
    
    grid.innerHTML = data.map(p => `
        <div class="p-card">
            ${p.isBestSeller ? '<div class="badge">BESTSELLER</div>' : ''}
            <img src="${p.images[0] || 'https://via.placeholder.com/400'}" alt="${p.name}">
            <div class="p-info" style="padding:20px; text-align:center;">
                <h4 style="letter-spacing:2px; font-weight:700;">${p.name.toUpperCase()}</h4>
                <p style="color:#999; font-size:11px; margin:5px 0;">${p.category}</p>
                <p style="font-size:18px; font-weight:900; margin:15px 0;">₹${p.price.toLocaleString()}</p>
                <div style="display:flex; gap:10px;">
                   <button class="buy-btn" onclick="openCheckout('${p.name}', ${p.price})">BUY NOW</button>
                   <button style="background:#eee; border:none; padding:10px; cursor:pointer;" onclick="addToWishlist('${p._id}')">❤️</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 🔍 SEARCH FUNCTION (Live Search)
function searchProducts() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.category.toLowerCase().includes(term)
    );
    renderProducts(filtered);
}

function toggleSearch() {
    const bar = document.getElementById('searchOverlay');
    bar.style.display = (bar.style.display === 'block') ? 'none' : 'block';
    if(bar.style.display === 'block') document.getElementById('searchInput').focus();
}

// 📦 CHECKOUT MODAL LOGIC
function openCheckout(name, price) {
    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Scroll stop
    document.getElementById('order-summary').innerHTML = `
        <div style="background:#f9f9f9; padding:15px; border-left:4px solid black; margin-bottom:20px;">
            <p style="font-size:12px; color:#666;">SHOPPING BAG</p>
            <h4 style="margin:5px 0;">${name}</h4>
            <p style="font-weight:900;">Total: ₹${price.toLocaleString()}</p>
        </div>
    `;
}

function closeModal() {
    document.getElementById('checkoutModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 🚀 ORDER SUBMIT (To Backend)
async function submitOrder() {
    const btn = document.querySelector('.place-order');
    const originalText = btn.innerText;
    
    // Form Data
    const orderData = {
        customer: {
            name: document.getElementById('custName').value,
            email: document.getElementById('custEmail').value,
            mobile: document.getElementById('custMobile').value,
            address: document.getElementById('custAddress').value,
            city: document.getElementById('custCity').value,
            state: document.getElementById('custState').value,
            zip: document.getElementById('custZip').value
        },
        products: [{ name: "Store Item" }], // Isse hum baad mein cart se connect karenge
        totalAmount: 0 // Calculation baad mein
    };

    if(!orderData.customer.name || !orderData.customer.mobile) {
        alert("Kripya Naam aur Mobile Number sahi se bharein.");
        return;
    }

    btn.innerText = "PROCESSING...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if(res.ok) {
            alert("SUCCESS! Order Placed. SHOEMOB team will contact you for confirmation. 🔔");
            closeModal();
            document.getElementById('checkoutForm').reset();
        }
    } catch (err) {
        alert("Order failed. Please try again.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// Close modal click outside
window.onclick = function(event) {
    let modal = document.getElementById('checkoutModal');
    if (event.target == modal) { closeModal(); }
          }
