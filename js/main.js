const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(), 
    routes: [
      {
        path: '/',
        component: HomePage,
        name: 'home'
      },
      {
        path: '/register',
        component: Register,
        name: 'register'
      },
      {
        path: '/login',
        component: Login,
        name: 'login'
      },
      {
        path: '/forgotpassword',
        component: ForgotPassword,
        name: 'forgotpassword',
      },
      {
        path: '/profile',
        component: Profile,
        name: 'profile'
      },
      {
        path: '/models',
        component: Models,
        name: 'models'
      },
      {
        path: '/cart',
        component: Cart,
        name: 'cart'
      },
      {
        path: '/purchase',
        component: Purchase,
        name: 'purchase'
      },
      {
        path: '/logout',
        name: 'logout',
        beforeEnter: (to, from, next) => {
          // Handle logout in route guard
          // Clear authentication data directly
          sessionStorage.removeItem('authenticated');
          sessionStorage.removeItem('currentUser');
          
          // Get the app instance from the router
          const app = router.app;
          if (app && app.$root) {
            // Call logout method on root component
            app.$root.logout();
          } else if (app && app.config.globalProperties.$root) {
            // Alternative way to access root
            app.config.globalProperties.$root.logout();
          }
          
          console.log('Logout completed, redirecting to home');
          next({ name: 'home' });
        }
      },
      {
        path: '/dashboard',
        component: Dashboard,
        name: 'dashboard',
        meta: { requiresAuth: true }
      },
      // Uncomment these as you create the components
      // {
      //   path: '/inventory',
      //   component: Inventory,
      //   name: 'inventory'
      // },
      // {
      //   path: '/contact',
      //   component: Contact,
      //   name: 'contact'
      // }
    ],
    scrollBehavior(to, from, savedPosition) {
      // Always scroll to top
      return { top: 0 };
    }
});

// Add navigation guard for protected routes
router.beforeEach((to, from, next) => {
  // Check authentication status from sessionStorage directly
  const storedAuth = sessionStorage.getItem('authenticated');
  const isAuthenticated = storedAuth === 'true';
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      console.log('Protected route accessed without authentication, redirecting to login');
      next({ name: 'login' });
    } else {
      next();
    }
  } else {
    // If user is authenticated and trying to access login page, redirect to dashboard/home
    if (to.name === 'login' && isAuthenticated) {
      console.log('Authenticated user accessing login, redirecting to dashboard/home');
      if (router.hasRoute('dashboard')) {
        next({ name: 'dashboard' });
      } else {
        next({ name: 'home' });
      }
    } else {
      next();
    }
  }
});

// Initialize Vue app
const { createApp, ref } = Vue;

const app = createApp({
  data() {
    return {
      authenticated: false,
      currentUser: null,
    }
  },
  
  methods: {
    /**
     * Set authentication status and user data
     * @param {boolean} status - Authentication status
     * @param {Object} userData - User data object
     */
    setAuthenticated(status, userData = null) {
      console.log('setAuthenticated called:', status, userData);
      this.authenticated = status;
      this.currentUser = userData;
      
      // Store authentication state in sessionStorage for persistence
      if (status && userData) {
        sessionStorage.setItem('authenticated', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        console.log('User authenticated and stored:', userData.username);
      } else {
        sessionStorage.removeItem('authenticated');
        sessionStorage.removeItem('currentUser');
        console.log('Authentication cleared from storage');
      }
    },
    
    /**
     * Logout user and clear all authentication data
     */
    logout() {
      const wasAuthenticated = this.authenticated;
      
      console.log('Logout initiated, was authenticated:', wasAuthenticated);
      
      this.authenticated = false;
      this.currentUser = null;
      
      // Clear stored authentication data
      sessionStorage.removeItem('authenticated');
      sessionStorage.removeItem('currentUser');
      
      console.log('Logout completed - authentication state cleared');
      
      // Force reactivity update
      this.$forceUpdate();
    },
    
    /**
     * Check authentication state on app initialization
     * Restores authentication from sessionStorage if available
     */
    checkAuthState() {
      try {
        const storedAuth = sessionStorage.getItem('authenticated');
        const storedUser = sessionStorage.getItem('currentUser');
        
        console.log('Checking auth state:', storedAuth, storedUser);
        
        if (storedAuth === 'true' && storedUser) {
          const userData = JSON.parse(storedUser);
          this.authenticated = true;
          this.currentUser = userData;
          console.log('Authentication restored for:', userData.username);
        } else {
          console.log('No stored authentication found');
        }
      } catch (error) {
        console.error('Error restoring authentication state:', error);
        // Clear potentially corrupted data
        sessionStorage.removeItem('authenticated');
        sessionStorage.removeItem('currentUser');
      }
    }
  },
  
  mounted() {
    // Check authentication state when app mounts
    console.log('App mounted, checking auth state');
    this.checkAuthState();
  }
});

// Register Navigation Component with Dynamic Content
app.component('app-nav', {
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-lg animated-navbar">
      <div class="container">
        <!-- Brand Logo -->
        <router-link class="navbar-brand fw-bold fs-3 brand-logo" to="/">
          <img src="resources/images/logo.png" alt="AutoElite Logo" style="height: 40px; margin-right: 8px;">
        </router-link>

        <!-- Mobile Toggle Button -->
        <button class="navbar-toggler border-0 toggle-btn" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation" @click="toggleMobile">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navigation Links -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item nav-item-animated">
              <router-link class="nav-link px-3 nav-link-animated" to="/" :class="{ 'active': $route.name === 'home' }">
                <i class="mdi mdi-home me-1 nav-icon"></i>
                <span class="nav-text">Home</span>
              </router-link>
            </li>
            <!-- For non-home links, add a click handler -->
            <li class="nav-item nav-item-animated">
              <router-link 
                class="nav-link px-3 nav-link-animated" 
                to="/models"
                @click="handleNavClick($event, 'models')">
                <i class="mdi mdi-car me-1 nav-icon"></i>
                <span class="nav-text">Models</span>
              </router-link>
            </li>
            <li class="nav-item nav-item-animated">
              <router-link 
                class="nav-link px-3 nav-link-animated" 
                to="/cart"
                @click="handleNavClick($event, 'cart')">
                <i class="mdi mdi-cart-outline me-1 nav-icon"></i>
                <span class="nav-text">Cart</span>
              </router-link>
            </li>
            <li class="nav-item nav-item-animated">
              <router-link 
                class="nav-link px-3 nav-link-animated" 
                to="/purchase"
                @click="handleNavClick($event, 'purchase')">
                <i class="mdi mdi-cash me-1 nav-icon"></i>
                <span class="nav-text">Purchase</span>
              </router-link>
            </li>
          </ul>

          <!-- Right Side Navigation -->
          <ul class="navbar-nav ms-auto">
            <!-- Search Form and Authentication Links remain unchanged -->
            <li class="nav-item mt-1 nav-item-animated">
              <form class="d-flex search-form" @submit.prevent="performSearch">
                <div class="input-group search-container">
                  <input
                    class="form-control form-control-sm bg-secondary border-secondary text-white search-input"
                    type="search"
                    placeholder="Search cars..."
                    v-model="searchQuery"
                    style="min-width: 150px;"
                    @focus="searchFocused = true"
                    @blur="searchFocused = false">
                  <button class="btn btn-outline-primary btn-sm search-btn" type="submit">
                    <i class="mdi mdi-magnify search-icon"></i>
                  </button>
                </div>
              </form>
            </li>

            <!-- Authentication Links -->
            <li class="nav-item nav-item-animated" v-if="!$root.authenticated">
              <router-link class="nav-link px-3 nav-link-animated login-link" to="/login">
                <i class="mdi mdi-login me-1 nav-icon"></i>
                <span class="nav-text">Login</span>
              </router-link>
            </li>
            
            <!-- User Dropdown when authenticated -->
            <li class="nav-item dropdown nav-item-animated" v-if="$root.authenticated">
              <a class="nav-link dropdown-toggle px-3 nav-link-animated user-dropdown" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="mdi mdi-account-circle me-1 nav-icon"></i>
                <span class="nav-text">{{ $root.currentUser?.username || 'User' }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end bg-dark border-secondary dropdown-animated">
                <li>
                  <router-link class="dropdown-item text-light dropdown-item-animated" to="/profile">
                    <i class="mdi mdi-account me-2"></i>Profile
                  </router-link>
                </li>
                <li><hr class="dropdown-divider border-secondary"></li>
                <li>
                  <a class="dropdown-item text-light dropdown-item-animated logout-item" href="#" @click.prevent="handleLogout">
                    <i class="mdi mdi-logout me-2"></i>Logout
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  data() {
    return {
      searchQuery: '',
      searchFocused: false,
      scrolled: false
    }
  },
  methods: {
    handleNavClick(event, routeName) {
      // Allow Home link to pass through.
      if (routeName !== 'home' && !this.$root.authenticated) {
        event.preventDefault();
        console.log('User not authenticated, redirecting to login.');
        this.$router.push({ name: 'login' });
      }
    },
    handleLogout() {
      console.log('Logout clicked from navigation');
      this.$root.logout();
      this.$router.push({ name: 'home' });
    },
    performSearch() {
      const query = this.searchQuery.trim();
      if (query) {
        this.$router.push({ name: 'models', query: { search: query } });
        this.searchQuery = '';
      }
    },
    toggleMobile() {
      const toggleBtn = document.querySelector('.toggle-btn');
      toggleBtn.classList.toggle('active');
    },
    handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      this.scrolled = scrollTop > 50;
      const navbar = document.querySelector('.animated-navbar');
      if (this.scrolled) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  },
  mounted() {
    document.body.style.paddingTop = '76px';
    window.addEventListener('scroll', this.handleScroll);
    const style = document.createElement('style');
    style.textContent = `
      /* Navbar Base Styles */
      .animated-navbar {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .animated-navbar.scrolled {
        background-color: rgba(33, 37, 41, 0.95) !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
      
      .brand-icon {
        transition: all 0.3s ease;
        animation: pulse 2s infinite;
      }
      
      .brand-logo {
        margin-top: -3px;
      }

      .brand-icon {
        transform: rotate(360deg);
        animation: none;
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      /* Navigation Items */
      .nav-item-animated {
        transition: all 0.3s ease;
        position: relative;
      }
      
      .nav-link-animated {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        border-radius: 8px;
        margin: 0 2px;
      }
      
      .nav-link-animated::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 123, 255, 0.1), transparent);
        transition: left 0.5s ease;
      }
      
      .nav-link-animated:hover::before {
        left: 100%;
      }
      
      .nav-link-animated:hover {
        color: #007bff !important;
        background-color: rgba(0, 123, 255, 0.1);
        transform: translateY(-2px);
      }
      
      .nav-link-animated.active {
        color: #007bff !important;
        background-color: rgba(0, 123, 255, 0.15);
        box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
      }
      
      .nav-icon {
        transition: all 0.3s ease;
      }
      
      .nav-link-animated:hover .nav-icon {
        transform: scale(1.2) rotate(5deg);
      }

      /* Dropdown Animations */
      .dropdown-animated {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
        animation: dropdownShow 0.3s ease forwards;
      }
      
      @keyframes dropdownShow {
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      .dropdown-item-animated {
        transition: all 0.3s ease;
        border-radius: 8px;
        margin: 2px 4px;
        position: relative;
        overflow: hidden;
      }
      
      .dropdown-item-animated::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 123, 255, 0.1), transparent);
        transition: left 0.4s ease;
      }
      
      .dropdown-item-animated:hover::before {
        left: 100%;
      }
      
      .dropdown-item-animated:hover {
        background-color: rgba(0, 123, 255, 0.2) !important;
        transform: translateX(5px);
        color: #ffffff !important;
      }
      
      .featured-item:hover {
        background-color: rgba(255, 193, 7, 0.2) !important;
        color: #ffc107 !important;
      }
      
      .logout-item:hover {
        background-color: rgba(220, 53, 69, 0.2) !important;
        color: #dc3545 !important;
      }

      /* Search Animations */
      .search-container {
        transition: all 0.3s ease;
        border-radius: 25px;
        overflow: hidden;
      }
      
      .search-input {
        transition: all 0.3s ease;
        border-radius: 25px 0 0 25px !important;
        border-right: none !important;
      }
      
      .search-input:focus {
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        transform: scale(1.02);
        background-color: rgba(108, 117, 125, 0.3) !important;
      }
      
      .search-btn {
        border-radius: 0 25px 25px 0 !important;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .search-btn:hover {
        background-color: #007bff;
        border-color: #007bff;
        transform: scale(1.05);
      }
      
      .search-btn.searching {
        animation: searchPulse 0.5s ease;
      }
      
      @keyframes searchPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      .search-icon {
        transition: all 0.3s ease;
      }
      
      .search-btn:hover .search-icon {
        transform: rotate(90deg);
      }

      /* Login Link */
      .login-link:hover {
        background: linear-gradient(45deg, rgba(0, 123, 255, 0.1), rgba(0, 123, 255, 0.2));
      }

      /* User Dropdown */
      .user-dropdown:hover {
        background: linear-gradient(45deg, rgba(40, 167, 69, 0.1), rgba(40, 167, 69, 0.2));
      }

      /* Mobile Toggle Button */
      .toggle-btn {
        transition: all 0.3s ease;
        border-radius: 8px;
      }
      
      .toggle-btn:hover {
        background-color: rgba(0, 123, 255, 0.1);
        transform: scale(1.05);
      }
      
      .toggle-btn.active {
        transform: rotate(90deg);
      }
      
      /* Mobile Responsive Animations */
      @media (max-width: 991.98px) {
        .navbar-collapse {
          animation: mobileSlideDown 0.3s ease;
        }
        
        @keyframes mobileSlideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .nav-item-animated {
          animation: mobileItemSlide 0.4s ease backwards;
        }
        
        .nav-item-animated:nth-child(1) { animation-delay: 0.1s; }
        .nav-item-animated:nth-child(2) { animation-delay: 0.2s; }
        .nav-item-animated:nth-child(3) { animation-delay: 0.3s; }
        .nav-item-animated:nth-child(4) { animation-delay: 0.4s; }
        .nav-item-animated:nth-child(5) { animation-delay: 0.5s; }
        
        @keyframes mobileItemSlide {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      }

      /* Loading States */
      .nav-link-animated.loading {
        pointer-events: none;
        opacity: 0.7;
      }
      
      .nav-link-animated.loading::after {
        content: '';
        position: absolute;
        top: 50%;
        right: 10px;
        width: 12px;
        height: 12px;
        border: 1px solid rgba(0, 123, 255, 0.3);
        border-top: 1px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        transform: translateY(-50%);
      }
      
      @keyframes spin {
        0% { transform: translateY(-50%) rotate(0deg); }
        100% { transform: translateY(-50%) rotate(360deg); }
      }

      /* Accessibility Improvements */
      .nav-link-animated:focus,
      .dropdown-item-animated:focus,
      .search-input:focus,
      .search-btn:focus {
        outline: 2px solid #007bff;
        outline-offset: 2px;
      }
      
      /* Reduced Motion Support */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }
});

// Register Simplified Footer Component
app.component('app-footer', {
  template: `
    <footer class="bg-dark text-light py-4">
      <div class="container">
        <!-- Main Footer Content -->
        <div class="row">
          <!-- Company Info -->
          <div class="col-md-4 mb-3">
            <h5 class="text-primary fw-bold mb-3">
              <i class="mdi mdi-car-sports me-2"></i>AutoElite
            </h5>
            <p class="text-light small mb-3">
              Your premier destination for luxury and performance vehicles. 
              Serving customers with exceptional service for over 15 years.
            </p>
            <div class="social-links">
              <a href="#" class="text-light me-3"><i class="mdi mdi-facebook"></i></a>
              <a href="#" class="text-light me-3"><i class="mdi mdi-twitter"></i></a>
              <a href="#" class="text-light me-3"><i class="mdi mdi-instagram"></i></a>
              <a href="#" class="text-light me-3"><i class="mdi mdi-youtube"></i></a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="col-md-4 mb-3">
            <h6 class="fw-bold mb-3">Quick Links</h6>
            <div class="row">
              <div class="col-6">
                <ul class="list-unstyled small">
                  <li class="mb-1">
                    <router-link to="/" class="text-light text-decoration-none">Home</router-link>
                  </li>
                  <li class="mb-1">
                    <a href="#inventory" class="text-light text-decoration-none">Inventory</a>
                  </li>
                  <li class="mb-1">
                    <a href="#services" class="text-light text-decoration-none">Services</a>
                  </li>
                </ul>
              </div>
              <div class="col-6">
                <ul class="list-unstyled small">
                  <li class="mb-1">
                    <a href="#financing" class="text-light text-decoration-none">Financing</a>
                  </li>
                  <li class="mb-1">
                    <a href="#about" class="text-light text-decoration-none">About Us</a>
                  </li>
                  <li class="mb-1">
                    <a href="#contact" class="text-light text-decoration-none">Contact</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="col-md-4 mb-3">
            <h6 class="fw-bold mb-3">Contact Us</h6>
            <div class="small">
              <div class="mb-2">
                <i class="mdi mdi-map-marker text-primary me-2"></i>
                123 Elite Avenue, City, State 12345
              </div>
              <div class="mb-2">
                <i class="mdi mdi-phone text-primary me-2"></i>
                <a href="tel:+15551234567" class="text-light text-decoration-none">(555) 123-4567</a>
              </div>
              <div class="mb-2">
                <i class="mdi mdi-email text-primary me-2"></i>
                <a href="mailto:sales@autoelite.com" class="text-light text-decoration-none">sales@autoelite.com</a>
              </div>
              <div>
                <i class="mdi mdi-clock text-primary me-2"></i>
                Mon-Fri: 9AM-8PM | Sat-Sun: 10AM-6PM
              </div>
            </div>
          </div>
        </div>

        <!-- Newsletter Section (Simplified) -->
        <div class="row mt-4 pt-3 border-top border-secondary">
          <div class="col-md-8 mb-3">
            <form class="row g-2" @submit.prevent="subscribeNewsletter">
              <div class="col-auto">
                <label class="form-label small text-light mb-1">Stay updated with our latest deals:</label>
              </div>
              <div class="col-md-6">
                <input type="email" class="form-control form-control-sm" 
                       placeholder="Enter your email" v-model="emailSubscription" required>
              </div>
              <div class="col-auto">
                <button type="submit" class="btn btn-primary btn-sm">Subscribe</button>
              </div>
            </form>
          </div>
          <div class="col-md-4 text-md-end">
            <div class="small">
              <span class="badge bg-primary me-1">Certified Dealer</span>
              <span class="badge bg-success">5-Star Rating</span>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="row mt-3 pt-3 border-top border-secondary">
          <div class="col-md-8">
            <p class="text-light small mb-0">
              &copy; {{ currentYear }} AutoElite. All rights reserved.
              <a href="#" class="text-light ms-3">Privacy Policy</a>
              <a href="#" class="text-light ms-3">Terms</a>
            </p>
          </div>
          <div class="col-md-4 text-md-end">
            <p class="text-light small mb-0">Made with excellence</p>
          </div>
        </div>
      </div>
    </footer>
  `,
  data() {
    return {
      emailSubscription: '',
      currentYear: new Date().getFullYear()
    }
  },
  methods: {
    subscribeNewsletter() {
      if (this.emailSubscription.trim()) {
        console.log('Newsletter subscription:', this.emailSubscription);
        alert(`Thank you for subscribing! You'll receive our latest updates.`);
        this.emailSubscription = '';
      }
    }
  },
  mounted() {
    // Simple hover effects
    const style = document.createElement('style');
    style.textContent = `
      footer a:hover {
        color: #007bff !important;
        transition: color 0.2s ease;
      }
      
      .social-links a:hover {
        transform: translateY(-2px);
        transition: transform 0.2s ease;
      }
    `;
    document.head.appendChild(style);
  }
});

// Register all application components
app.component('app-homepage', HomePage);
app.component('app-register', Register);
app.component('app-login', Login);
app.component('app-forgotpassword', ForgotPassword);
app.component('app-profile', Profile);
app.component('app-models', Models);
app.component('app-cart', Cart);
app.component('app-purchase', Purchase);

// Use plugins and mount the app
app.use(router);
app.mount('#app');