const Models = {
  data() {
    return {
      cars: [],
      currentPage: 1,
      perPage: 6,
      filterAttribute: 'All', // Options: All, Make, Year, Category
      filterValue: '',        // Selected value for the chosen attribute
      filterPrice: '',        // Options: "", under30, 30to50, above50
      searchQuery: ''
    };
  },
  components: {
    paginate: VuejsPaginateNext
  },
  computed: {
    attributeOptions() {
      if (this.filterAttribute === 'Make') {
        const makes = this.cars.map(car => car.make);
        return Array.from(new Set(makes));
      } else if (this.filterAttribute === 'Year') {
        const years = this.cars.map(car => car.year);
        return Array.from(new Set(years)).sort();
      } else if (this.filterAttribute === 'Category') {
        const cats = this.cars.map(car => car.category);
        return Array.from(new Set(cats));
      } else {
        return [];
      }
    },
    filteredCars() {
      return this.cars.filter(car => {
        let matches = true;
        // Filter by attribute if not 'All'
        if (this.filterAttribute !== 'All' && this.filterValue) {
          if (this.filterAttribute === 'Year') {
            if (String(car.year) !== String(this.filterValue)) matches = false;
          } else {
            if (car[this.filterAttribute.toLowerCase()] !== this.filterValue) matches = false;
          }
        }
        // Filter by price range
        if (this.filterPrice) {
          if (this.filterPrice === 'under30' && car.price >= 30000) matches = false;
          if (this.filterPrice === '30to50' && (car.price < 30000 || car.price > 50000)) matches = false;
          if (this.filterPrice === 'above50' && car.price <= 50000) matches = false;
        }
        // Filter by search query on car name
        if (this.searchQuery) {
          if (!car.name.toLowerCase().includes(this.searchQuery.toLowerCase())) matches = false;
        }
        return matches;
      });
    },
    paginatedCars() {
      let current = this.currentPage * this.perPage;
      let start = current - this.perPage;
      return this.filteredCars.slice(start, current);
    },
    pageCount() {
      return Math.ceil(this.filteredCars.length / this.perPage);
    }
  },
  methods: {
    fetchCars() {
      fetch('resources/data/cars.json')
        .then(response => response.json())
        .then(data => {
          this.cars = data;
        })
        .catch(error => console.error('Error fetching cars:', error));
    },
    clickCallback(pageNum) {
      this.currentPage = Number(pageNum);
    },
    addToCart(car) {
      if (!car.id) {
        console.error("Car ID is missing.");
        return;
      }
      // Retrieve current user data from sessionStorage
      const currentUserData = sessionStorage.getItem("currentUser");
      if (!currentUserData) {
        alert("You must be logged in to add a car to the cart.");
        return;
      }
      const user = JSON.parse(currentUserData);
      if (!user.id) {
        alert("User information is invalid.");
        return;
      }
      
      const formData = new FormData();
      formData.append('car_id', car.id);
      formData.append('user_id', user.id);
      
      fetch('resources/api_cart.php?action=add', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert("Car added to cart successfully!");
        } else {
          console.error("Failed to add car to cart:", data.message);
        }
      })
      .catch(error => console.error("Error adding car to cart:", error));
    },
    viewDetails(car) {
      // Create modal element with car details in 2 columns
      const modalDiv = document.createElement('div');
      modalDiv.classList.add('modal', 'fade', 'models-modal');
      modalDiv.tabIndex = -1;
      modalDiv.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content models-modal-content">
            <div class="modal-header models-modal-header">
              <h5 class="modal-title">${car.name || car.location}</h5>
              <button type="button" class="btn-close models-btn-close" data-bs-dismiss="modal" aria-label="Close">&times;</button>
            </div>
            <div class="modal-body models-modal-body">
              <div class="row">
                <div class="col-md-6">
                  <p><strong>ID:</strong> ${car.id || 'N/A'}</p>
                  <p><strong>Name:</strong> ${car.name || 'N/A'}</p>
                  <p><strong>Make:</strong> ${car.make || 'N/A'}</p>
                  <p><strong>Model:</strong> ${car.model || 'N/A'}</p>
                  <p><strong>Year:</strong> ${car.year || 'N/A'}</p>
                  <p><strong>Description:</strong> ${car.description || 'N/A'}</p>
                  <p><strong>Price:</strong> ${car.priceFormatted || 'N/A'}</p>
                  <p><strong>Mileage:</strong> ${car.mileage ? car.mileage + ' miles' : 'N/A'}</p>
                  <p><strong>Condition:</strong> ${car.condition || 'N/A'}</p>
                  <p><strong>Fuel Type:</strong> ${car.fuelType || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                  <p><strong>Transmission:</strong> ${car.transmission || 'N/A'}</p>
                  <p><strong>Drivetrain:</strong> ${car.drivetrain || 'N/A'}</p>
                  <p><strong>Engine:</strong> ${car.engine || 'N/A'}</p>
                  <p><strong>Horsepower:</strong> ${car.horsepower || 'N/A'}</p>
                  <p><strong>MPG:</strong> ${car.mpg || 'N/A'}</p>
                  <p><strong>Exterior Color:</strong> ${car.exteriorColor || 'N/A'}</p>
                  <p><strong>Interior Color:</strong> ${car.interiorColor || 'N/A'}</p>
                  <p><strong>Category:</strong> ${car.category || 'N/A'}</p>
                  <p><strong>Dealer:</strong> ${car.dealer || 'N/A'}</p>
                  <p><strong>Location:</strong> ${car.location || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div class="modal-footer models-modal-footer">
              <button type="button" class="btn btn-secondary models-btn models-btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalDiv);
      
      const modal = new bootstrap.Modal(modalDiv);
      modal.show();
      
      modalDiv.addEventListener('hidden.bs.modal', function () {
        modalDiv.remove();
      });
    }
  },
  created() {
    this.fetchCars();
    if (this.$route.query.search) {
      this.searchQuery = this.$route.query.search;
    }
  },
  mounted() {
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = `
      .models-component {
        margin-top: -13px;
        min-height: 100vh;
        background: #1a1a2e;
        position: relative;
        overflow-x: hidden;
        padding: 0;
      }

      .models-component::before {
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

      .models-component .models-container {
        position: relative;
        z-index: 1;
        animation: modelsFadeInUp 0.8s ease-out;
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        color: #f8f9fa;
      }

      /* Header Styles - matching profile component */
      .models-component .models-header {
        text-align: center;
        margin-bottom: 3rem;
        padding: 2rem 0;
        opacity: 0;
        transform: translateY(30px);
        animation: modelsHeaderAnimateIn 0.8s ease-out 0.2s both;
      }

      .models-component .models-header h2 {
        color: #f8f9fa;
        font-weight: 700;
        font-size: 3rem;
        margin-bottom: 0.5rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
      }

      .models-component .models-header .subtitle {
        color: #ced4da;
        font-size: 1.2rem;
        font-weight: 400;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
      }

      .models-component .models-header::after {
        content: '';
        width: 80px;
        height: 4px;
        background: #007bff;
        margin: 1rem auto 0;
        display: block;
        border-radius: 2px;
      }

      /* Filters Section - glassmorphism style */
      .models-component .models-filters {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 2rem;
        margin-bottom: 3rem;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        opacity: 0;
        transform: translateY(50px);
        animation: modelsFiltersSlideUp 0.8s ease-out 0.4s both;
        transition: all 0.3s ease;
      }

      .models-component .models-filters:hover {
        transform: translateY(-5px);
        box-shadow: 0 25px 50px rgba(0,0,0,0.4);
        background: rgba(255,255,255,0.08);
      }

      .models-component .form-label {
        color: #ced4da;
        font-weight: 600;
        margin-bottom: 0.75rem;
        font-size: 1rem;
        display: block;
      }

      .models-component .form-select,
      .models-component .form-control {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        color: #f8f9fa;
        padding: 0.75rem 1rem;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
        font-size: 1rem;
      }

      .models-component .form-option {
        color: black;
      }

      .models-component .form-select:focus,
      .models-component .form-control:focus {
        background: rgba(255,255,255,0.08);
        border-color: #007bff;
        box-shadow: 0 0 0 0.25rem rgba(0,123,255,0.25);
        color: #f8f9fa;
        outline: none;
      }

      .models-component .form-control::placeholder {
        color: #6c757d;
      }

      /* Car Cards Grid */
      .models-component .models-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
        margin-bottom: 3rem;
      }

      .models-component .models-card {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(50px);
        animation: modelsCardSlideUp 0.6s ease-out both;
        position: relative;
        color: #f8f9fa;
      }

      /* Staggered animation delays */
      .models-component .models-card:nth-child(1) { animation-delay: 0.6s; }
      .models-component .models-card:nth-child(2) { animation-delay: 0.7s; }
      .models-component .models-card:nth-child(3) { animation-delay: 0.8s; }
      .models-component .models-card:nth-child(4) { animation-delay: 0.9s; }
      .models-component .models-card:nth-child(5) { animation-delay: 1.0s; }
      .models-component .models-card:nth-child(6) { animation-delay: 1.1s; }

      .models-component .models-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        background: rgba(255,255,255,0.08);
      }

      .models-component .models-card-image {
        width: 100%;
        height: 250px;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .models-component .models-card:hover .models-card-image {
        transform: scale(1.05);
      }

      .models-component .models-card-body {
        padding: 1.5rem;
        position: relative;
        z-index: 1;
      }

      .models-component .models-card-title {
        font-size: 1.4rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: #f8f9fa;
        line-height: 1.3;
      }

      .models-component .models-card-text {
        color: #ced4da;
        font-size: 0.95rem;
        line-height: 1.5;
        margin-bottom: 1rem;
      }

      .models-component .models-card-price {
        font-size: 1.3rem;
        font-weight: 700;
        color: #007bff;
        margin-bottom: 1rem;
      }

      .models-component .models-card-footer {
        padding: 0 1.5rem 1.5rem;
        position: relative;
        z-index: 1;
      }

      .models-component .models-card-meta {
        color: #adb5bd;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .models-component .models-card-actions {
        display: flex;
        gap: 0.75rem;
      }

      /* Buttons - matching profile component style */
      .models-component .models-btn {
        border: none;
        border-radius: 12px;
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        flex: 1;
      }

      .models-component .models-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.2);
        transition: left 0.6s;
      }

      .models-component .models-btn:hover::before {
        left: 100%;
      }

      .models-component .models-btn-primary {
        background: #007bff;
        color: white;
        box-shadow: 0 4px 15px rgba(0,123,255,0.3);
      }

      .models-component .models-btn-primary:hover {
        background: #0056b3;
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0,123,255,0.4);
      }

      .models-component .models-btn-secondary {
        background: #6c757d;
        color: white;
        box-shadow: 0 4px 15px rgba(108,117,125,0.3);
      }

      .models-component .models-btn-secondary:hover {
        background: #5a6268;
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(108,117,125,0.4);
      }

      /* Pagination - matching profile component */
      .models-component .models-pagination {
        display: flex;
        justify-content: center;
        margin-top: 3rem;
        opacity: 0;
        transform: translateY(30px);
        animation: modelsPaginationAnimateIn 0.6s ease-out 1.2s both;
      }

      .models-component .pagination {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 1rem;
        border: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      }

      .models-component .page-item .page-link {
        background: transparent;
        border: 1px solid rgba(255,255,255,0.1);
        color: #ced4da;
        padding: 0.75rem 1rem;
        margin: 0 0.25rem;
        border-radius: 8px;
        transition: all 0.3s ease;
        font-weight: 600;
        backdrop-filter: blur(5px);
      }

      .models-component .page-item .page-link:hover {
        background: rgba(0,123,255,0.2);
        border-color: #007bff;
        color: #fff;
        transform: translateY(-2px);
      }

      .models-component .page-item.active .page-link {
        background: #007bff;
        border-color: #007bff;
        color: #fff;
        box-shadow: 0 4px 15px rgba(0,123,255,0.4);
      }

      /* Loading State */
      .models-component .models-loading {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        flex-direction: column;
        opacity: 0;
        transform: translateY(30px);
        animation: modelsLoadingAnimateIn 0.6s ease-out 0.3s both;
      }

      .models-component .models-spinner {
        width: 3rem;
        height: 3rem;
        border: 0.3em solid rgba(0,123,255,0.2);
        border-top-color: #007bff;
        border-radius: 50%;
        animation: modelsSpin 1s linear infinite;
        margin-bottom: 1rem;
      }

      .models-component .models-loading-text {
        color: #ced4da;
        font-size: 1.1rem;
        font-weight: 600;
      }

      /* No Results State */
      .models-component .models-no-results {
        text-align: center;
        padding: 4rem 2rem;
        color: #ced4da;
        opacity: 0;
        transform: translateY(30px);
        animation: modelsNoResultsAnimateIn 0.6s ease-out 0.5s both;
      }

      .models-component .models-no-results h3 {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: #f8f9fa;
        font-weight: 700;
      }

      .models-component .models-no-results p {
        font-size: 1.1rem;
        opacity: 0.8;
      }

      /* Modal Styles - enhanced to match profile component */
      .models-modal .models-modal-content {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        color: #f8f9fa;
        box-shadow: 0 25px 50px rgba(0,0,0,0.4);
      }

      .models-modal .models-modal-header {
        background: rgba(52, 58, 64, 0.8);
        backdrop-filter: blur(15px);
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding: 1.5rem 2rem;
      }

      .models-modal .models-modal-header .modal-title {
        font-size: 1.6rem;
        font-weight: 700;
        color: #f8f9fa;
        margin: 0;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
      }

      .models-modal .models-btn-close {
        background: rgba(108, 117, 125, 0.2);
        border: 1px solid rgba(255,255,255,0.2);
        color: #ced4da;
        font-size: 1.5rem;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: all 0.3s ease;
        font-weight: 300;
        line-height: 1;
        padding: 0;
      }

      .models-modal .models-btn-close:hover {
        background: rgba(220, 53, 69, 0.3);
        border-color: rgba(220, 53, 69, 0.5);
        color: #fff;
        opacity: 1;
        transform: scale(1.1);
      }

      .models-modal .models-modal-body {
        background: rgba(33, 37, 41, 0.8);
        backdrop-filter: blur(15px);
        padding: 2rem;
        max-height: 70vh;
        overflow-y: auto;
      }

      .models-modal .models-modal-body::-webkit-scrollbar {
        width: 8px;
      }

      .models-modal .models-modal-body::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.05);
        border-radius: 4px;
      }

      .models-modal .models-modal-body::-webkit-scrollbar-thumb {
        background: rgba(0,123,255,0.3);
        border-radius: 4px;
      }

      .models-modal .models-modal-body::-webkit-scrollbar-thumb:hover {
        background: rgba(0,123,255,0.5);
      }

      .models-modal .models-modal-body p {
        margin-bottom: 1rem;
        color: #ced4da;
        font-size: 1rem;
        line-height: 1.5;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        transition: all 0.3s ease;
      }

      .models-modal .models-modal-body strong {
        color: #f8f9fa;
        font-weight: 600;
        display: inline-block;
        min-width: 140px;
        margin-right: 0.5rem;
      }

      .models-modal .models-modal-footer {
        border-top: 1px solid rgba(255,255,255,0.1);
        padding: 1.5rem 2rem;
        background: rgba(0,0,0,0.1);
        display: flex;
        justify-content: center;
        gap: 1rem;
      }

      .models-modal .models-modal-footer .models-btn {
        min-width: 120px;
        padding: 1rem 2rem;
        font-weight: 600;
        border-radius: 12px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(108,117,125,0.3);
      }

      .models-modal .models-modal-footer .models-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.2);
        transition: left 0.6s;
      }

      .models-modal .models-modal-footer .models-btn:hover::before {
        left: 100%;
      }

      .models-modal .models-modal-footer .models-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(108,117,125,0.4);
      }

      /* Notification Styles - matching profile component */
      .models-notification {
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

      .models-notification.show {
        opacity: 1;
      }

      .models-notification-success {
        background: rgba(40, 167, 69, 0.9);
        border-left: 4px solid #28a745;
      }

      .models-notification-error {
        background: rgba(220, 53, 69, 0.9);
        border-left: 4px solid #dc3545;
      }

      /* Keyframe Animations */
      @keyframes modelsFadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes modelsHeaderAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes modelsFiltersSlideUp {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes modelsCardSlideUp {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes modelsPaginationAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes modelsLoadingAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes modelsNoResultsAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes modelsSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Responsive Design */
      @media (max-width: 992px) {
        .models-component .models-grid {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
        .models-component .models-header h2 {
          font-size: 2.5rem;
        }
      }

      @media (max-width: 768px) {
        .models-component .models-container {
          padding: 1rem;
        }
        .models-component .models-header h2 {
          font-size: 2rem;
        }
        .models-component .models-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .models-component .models-card-actions {
          flex-direction: column;
        }
        .models-component .models-filters {
          padding: 1.5rem;
        }
        .models-modal .modal-dialog {
          margin: 1rem;
          max-width: calc(100% - 2rem);
        }
        .models-modal .models-modal-header,
        .models-modal .models-modal-body,
        .models-modal .models-modal-footer {
          padding: 1rem 1.5rem;
        }
        .models-modal .models-modal-footer {
          flex-direction: column;
        }
        .models-modal .models-modal-footer .models-btn {
          width: 100%;
        }
      }

      @media (max-width: 576px) {
        .models-component .models-header h2 {
          font-size: 1.8rem;
        }
        .models-component .models-card-body,
        .models-component .models-card-footer {
          padding: 1rem;
        }
        .models-component .form-select,
        .models-component .form-control {
          font-size: 16px; /* Prevent zoom on iOS */
        }
        .models-modal .models-modal-body strong {
          min-width: 80px;
          display: block;
          margin-bottom: 0.25rem;
        }
      }

      /* Focus States for Accessibility */
      .models-component *:focus {
        outline: 2px solid rgba(0,123,255,0.5);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(this.styleElement);
  },
  template: `
    <div class="models-component">
      <div class="models-container">
        <!-- Header Section -->
        <div class="models-header">
          <h2>Car Models</h2>
          <p class="subtitle">Discover your perfect vehicle from our premium collection</p>
        </div>

        <!-- Filters Section -->
        <div class="models-filters">
          <div class="row">
            <div class="col-md-3 mb-3">
              <label class="form-label">Filter By</label>
              <select class="form-select" v-model="filterAttribute" @change="filterValue=''">
                <option class="form-option">All</option>
                <option class="form-option">Make</option>
                <option class="form-option">Year</option>
                <option class="form-option">Category</option>
              </select>
            </div>
            <div class="col-md-3 mb-3" v-if="filterAttribute !== 'All'">
              <label class="form-label">Value</label>
              <select class="form-select" v-model="filterValue">
                <option value="" class="form-option">All</option>
                <option v-for="option in attributeOptions" :key="option" :value="option" class="form-option">{{ option }}</option>
              </select>
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Price Range</label>
              <select class="form-select" v-model="filterPrice">
                <option class="form-option" value="">All Prices</option>
                <option class="form-option" value="under30">Under RM30,000</option>
                <option class="form-option" value="30to50">RM30,000 - RM50,000</option>
                <option class="form-option" value="above50">Above RM50,000</option>
              </select>
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Search</label>
              <input type="text" class="form-control" placeholder="Search by car name..." v-model="searchQuery">
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="cars.length === 0" class="models-loading">
          <div class="models-spinner"></div>
          <div class="models-loading-text">Loading amazing cars...</div>
        </div>

        <!-- No Results State -->
        <div v-else-if="filteredCars.length === 0" class="models-no-results">
          <h3>No Cars Found</h3>
          <p>Try adjusting your filters to see more results</p>
        </div>

        <!-- Car Cards Grid -->
        <div v-else class="models-grid">
          <div v-for="(car, index) in paginatedCars" :key="car.id || index" class="models-card">
            <img :src="car.image || 'https://via.placeholder.com/350x250?text=No+Image'" 
                class="models-card-image" 
                :alt="car.name || car.location">
            
            <div class="models-card-body">
              <h5 class="models-card-title">{{ car.name || car.location }}</h5>
              <p class="models-card-text">{{ car.description || 'Premium vehicle with exceptional features' }}</p>
              <div class="models-card-price">{{ car.priceFormatted || 'Contact for Price' }}</div>
            </div>
            
            <div class="models-card-footer">
              <div class="models-card-meta">
                <span>{{ car.year || 'N/A' }}</span>
                <span>{{ car.mileage ? car.mileage + ' miles' : 'Low Mileage' }}</span>
              </div>
              <div class="models-card-actions">
                <button class="models-btn models-btn-primary" @click="addToCart(car)">
                  Add to Cart
                </button>
                <button class="models-btn models-btn-secondary" @click="viewDetails(car)">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pageCount > 1" class="models-pagination">
          <paginate
            :page-count="pageCount"
            :page-range="3"
            :margin-pages="1"
            :click-handler="clickCallback"
            :prev-text="'‹ Previous'"
            :next-text="'Next ›'"
            :container-class="'pagination'"
            :page-class="'page-item'"
            :page-link-class="'page-link'"
            :active-class="'active'">
          </paginate>
        </div>
      </div>
    </div>
  `
};