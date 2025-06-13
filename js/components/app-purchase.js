const Purchase = {
  data() {
    return {
      purchases: [],
      loading: false,
      error: '',
      styleElement: null
    };
  },
  methods: {
    // Fetch the current user's purchases with JSON data for cars.
    fetchPurchases() {
      const currentUserData = sessionStorage.getItem("currentUser");
      if (!currentUserData) {
        this.error = "You must be logged in to view your purchases.";
        return;
      }
      const user = JSON.parse(currentUserData);
      if (!user.id) {
        this.error = "User information is invalid.";
        return;
      }
      this.loading = true;
      fetch(`resources/api_purchase.php?action=get&user_id=${user.id}`, {
        credentials: "include"
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            this.purchases = data.data;
          } else {
            this.error = data.message || "Failed to fetch purchases.";
          }
        })
        .catch(error => {
          console.error("Error fetching purchases:", error);
          this.error = error.message;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    
    // Update purchase status using the API update action.
    updatePurchaseStatus(purchaseId, newStatus) {
      const formData = new FormData();
      formData.append('purchase_id', purchaseId);
      formData.append('status', newStatus);
      fetch(`resources/api_purchase.php?action=update`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            this.showNotification(data.message, "success");
            const purchase = this.purchases.find(p => parseInt(p.id) === parseInt(purchaseId));
            if (purchase) {
              purchase.status = newStatus;
            }
          } else {
            this.showNotification(data.message, "error");
          }
        })
        .catch(error => {
          console.error(error);
          this.showNotification("Error updating purchase status", "error");
        });
    },

    removePurchase(purchaseId) {
      const formData = new FormData();
      formData.append('purchase_id', purchaseId);
      fetch(`resources/api_purchase.php?action=delete`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            this.showNotification(data.message, "success");
            // Remove purchase from the list
            this.purchases = this.purchases.filter(p => parseInt(p.id) !== parseInt(purchaseId));
          } else {
            this.showNotification(data.message, "error");
          }
        })
        .catch(error => {
          console.error(error);
          this.showNotification("Error removing purchase", "error");
        });
    },
    
    showNotification(message, type) {
      const notification = document.createElement('div');
      notification.className = `purchase-notification purchase-notification-${type} show`;
      notification.textContent = message;
      document.body.insertBefore(notification, document.body.firstChild);
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    },
    
    getStatusBadgeClass(status) {
      switch (status?.toLowerCase()) {
        case 'completed':
        case 'delivered':
          return 'status-success';
        case 'pending':
        case 'processing':
          return 'status-warning';
        case 'cancelled':
        case 'failed':
          return 'status-danger';
        default:
          return 'status-info';
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (e) {
        return dateString;
      }
    }
  },
  
  created() {
    // Only fetch purchases since car names are now part of the JSON data.
    this.fetchPurchases();
  },
  
  mounted() {
    this.styleElement = document.createElement('style');
    this.styleElement.setAttribute('data-component', 'purchase');
    this.styleElement.textContent = `
      .purchase-component {
        margin-top: -13px;
        min-height: 100vh;
        background: #1a1a2e;
        position: relative;
        overflow-x: hidden;
      }
      .purchase-component::before {
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
      .purchase-component .container {
        position: relative;
        z-index: 1;
        animation: purchaseFadeInUp 0.8s ease-out;
        max-width: 1400px;
      }
      /* Header Styles */
      .purchase-component .purchase-header {
        text-align: center;
        margin-bottom: 3rem;
        padding: 2rem 0;
        opacity: 0;
        transform: translateY(30px);
        animation: purchaseHeaderAnimateIn 0.8s ease-out 0.2s both;
      }
      .purchase-component .purchase-header h1 {
        color: #f8f9fa;
        font-weight: 700;
        font-size: 3rem;
        margin-bottom: 0.5rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
      }
      .purchase-component .purchase-header .subtitle {
        color: #ced4da;
        font-size: 1.2rem;
        font-weight: 400;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
      }
      .purchase-component .purchase-header::after {
        content: '';
        width: 80px;
        height: 4px;
        background: #007bff;
        margin: 1rem auto 0;
        display: block;
        border-radius: 2px;
      }
      /* Main Purchase Content */
      .purchase-component .purchase-main {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        overflow: hidden;
        opacity: 0;
        transform: translateY(50px);
        animation: purchaseMainSlideUp 0.8s ease-out 0.4s both;
        transition: all 0.3s ease;
        color: #f8f9fa;
        padding: 2.5rem;
      }
      .purchase-component .purchase-main:hover {
        transform: translateY(-5px);
        box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        background: rgba(255,255,255,0.08);
      }
      /* Loading State */
      .purchase-component .loading-container {
        text-align: center;
        padding: 4rem 2rem;
        opacity: 0;
        transform: translateY(30px);
        animation: purchaseLoadingAnimateIn 0.6s ease-out 0.6s both;
      }
      .purchase-component .spinner-border {
        color: #007bff;
        width: 3rem;
        height: 3rem;
        border-width: 0.3em;
      }
      .purchase-component .loading-text {
        color: #ced4da;
        font-size: 1.1rem;
        margin-top: 1rem;
        font-weight: 500;
      }
      /* Alert Styles */
      .purchase-component .alert {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 15px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        opacity: 0;
        transform: translateY(20px);
        animation: purchaseAlertAnimateIn 0.6s ease-out 0.5s both;
      }
      .purchase-component .alert-danger {
        background: rgba(220, 53, 69, 0.1);
        border-color: rgba(220, 53, 69, 0.3);
        color: #f8d7da;
      }
      .purchase-component .alert-info {
        background: rgba(13, 202, 240, 0.1);
        border-color: rgba(13, 202, 240, 0.3);
        color: #b3ecf7;
      }
      /* Empty State */
      .purchase-component .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        opacity: 0;
        transform: translateY(30px);
        animation: purchaseEmptyStateAnimateIn 0.8s ease-out 0.6s both;
      }
      .purchase-component .empty-state-icon {
        font-size: 4rem;
        color: #495057;
        margin-bottom: 1.5rem;
        opacity: 0.7;
      }
      .purchase-component .empty-state-title {
        color: #f8f9fa;
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }
      .purchase-component .empty-state-text {
        color: #ced4da;
        font-size: 1.1rem;
        max-width: 400px;
        margin: 0 auto;
      }
      /* Table Styles */
      .purchase-component .table-container {
        background: rgba(33, 37, 41, 0.6);
        backdrop-filter: blur(15px);
        border-radius: 15px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.1);
        opacity: 0;
        transform: translateY(30px);
        animation: purchaseTableAnimateIn 0.8s ease-out 0.6s both;
      }
      .purchase-component .table {
        margin-bottom: 0;
        color: #f8f9fa;
        background: transparent;
        width: 100%;
        min-width: 1000px;
      }
      .purchase-component .table thead th {
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
      .purchase-component .table thead th:first-child {
        border-top-left-radius: 15px;
      }
      .purchase-component .table thead th:last-child {
        border-top-right-radius: 15px;
      }
      .purchase-component .table tbody tr {
        border: none;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(20px);
        animation: purchaseRowAnimateIn 0.6s ease-out both;
      }
      /* Staggered animation for table rows */
      .purchase-component .table tbody tr:nth-child(1) { animation-delay: 0.8s; }
      .purchase-component .table tbody tr:nth-child(2) { animation-delay: 0.9s; }
      .purchase-component .table tbody tr:nth-child(3) { animation-delay: 1.0s; }
      .purchase-component .table tbody tr:nth-child(4) { animation-delay: 1.1s; }
      .purchase-component .table tbody tr:nth-child(5) { animation-delay: 1.2s; }
      .purchase-component .table tbody tr:nth-child(6) { animation-delay: 1.3s; }
      .purchase-component .table tbody tr:nth-child(n+7) { animation-delay: 1.4s; }
      .purchase-component .table tbody tr:hover {
        background: rgba(255,255,255,0.05);
        transform: translateX(5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }
      .purchase-component .table tbody td {
        border: none;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        vertical-align: middle;
        font-weight: 500;
      }
      .purchase-component .table tbody tr:last-child td {
        border-bottom: none;
      }
      /* Status Badge Styles */
      .purchase-component .status-badge {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        backdrop-filter: blur(10px);
        border: 1px solid;
        transition: all 0.3s ease;
      }
      .purchase-component .status-success {
        background: rgba(40, 167, 69, 0.2);
        border-color: rgba(40, 167, 69, 0.4);
        color: green;
      }
      .purchase-component .status-warning {
        background: rgba(255, 193, 7, 0.2);
        border-color: rgba(255, 193, 7, 0.4);
        color: red;
      }
      .purchase-component .status-danger {
        background: rgba(220, 53, 69, 0.2);
        border-color: rgba(220, 53, 69, 0.4);
        color: red;
      }
      .purchase-component .status-info {
        background: rgba(13, 202, 240, 0.2);
        border-color: rgba(13, 202, 240, 0.4);
        color: black;
      }
      .purchase-component .status-badge:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      /* Purchase ID Styling */
      .purchase-component .purchase-id {
        font-family: 'Courier New', monospace;
        font-weight: 700;
        color: #007bff;
        background: rgba(0, 123, 255, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        display: inline-block;
        font-size: 0.9rem;
      }
      /* Car Name Styling: Display the JSON array of car names. */
      .purchase-component .car-name {
        font-weight: 600;
      }
      /* Date Styling */
      .purchase-component .purchase-date {
        color: black;
        font-weight: 500;
      }
      /* Notification Styles */
      .purchase-notification {
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
      }
      .purchase-notification.show {
        opacity: 1;
      }
      .purchase-notification-success {
        background: rgba(40, 167, 69, 0.9);
        border-left: 4px solid #28a745;
      }
      .purchase-notification-error {
        background: rgba(220, 53, 69, 0.9);
        border-left: 4px solid #dc3545;
      }
      .purchase-notification-info {
        background: rgba(13, 202, 240, 0.9);
        border-left: 4px solid #0dcaf0;
      }
      /* Keyframe Animations */
      @keyframes purchaseFadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes purchaseHeaderAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes purchaseMainSlideUp {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes purchaseLoadingAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes purchaseAlertAnimateIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes purchaseEmptyStateAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes purchaseTableAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes purchaseRowAnimateIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @media (max-width: 768px) {
        .purchase-component .purchase-header h1 {
          font-size: 2.5rem !important;
        }
        .purchase-component .purchase-header .subtitle {
          font-size: 1.1rem !important;
        }
        .purchase-component .purchase-main {
          padding: 1.5rem;
          border-radius: 15px;
        }
        .purchase-component .table-container {
          border-radius: 10px;
        }
        .purchase-component .table thead th,
        .purchase-component .table tbody td {
          padding: 1rem;
          font-size: 0.9rem;
        }
        .purchase-component .table thead th:first-child,
        .purchase-component .table thead th:last-child {
          border-radius: 10px;
        }
        .purchase-component .status-badge {
          font-size: 0.75rem;
          padding: 0.4rem 0.8rem;
        }
        .purchase-component .purchase-id {
          font-size: 0.8rem;
        }
      }
      @media (max-width: 576px) {
        .purchase-component .container {
          padding: 0 1rem;
        }
        .purchase-component .purchase-main {
          padding: 1rem;
        }
        .purchase-component .table-container {
          overflow-x: auto;
        }
        .purchase-component .table {
          min-width: 600px;
        }
        .purchase-component .empty-state {
          padding: 2rem 1rem;
        }
        .purchase-component .empty-state-icon {
          font-size: 3rem;
        }
        .purchase-component .empty-state-title {
          font-size: 1.3rem;
        }
      }
    `;
    document.head.appendChild(this.styleElement);
  },
  beforeUnmount() {
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }
  },
  template: `
    <main class="purchase-component">
      <div class="container py-5">
        <!-- Header Section -->
        <header class="purchase-header">
          <h1>Your Purchases</h1>
          <p class="subtitle">Track and manage your car purchases</p>
        </header>
        
        <!-- Main Purchase Content -->
        <div class="purchase-main">
          <!-- Loading State -->
          <div v-if="loading" class="loading-container">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div class="loading-text">Loading your purchase history...</div>
          </div>
          
          <!-- Error State -->
          <div v-else-if="error" class="alert alert-danger" role="alert">
            <i class="mdi mdi-alert-outline me-1"></i>
            {{ error }}
          </div>
          
          <!-- Empty State -->
          <div v-else-if="purchases.length === 0" class="empty-state">
            <div class="empty-state-icon">
              <i class="mdi mdi-cart-outline"></i>
            </div>
            <h3 class="empty-state-title">No Purchases Yet</h3>
            <p class="empty-state-text">
              You haven't made any car purchases yet. Start browsing our amazing collection of vehicles!
            </p>
          </div>
          
          <!-- Purchases Table -->
          <div v-else class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">
                    <i class="mdi mdi-pound me-1"></i>
                    Purchase ID
                  </th>
                  <th scope="col">
                    <i class="mdi mdi-car me-1"></i>
                    Car
                  </th>
                  <th scope="col">
                    <i class="mdi mdi-calendar-month me-1"></i>
                    Date
                  </th>
                  <th scope="col">
                    <i class="mdi mdi-cash me-1"></i>
                    Amount
                  </th>
                  <th scope="col">
                    <i class="mdi mdi-information-outline me-1"></i>
                    Status
                  </th>
                  <th scope="col">
                    <i class="mdi mdi-tools me-1"></i>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="purchase in purchases" :key="purchase.id">
                  <td>
                    <span class="purchase-id">#{{ purchase.id }}</span>
                  </td>
                  <td>
                    <span class="car-name">
                      {{ Array.isArray(purchase.cars) ? purchase.cars.join(', ') : purchase.cars }}
                    </span>
                  </td>
                  <td>
                    <span class="purchase-date">{{ formatDate(purchase.purchase_date) }}</span>
                  </td>
                  <td>
                    <span class="purchase-amount">RM {{ purchase.amount }}</span>
                  </td>
                  <td>
                    <span class="status-badge" :class="getStatusBadgeClass(purchase.status)">
                      {{ purchase.status || 'Pending' }}
                    </span>
                  </td>
                  <td>
                    <template v-if="purchase.status !== 'completed' && purchase.status !== 'cancelled'">
                      <button class="btn btn-success btn-sm me-1" 
                        @click="updatePurchaseStatus(purchase.id, 'completed')">
                        Purchase
                      </button>
                      <button class="btn btn-danger btn-sm" 
                        @click="updatePurchaseStatus(purchase.id, 'cancelled')">
                        Cancel
                      </button>
                    </template>
                    <template v-else>
                      <button class="btn btn-danger btn-sm" 
                        @click="removePurchase(purchase.id)">
                        Remove
                      </button>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  `
};