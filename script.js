let cart = [];
let total = 0;
let currentGoal = "";

// --- PERSONALIZED GREETING ---
function setGreeting() {
    const hours = new Date().getHours();
    let message = hours < 12 ? "Good Morning" : hours < 17 ? "Good Afternoon" : "Good Evening";
    const greetingEl = document.getElementById('userGreeting');
    if(greetingEl) {
        greetingEl.innerText = `${message}, Kishan!`;
    }
}
setGreeting();

// --- TOAST NOTIFICATION ---
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// --- AI RECOMMENDER MODAL ---
function openAiModal(goal) {
    currentGoal = goal;
    document.getElementById("modalTitle").innerText = "AI Analysis for " + goal;
    document.getElementById("aiModal").style.display = "block";
}

function closeModal() {
    document.getElementById("aiModal").style.display = "none";
}

function getAiRecommendation() {
    const height = document.getElementById("userHeight").value / 100;
    const weight = document.getElementById("userWeight").value;

    if (height > 0 && weight > 0) {
        const bmi = (weight / (height * height)).toFixed(1);
        let message = `Your BMI is ${bmi}. <br><br>`;
        message += (currentGoal === "Weight Loss") ? 
            "<b>AI Suggestion:</b> Focus on <b>Fresh Vegetables and Fruits</b>." : 
            "<b>AI Suggestion:</b> Focus on <b>Paneer, Milk, and Staples</b>.";
        document.getElementById("aiResult").innerHTML = message;
    } else {
        alert("Bhai, height aur weight daalo!");
    }
}

// --- CART MANAGEMENT & EVENT LISTENERS SETUP ---
document.addEventListener('DOMContentLoaded', () => {
    // Add to Cart Buttons Binding
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.item-card');
            const name = card.querySelector('h3').innerText;
            const priceText = card.querySelector('p').innerText;
            const price = parseInt(priceText.replace('₹', ''));
            addToCart(name, price);
        });
    });
});

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    updateCartUI();
    showToast(`✅ ${name} added to basket!`);
    
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar && !sidebar.classList.contains('open')) {
        toggleCart();
    }
}

function changeQty(name, amount) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.qty += amount;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
    }
    updateCartUI();
}

function updateCartUI() {
    const cartList = document.getElementById('cartItems');
    const totalDisplay = document.getElementById('cartTotal');
    const countDisplay = document.getElementById('cart-count');
    const budgetAlert = document.getElementById('budgetAlert');
    const budgetMessage = document.getElementById('budgetMessage');

    if (!cartList) return;

    cartList.innerHTML = cart.length === 0 ? '<p style="text-align:center; padding:20px;">Basket is empty!</p>' : '';
    total = 0;
    let totalCount = 0;

    cart.forEach((item) => {
        total += item.price * item.qty;
        totalCount += item.qty;
        cartList.innerHTML += `
            <div class="cart-item-row">
                <div>
                    <b>${item.name}</b><br><small>₹${item.price} x ${item.qty}</small>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="changeQty('${item.name}', -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty('${item.name}', 1)">+</button>
                </div>
            </div>`;
    });

    // AI Budget Tracker (₹500 limit)
    if (budgetAlert && budgetMessage) {
        if (total > 500) {
            budgetAlert.style.display = "block";
            budgetMessage.innerHTML = `⚠️ <b>Budget Alert:</b> Total ₹${total} cross ho gaya!`;
        } else {
            budgetAlert.style.display = "none";
        }
    }

    if (totalDisplay) totalDisplay.innerText = total;
    if (countDisplay) countDisplay.innerText = totalCount;
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// --- CHECKOUT & PAYMENT MODAL ---
function openCheckoutModal() {
    if (cart.length === 0) {
        alert("Bhai, cart khali hai!");
        return;
    }
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) paymentModal.style.display = 'block';
}

function closeCheckoutModal() {
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) paymentModal.style.display = 'none';
}

function confirmPaymentAndGenerateBill() {
    const selectedInput = document.querySelector('input[name="payMethod"]:checked');
    const method = selectedInput ? selectedInput.value : "UPI";
    closeCheckoutModal();
    generateBill(method);
}

// --- BILL / RECEIPT GENERATOR ---
function generateBill(paymentMethod) {
    let billHTML = `
        <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 400px; margin: auto; border: 1px solid #ddd; background: #fff; color: #000;">
            <div style="text-align:center;">
                <h1 style="color:#0284c7; margin:0;">🛒 SmartGrocery</h1>
                <p style="font-size:12px; color:#666;">Freshness Delivered Instantly</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
            <p><b>Customer Name:</b> Kishan Arya</p>
            <p><b>Date:</b> ${new Date().toLocaleString()}</p>
            <p><b>Payment Mode:</b> ${paymentMethod}</p>
            <table style="width:100%; text-align:left; margin-top: 15px; border-collapse: collapse;">
                <tr style="border-bottom: 2px solid #ddd;"><th>Item</th><th>Qty</th><th>Price</th></tr>
    `;

    cart.forEach(item => {
        billHTML += `<tr style="border-bottom: 1px solid #eee;"><td>${item.name}</td><td>${item.qty}</td><td>₹${item.price * item.qty}</td></tr>`;
    });

    billHTML += `
            </table>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
            <h3 style="text-align:right; color:#0284c7;">Grand Total: ₹${total}</h3>
            <p style="text-align:center; font-size:12px; color:#555; margin-top: 30px;">Thank you for shopping at SmartGrocery!<br>Developed by Kishan Arya</p>
        </div>
    `;

    const win = window.open('', '', 'height=600,width=450');
    win.document.write(billHTML);
    win.document.close();
    win.print();
}

// --- SEARCH FILTER ---
function filterItems(term) {
    document.querySelectorAll('.item-card').forEach(item => {
        const title = item.querySelector('h3').innerText.toLowerCase();
        item.style.display = title.includes(term) ? 'block' : 'none';
    });
}

const searchInputEl = document.getElementById('searchInput');
if (searchInputEl) {
    searchInputEl.addEventListener('keyup', (e) => filterItems(e.target.value.toLowerCase()));
}

// --- WORKING AI CHATBOT LOGIC (Toggle Fixed) ---
function toggleChatbot() {
    const body = document.getElementById('chatBody');
    const toggleIcon = document.getElementById('chatToggleIcon');
    if (!body) return;

    if (body.style.display === 'flex') {
        body.style.display = 'none';
        if (toggleIcon) toggleIcon.innerText = '▼';
    } else {
        body.style.display = 'flex';
        if (toggleIcon) toggleIcon.innerText = '▲';
    }
}

function handleChatInput(event) {
    if (event.key === 'Enter') {
        const inputField = document.getElementById('chatInput');
        const userText = inputField.value.trim();
        if (!userText) return;

        const chatBody = document.getElementById('chatBody');
        
        // Append user message
        chatBody.innerHTML += `<div class="user-msg">${userText}</div>`;
        inputField.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        // Generate Smart AI Response
        setTimeout(() => {
            let botReply = "Main SmartGrocery AI assistant hoon. Aap mujhse kisi item, recipe, ya health plan ke baare me pooch sakte hain!";
            const lowerText = userText.toLowerCase();

            if (lowerText.includes('hello') || lowerText.includes('hi')) {
                botReply = "Hello Kishan! Bataiye aaj kya kharida jaye?";
            } else if (lowerText.includes('weight loss') || lowerText.includes('diet')) {
                botReply = "Weight loss ke liye aap hamare AI Recommender section ka use karke Fresh Vegetables aur Fruits order kar sakte hain!";
            } else if (lowerText.includes('payment') || lowerText.includes('pay')) {
                botReply = "Hum UPI (GPay/PhonePe) aur Cash on Delivery (COD) dono accept karte hain!";
            } else if (lowerText.includes('vegetable') || lowerText.includes('fruit')) {
                botReply = "Hamare paas bilkul fresh Potatoes, Tomatoes, Apples aur baaki sabhi items available hain!";
            } else if (lowerText.includes('contact') || lowerText.includes('developer')) {
                botReply = "Yeh website Kishan Arya ne develop ki hai. Aap footer se social links par connect kar sakte hain!";
            }

            chatBody.innerHTML += `<div class="bot-msg">${botReply}</div>`;
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 500);
    }
}

// --- FEEDBACK SUBMISSION ---
function submitFeedback() {
    const feedbackInput = document.getElementById('userFeedback');
    if (!feedbackInput || feedbackInput.value.trim() === "") {
        alert("Pehle kuch advice ya feedback toh likho bhai!");
        return;
    }
    alert("Thank you! Aapka feedback/advice successfully receive ho gaya hai.");
    feedbackInput.value = "";
}

// Close Modal on Outside Click
window.onclick = (event) => { 
    const aiModal = document.getElementById("aiModal");
    const paymentModal = document.getElementById("paymentModal");
    if (event.target == aiModal) closeModal();
    if (event.target == paymentModal) closeCheckoutModal();
};