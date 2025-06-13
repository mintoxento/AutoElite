const Cart = {
  data() {
    return {
      cartItems: [],      // Array of car IDs for the current user's cart.
      cars: [],           // All car details loaded from cars.json.
      selectedCars: [],   // Array of selected car IDs.
      isPurchasing: false // Loading state for purchase button
    };
  },
  computed: {
    // Map each car ID from cartItems to its corresponding car info object from the cars array.
    cartCars() {
      return this.cartItems
        .map(cartId =>
          this.cars.find(car => parseInt(car.id) === parseInt(cartId))
        )
        .filter(car => car !== undefined);
    },
    selectAllLabel() {
      return this.selectedCars.length === this.cartCars.length
        ? "Deselect All"
        : "Select All";
    },
    // Calculate subtotal for selected cars (assuming car.price is numeric).
    totalSelectedPrice() {
      return this.cartCars
        .filter(car => this.selectedCars.includes(car.id))
        .reduce((sum, car) => sum + (parseFloat(car.price) || 0), 0);
    },
    // Delivery fee is fixed at RM200 if there is any selected car.
    deliveryFee() {
      return this.selectedCars.length > 0 ? 200 : 0;
    },
    // Final total is subtotal plus delivery fee.
    finalTotal() {
      return (this.totalSelectedPrice + this.deliveryFee).toFixed(2);
    }
  },
  methods: {
    // Retrieve cart items for the current user from the API.
    fetchCart() {
      const currentUserData = sessionStorage.getItem("currentUser");
      if (!currentUserData) {
        console.error("No user logged in.");
        return;
      }
      const user = JSON.parse(currentUserData);
      if (!user.id) {
        console.error("User information is invalid.");
        return;
      }
      fetch(`resources/api_cart.php?action=get&user_id=${user.id}`, {
        credentials: "include"
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Assume data.data is an array of objects with a 'car_id' property.
            this.cartItems = data.data.map(item => item.car_id);
          } else {
            console.error("Error fetching cart items:", data.message);
          }
        })
        .catch(error => console.error("Error fetching cart items:", error));
    },
    // Retrieve the full list of car details from cars.json.
    fetchCars() {
      fetch("resources/data/cars.json")
        .then(response => response.json())
        .then(data => {
          this.cars = data;
        })
        .catch(error => console.error("Error fetching cars:", error));
    },
    toggleSelectAll() {
      if (this.selectedCars.length === this.cartCars.length) {
        this.selectedCars = [];
      } else {
        this.selectedCars = this.cartCars.map(car => car.id);
      }
    },
    async purchaseSelected() {
      if (this.selectedCars.length === 0) {
        this.showNotification("Please select cars to purchase.", "error");
        return;
      }
      
      const currentUserData = sessionStorage.getItem("currentUser");
      if (!currentUserData) {
        this.showNotification("You must be logged in to make a purchase.", "error");
        return;
      }
      
      const user = JSON.parse(currentUserData);
      if (!user.id) {
        this.showNotification("User information is invalid.", "error");
        return;
      }
      
      // Get selected car objects from the cart.
      const selectedCarObjects = this.cartCars.filter(car => this.selectedCars.includes(car.id));
      if (selectedCarObjects.length === 0) {
        this.showNotification("Selected cars not found.", "error");
        return;
      }
      
      // Build an array of car names (or fallback to location if name is missing).
      const carNames = selectedCarObjects.map(car => car.name || car.location);
      
      // Calculate the total amount from selected cars.
      const totalAmount = selectedCarObjects.reduce((sum, car) => {
        return sum + (parseFloat(car.price) || 0);
      }, 0).toFixed(2);
      
      // Final amount includes a fixed RM200 delivery fee.
      const finalAmount = (parseFloat(totalAmount) + 200).toFixed(2);
      
      this.isPurchasing = true;
      
      try {
        const formData = new FormData();
        formData.append('cars', JSON.stringify(carNames));
        formData.append('amount', finalAmount);
        formData.append('user_id', user.id);
        
        const response = await fetch(`resources/api_purchase.php?action=add`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (!result.success) {
          this.showNotification("Purchase failed: " + result.message, "error");
        } else {
          this.showNotification("Purchase successful for selected cars!", "success");
          // Remove purchased cars from cart items and clear selection.
          this.cartItems = this.cartItems.filter(id => !this.selectedCars.includes(parseInt(id)));
          this.selectedCars = [];
        }
      } catch (error) {
        console.error("Error during purchase:", error);
        this.showNotification("Error purchasing selected cars: " + error.message, "error");
      } finally {
        this.isPurchasing = false;
      }
    },
    // Remove an individual car from the cart.
    async removeCar(carId) {
      if (!confirm("Are you sure you want to remove this car from your cart?")) return;
      
      const currentUserData = sessionStorage.getItem("currentUser");
      if (!currentUserData) {
        this.showNotification("You must be logged in to remove a car.", "error");
        return;
      }
      const user = JSON.parse(currentUserData);
      if (!user.id) {
        this.showNotification("User information is invalid.", "error");
        return;
      }
      
      const formData = new FormData();
      formData.append('car_id', carId);
      formData.append('user_id', user.id);
      
      try {
        const response = await fetch(`resources/api_cart.php?action=remove`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        const result = await response.json();
        if (result.success) {
          this.showNotification("Car removed from cart successfully!", "success");
          // Update local state.
          this.cartItems = this.cartItems.filter(id => parseInt(id) !== parseInt(carId));
          this.selectedCars = this.selectedCars.filter(id => parseInt(id) !== parseInt(carId));
        } else {
          this.showNotification("Failed to remove car: " + result.message, "error");
        }
      } catch (error) {
        console.error("Error removing car:", error);
        this.showNotification("Error removing car: " + error.message, "error");
      }
    },
    showNotification(message, type) {
      const notification = document.createElement('div');
      notification.className = `cart-notification cart-notification-${type} show`;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  },
  created() {
    this.fetchCart();
    this.fetchCars();
  },
  mounted() {
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = `
      .cart-component {
        margin-top: -13px;
        min-height: 100vh;
        background: #1a1a2e;
        position: relative;
        overflow-x: hidden;
      }
      .cart-component::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 30%, rgba(0,123,255,0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(0,123,255,0.08) 0%, transparent 50%);
        pointer-events: none;
      }
      .cart-component .cart-container {
        position: relative;
        z-index: 1;
        animation: cartFadeInUp 0.8s ease-out;
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
      }
      /* Header Styles - matching purchase component */
      .cart-component .cart-header {
        text-align: center;
        margin-bottom: 3rem;
        padding: 2rem 0;
        opacity: 0;
        transform: translateY(30px);
        animation: cartHeaderAnimateIn 0.8s ease-out 0.2s both;
      }
      .cart-component .cart-header h2 {
        color: #f8f9fa;
        font-weight: 700;
        font-size: 3rem;
        margin-bottom: 0.5rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
      }
      .cart-component .cart-header .subtitle {
        color: #ced4da;
        font-size: 1.2rem;
        font-weight: 400;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
      }
      .cart-component .cart-header::after {
        content: '';
        width: 80px;
        height: 4px;
        background: #007bff;
        margin: 1rem auto 0;
        display: block;
        border-radius: 2px;
      }
      /* Loading State */
      .cart-component .cart-loading {
        text-align: center;
        padding: 4rem 2rem;
        opacity: 0;
        transform: translateY(30px);
        animation: cartLoadingAnimateIn 0.6s ease-out 0.6s both;
        color: #f8f9fa;
      }
      .cart-component .spinner-border {
        color: #007bff;
        width: 3rem;
        height: 3rem;
        border-width: 0.3em;
      }
      .cart-component .cart-loading p {
        color: #ced4da;
        font-size: 1.1rem;
        margin-top: 1rem;
        font-weight: 500;
      }
      /* Empty State */
      .cart-component .cart-empty {
        text-align: center;
        padding: 4rem 2rem;
        opacity: 0;
        transform: translateY(30px);
        animation: cartEmptyStateAnimateIn 0.8s ease-out 0.6s both;
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      }
      .cart-component .cart-empty div {
        font-size: 4rem;
        color: #495057;
        margin-bottom: 1.5rem;
        opacity: 0.7;
      }
      .cart-component .cart-empty h3 {
        color: #f8f9fa;
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }
      .cart-component .cart-empty p {
        color: #ced4da;
        font-size: 1.1rem;
        max-width: 400px;
        margin: 0 auto;
      }
      /* Cart Controls */
      .cart-component .cart-controls {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 15px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        opacity: 0;
        transform: translateY(30px);
        animation: cartControlsAnimateIn 0.8s ease-out 0.4s both;
        transition: all 0.3s ease;
      }
      .cart-component .cart-controls:hover {
        background: rgba(255,255,255,0.08);
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
      .cart-component .cart-controls > div {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .cart-component .cart-controls button {
        border: none;
        border-radius: 10px;
        padding: 0.875rem 1.75rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        position: relative;
        overflow: hidden;
      }
      .cart-component .cart-controls button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .cart-component .cart-btn-secondary {
        background: rgba(108, 117, 125, 0.8);
        color: white;
        border: 1px solid rgba(108, 117, 125, 0.4);
      }
      .cart-component .cart-btn-secondary:hover:not(:disabled) {
        background: rgba(90, 98, 104, 0.9);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      }
      .cart-component .cart-btn-primary {
        background: rgba(0, 123, 255, 0.8);
        color: white;
        border: 1px solid rgba(0, 123, 255, 0.4);
      }
      .cart-component .cart-btn-primary:hover:not(:disabled) {
        background: rgba(0, 86, 179, 0.9);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 123, 255, 0.4);
      }
      /* Table Container */
      .cart-component .table-responsive {
        background: rgba(33, 37, 41, 0.6);
        backdrop-filter: blur(15px);
        border-radius: 15px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.1);
        margin-bottom: 2rem;
        opacity: 0;
        transform: translateY(30px);
        animation: cartTableAnimateIn 0.8s ease-out 0.6s both;
      }
      /* Table Styles */
      .cart-component .table {
        margin-bottom: 0;
        color: #f8f9fa;
        background: transparent;
        width: 100%;
      }
      .cart-component .table thead th {
        background: rgba(52, 58, 64, 0.8);
        backdrop-filter: blur(10px);
        border: none;
        color: #f8f9fa;
        font-weight: 700;
        font-size: 1rem;
        padding: 1.25rem 1.5rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        position: relative;
      }
      .cart-component .table thead th:first-child {
        border-top-left-radius: 15px;
      }
      .cart-component .table thead th:last-child {
        border-top-right-radius: 15px;
      }
      .cart-component .table tbody tr {
        border: none;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(20px);
        animation: cartRowAnimateIn 0.6s ease-out both;
      }
      /* Staggered animation for table rows */
      .cart-component .table tbody tr:nth-child(1) { animation-delay: 0.8s; }
      .cart-component .table tbody tr:nth-child(2) { animation-delay: 0.9s; }
      .cart-component .table tbody tr:nth-child(3) { animation-delay: 1.0s; }
      .cart-component .table tbody tr:nth-child(4) { animation-delay: 1.1s; }
      .cart-component .table tbody tr:nth-child(5) { animation-delay: 1.2s; }
      .cart-component .table tbody tr:nth-child(6) { animation-delay: 1.3s; }
      .cart-component .table tbody tr:nth-child(n+7) { animation-delay: 1.4s; }
      .cart-component .table tbody tr:hover {
        background: rgba(255,255,255,0.05);
        transform: translateX(5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }
      .cart-component .table tbody tr.selected {
        background: rgba(0,123,255,0.1);
        border-left: 4px solid #007bff;
      }
      .cart-component .table tbody tr.selected:hover {
        background: rgba(0,123,255,0.15);
      }
      .cart-component .table tbody td {
        border: none;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        vertical-align: middle;
        font-weight: 500;
      }
      .cart-component .table tbody tr:last-child td {
        border-bottom: none;
      }
      /* Image Styles */
      .cart-component .table img {
        width: 80px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
        border: 2px solid rgba(255,255,255,0.1);
        transition: all 0.3s ease;
      }
      .cart-component .table img:hover {
        transform: scale(1.1);
        border-color: #007bff;
        box-shadow: 0 4px 12px rgba(0,123,255,0.3);
      }
      /* Checkbox Styles */
      .cart-component input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #007bff;
        cursor: pointer;
      }
      /* Action Button Styles */
      .cart-component .btn {
        border: none;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
      }
      .cart-component .btn-sm {
        font-size: 0.875rem;
        padding: 0.375rem 0.75rem;
      }
      .cart-component .btn-danger {
        background: rgba(220, 53, 69, 0.8);
        color: white;
        border: 1px solid rgba(220, 53, 69, 0.4);
      }
      .cart-component .btn-danger:hover {
        background: rgba(200, 35, 51, 0.9);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
      }
      /* Cart Total Styles */
      .cart-component .cart-total {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 15px;
        padding: 2rem;
        text-align: right;
        font-size: 1.2rem;
        color: #f8f9fa;
        opacity: 0;
        transform: translateY(30px);
        animation: cartTotalAnimateIn 0.8s ease-out 0.8s both;
        transition: all 0.3s ease;
      }
      .cart-component .cart-total:hover {
        background: rgba(255,255,255,0.08);
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
      .cart-component .cart-total > div {
        margin-bottom: 0.75rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      .cart-component .cart-total > div:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }
      .cart-component .cart-total .total {
        font-weight: 700;
        font-size: 1.5rem;
        color: #007bff;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      }
      /* Notification Styles - matching purchase component */
      .cart-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: #fff;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 9999;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
        max-width: 350px;
      }
      .cart-notification.show {
        opacity: 1;
      }
      .cart-notification-success {
        background: rgba(40, 167, 69, 0.9);
        border-left: 4px solid #28a745;
      }
      .cart-notification-error {
        background: rgba(220, 53, 69, 0.9);
        border-left: 4px solid #dc3545;
      }
      .cart-notification-info {
        background: rgba(13, 202, 240, 0.9);
        border-left: 4px solid #0dcaf0;
      }
      /* Keyframe Animations */
      @keyframes cartFadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes cartHeaderAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes cartLoadingAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes cartEmptyStateAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes cartControlsAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes cartTableAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes cartRowAnimateIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes cartTotalAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      /* Responsive Design */
      @media (max-width: 768px) {
        .cart-component .cart-header h2 {
          font-size: 2.5rem !important;
        }
        .cart-component .cart-header .subtitle {
          font-size: 1.1rem !important;
        }
        .cart-component .cart-container {
          padding: 1.5rem;
        }
        .cart-component .cart-controls {
          padding: 1rem;
          border-radius: 12px;
          flex-direction: column;
          gap: 1rem;
        }
        .cart-component .cart-controls > div {
          width: 100%;
          justify-content: center;
        }
        .cart-component .table-responsive {
          border-radius: 10px;
        }
        .cart-component .table thead th,
        .cart-component .table tbody td {
          padding: 1rem;
          font-size: 0.9rem;
        }
        .cart-component .table thead th:first-child,
        .cart-component .table thead th:last-child {
          border-radius: 10px;
        }
        .cart-component .table img {
          width: 60px;
          height: 45px;
        }
        .cart-component .cart-total {
          padding: 1.5rem;
          font-size: 1.1rem;
        }
        .cart-component .cart-total .total {
          font-size: 1.3rem;
        }
      }
      @media (max-width: 576px) {
        .cart-component .cart-container {
          padding: 1rem;
        }
        .cart-component .cart-controls {
          padding: 0.75rem;
        }
        .cart-component .cart-controls button {
          padding: 0.75rem 1.25rem;
          font-size: 0.9rem;
        }
        .cart-component .table-responsive {
          overflow-x: auto;
        }
        .cart-component .table {
          min-width: 800px;
        }
        .cart-component .cart-empty {
          padding: 2rem 1rem;
        }
        .cart-component .cart-empty div {
          font-size: 3rem;
        }
        .cart-component .cart-empty h3 {
          font-size: 1.3rem;
        }
        .cart-component .cart-total {
          padding: 1rem;
          font-size: 1rem;
        }
        .cart-component .cart-total .total {
          font-size: 1.2rem;
        }
      }
    `;
    document.head.appendChild(this.styleElement);
  },
  beforeUnmount() {
    if (this.styleElement) {
      this.styleElement.remove();
    }
  },
  template: `
    <div class="cart-component">
      <div class="cart-container">
        <!-- Header Section -->
        <div class="cart-header">
          <h2>Shopping Cart</h2>
          <p class="subtitle">Review and manage your selected vehicles</p>
        </div>
        
        <!-- Loading State -->
        <div v-if="cars.length === 0" class="cart-loading">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p>Loading your cart...</p>
        </div>
        
        <!-- Empty Cart State -->
        <div v-else-if="cartCars.length === 0" class="cart-empty text-center">
          <div style="font-size: 3rem; opacity: 0.5;">🛒</div>
          <h3>Your Cart is Empty</h3>
          <p>Browse our collection and add some cars to your cart!</p>
        </div>
        
        <!-- Cart with Items -->
        <div v-else>
          <!-- Cart Controls -->
          <div class="cart-controls">
            <div>
              <button class="cart-btn-secondary" @click="toggleSelectAll">
                {{ selectAllLabel }}
              </button>
              <button class="cart-btn-primary" 
                      @click="purchaseSelected" 
                      :disabled="selectedCars.length === 0 || isPurchasing">
                <span v-if="isPurchasing">
                  Processing...
                </span>
                <span v-else>
                  🛍️ Purchase Selected ({{ selectedCars.length }})
                </span>
              </button>
            </div>
          </div>
          
          <!-- Cart Items Table -->
          <div class="table-responsive">
            <table class="table table-striped table-dark">
              <thead>
                <tr>
                  <th scope="col">
                    <input type="checkbox" @change="toggleSelectAll" :checked="selectedCars.length === cartCars.length"/>
                  </th>
                  <th scope="col">Image</th>
                  <th scope="col">Car</th>
                  <th scope="col">Description</th>
                  <th scope="col">Year</th>
                  <th scope="col">Price</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="car in cartCars" :key="car.id" :class="{ selected: selectedCars.includes(car.id) }">
                  <td>
                    <input type="checkbox" :value="car.id" v-model="selectedCars"/>
                  </td>
                  <td>
                    <img :src="car.image || 'https://via.placeholder.com/80x60?text=No+Image'" 
                         :alt="car.name || car.location">
                  </td>
                  <td>{{ car.name || car.location }}</td>
                  <td>{{ car.description || 'Premium vehicle with exceptional features' }}</td>
                  <td>{{ car.year || 'N/A' }}</td>
                  <td>{{ car.priceFormatted || 'Contact for Price' }}</td>
                  <td>
                    <button class="btn btn-sm btn-danger" 
                            @click="removeCar(car.id)"
                            title="Remove from cart">
                      ✕
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Summary Section -->
          <div class="cart-total" v-if="selectedCars.length > 0">
            <div>Subtotal: RM {{ totalSelectedPrice.toFixed(2) }}</div>
            <div>Delivery Fee: RM {{ deliveryFee.toFixed(2) }}</div>
            <div class="total">Total: RM {{ finalTotal }}</div>
          </div>
        </div>
      </div>
    </div>
  `
};