const Register = {
  data() {
    return {
      input: {
        username: "",
        fullname: "",
        email: "",
        password: "",
        confirmPassword: ""
      },
      msg: "",
      loading: false,
      showPassword: false,
      showConfirmPassword: false,
      styleElement: null // Track the style element
    }
  },

  methods: {
    register() {
      // Custom input validation:
      if (!this.input.username || !this.input.fullname || !this.input.email || !this.input.password || !this.input.confirmPassword) {
        this.msg = "All fields are required.";
        return;
      }

      if (this.input.username.length > 10) {
        this.msg = "Username must be 10 characters or less.";
        return;
      }

      // Very simple email pattern check.
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.input.email)) {
        this.msg = "Invalid email address.";
        return;
      }

      if (this.input.password.length < 8) {
        this.msg = "Password must be at least 8 characters.";
        return;
      }

      if (this.input.password !== this.input.confirmPassword) {
        this.msg = "Passwords do not match.";
        return;
      }
      
      // Clear any previous message, start loading
      this.loading = true;
      this.msg = "";
      
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.input)
      };
      
      fetch("resources/api_register.php", requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          this.loading = false;
          if (data.error) {
            this.msg = data.message || "Registration failed.";
          } else {
            this.msg = "Registration successful!";
            // Optionally redirect to the login page after success
            setTimeout(() => {
              this.$router.replace({ name: "login" });
            }, 5000);
          }
        })
        .catch(error => {
          this.loading = false;
          this.msg = "Error. Please try again.";
          console.error("Register error:", error);
        });
    },

    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  },

  mounted() {
    // Add scoped styles with a unique class prefix matching the login design
    this.styleElement = document.createElement('style');
    this.styleElement.setAttribute('data-component', 'register');
    this.styleElement.textContent = `
      .register-component {
        margin-top: -13px;
        padding-bottom: 40px;
        min-height: 100vh;
        background: #1a1a2e;
        position: relative;
        overflow-x: hidden;
      }

      .register-component::before {
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

      /* Hero Section */
      .register-component .register-hero-section {
        min-height: 100vh;
        position: relative;
        display: flex;
        align-items: center;
        z-index: 1;
      }

      .register-component .container {
        position: relative;
        z-index: 1;
        animation: registerFadeInUp 0.8s ease-out;
        max-width: 1140px;
      }

      /* Register Card - glassmorphism like login cards */
      .register-component .register-card {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        overflow: hidden;
        opacity: 0;
        transform: translateY(50px);
        animation: registerMainSlideUp 0.8s ease-out 0.4s both;
        transition: all 0.3s ease;
        color: #f8f9fa;
      }

      .register-component .register-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        background: rgba(255,255,255,0.08);
      }

      .register-component .register-card .card-body {
        position: relative;
        z-index: 2;
        padding: 2.5rem !important;
        background: rgba(33, 37, 41, 0.8);
        backdrop-filter: blur(15px);
      }

      /* Section Title - matching login header */
      .register-component .section-title {
        color: #f8f9fa;
        font-weight: 700;
        font-size: 2.5rem;
        margin-bottom: 1rem;
        text-align: center;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
        opacity: 0;
        transform: translateY(30px);
        animation: registerHeaderAnimateIn 0.8s ease-out 0.2s both;
      }

      .register-component .section-title::after {
        content: '';
        width: 80px;
        height: 4px;
        background: #007bff;
        margin: 1rem auto 0;
        display: block;
        border-radius: 2px;
      }

      /* Form Groups with staggered animation */
      .register-component .mb-3 {
        opacity: 0;
        transform: translateY(20px);
        animation: registerFormGroupAnimateIn 0.6s ease-out both;
      }

      .register-component .mb-3:nth-child(2) { animation-delay: 0.6s; }
      .register-component .mb-3:nth-child(3) { animation-delay: 0.7s; }
      .register-component .mb-3:nth-child(4) { animation-delay: 0.8s; }
      .register-component .mb-3:nth-child(5) { animation-delay: 0.9s; }
      .register-component .mb-3:nth-child(6) { animation-delay: 1.0s; }
      .register-component .mb-3:nth-child(7) { animation-delay: 1.1s; }

      /* Form Labels */
      .register-component .form-label {
        color: #ced4da;
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: block;
      }

      /* Input Groups */
      .register-component .input-group-text {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-right: none;
        color: #ced4da;
        transition: all 0.3s ease;
        border-radius: 8px 0 0 8px;
        backdrop-filter: blur(5px);
      }

      .register-component .form-control {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-left: none;
        border-radius: 0 8px 8px 0;
        color: #f8f9fa;
        padding: 0.75rem 1rem;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
      }

      .register-component .form-control::placeholder {
        color: #6c757d;
      }

      .register-component .form-control:focus {
        background: rgba(255,255,255,0.08);
        border-color: #007bff;
        box-shadow: 0 0 0 0.25rem rgba(0,123,255,0.25);
        color: #f8f9fa;
        transform: translateY(-2px);
      }

      .register-component .form-control:focus + .input-group-text,
      .register-component .input-group:focus-within .input-group-text {
        border-color: #007bff;
        background: rgba(0,123,255,0.1);
        color: #007bff;
        transform: translateY(-2px);
      }

      /* Password Toggle Button */
      .register-component .btn-outline-secondary {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-left: none;
        border-radius: 0 8px 8px 0;
        color: #ced4da;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
      }

      .register-component .btn-outline-secondary:hover {
        background: #007bff;
        border-color: #007bff;
        color: white;
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(0,123,255,0.3);
      }

      /* Form Text */
      .register-component .form-text {
        color: #6c757d;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      /* Submit Button - matching login button styles */
      .register-component .btn-primary {
        background: #007bff;
        border: none;
        border-radius: 12px;
        padding: 1.25rem 3rem;
        font-weight: 700;
        font-size: 1.1rem;
        color: white;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        width: 100%;
        opacity: 0;
        transform: translateY(30px);
        animation: registerButtonAnimateIn 0.6s ease-out 1.2s both;
        box-shadow: 0 4px 15px rgba(0,123,255,0.3);
      }

      .register-component .btn-primary::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.2);
        transition: left 0.6s;
      }

      .register-component .btn-primary:hover::before {
        left: 100%;
      }

      .register-component .btn-primary:hover {
        background: #0056b3;
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0,123,255,0.4);
      }

      .register-component .btn-primary:disabled {
        background: #6c757d;
        cursor: not-allowed;
        opacity: 0.7;
        transform: none;
        box-shadow: none;
      }

      /* Alert Messages */
      .register-component .alert {
        border-radius: 12px;
        border: none;
        font-weight: 500;
        animation: registerAlertSlideIn 0.5s ease-out;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      }

      .register-component .alert-success {
        background: rgba(40, 167, 69, 0.9);
        color: #fff;
        border-left: 4px solid #28a745;
      }

      .register-component .alert-danger {
        background: rgba(220, 53, 69, 0.9);
        color: #fff;
        border-left: 4px solid #dc3545;
      }

      /* Additional Links */
      .register-component .btn-link {
        color: #007bff;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        opacity: 0;
        animation: registerFadeIn 0.6s ease-out 1.3s both;
      }

      .register-component .btn-link:hover {
        color: #0056b3;
        background: rgba(0,123,255,0.1);
        transform: translateY(-2px);
      }

      .register-component .text-muted {
        color: #6c757d !important;
        opacity: 0;
        animation: registerFadeIn 0.6s ease-out 1.3s both;
      }

      /* Loading Spinner */
      .register-component .spinner-border-sm {
        animation: registerSpin 1s linear infinite;
        color: #fff;
      }

      /* Keyframe Animations */
      @keyframes registerFadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes registerHeaderAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes registerMainSlideUp {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes registerFormGroupAnimateIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes registerButtonAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes registerFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes registerAlertSlideIn {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes registerSpin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .register-component .section-title {
          font-size: 2rem !important;
        }

        .register-component .register-card .card-body {
          padding: 2rem !important;
        }

        .register-component .form-control {
          font-size: 16px; /* Prevents zoom on iOS */
        }

        .register-component .btn-primary {
          font-size: 1rem;
          padding: 1rem 2rem;
        }
      }

      @media (max-width: 576px) {
        .register-component .container {
          padding: 0 1rem;
        }

        .register-component .register-card {
          border-radius: 15px;
        }

        .register-component .register-card .card-body {
          padding: 1.5rem !important;
        }

        .register-component .section-title {
          font-size: 1.75rem !important;
        }
      }

      /* Focus States for Accessibility */
      .register-component .btn:focus,
      .register-component .form-control:focus,
      .register-component .btn-link:focus {
        outline: 2px solid rgba(0,123,255,0.5);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(this.styleElement);
  },

  // Clean up styles when component is destroyed
  beforeUnmount() {
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }
  },

  template: `
    <main class="register-component">
      <div class="register-hero-section">
        <div class="register-hero-background"></div>
        <div class="register-hero-overlay"></div>
        <div class="container pt-4">
          <div class="row justify-content-md-center align-items-center min-vh-100 mt-4">
            <div class="col col-lg-5">
              <div class="card register-card shadow-lg border-0 rounded-lg">
                <div class="card-body p-4">
                  <!-- Card Title -->
                  <div class="text-center mb-4">
                    <h2 class="section-title">Create Account</h2>
                  </div>
                  <!-- Register Form -->
                  <form @submit.prevent="register()" novalidate>
                    <div class="mb-3">
                      <label for="username" class="form-label">Username</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="mdi mdi-account"></i></span>
                        <input 
                          type="text" 
                          class="form-control" 
                          id="username"
                          v-model="input.username" 
                          placeholder="Enter your username"
                          maxlength="10"
                          required
                        >
                      </div>
                      <div class="form-text">Maximum 10 characters</div>
                    </div>
                    <!-- New Full Name Field -->
                    <div class="mb-3">
                      <label for="fullname" class="form-label">Full Name</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="mdi mdi-account-edit"></i></span>
                        <input 
                          type="text"
                          class="form-control"
                          id="fullname"
                          v-model="input.fullname"
                          placeholder="Enter your full name"
                          maxlength="100"
                          required
                        >
                      </div>
                      <div class="form-text">Enter your first and last name</div>
                    </div>
                    <div class="mb-3">
                      <label for="email" class="form-label">Email</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="mdi mdi-email"></i></span>
                        <input 
                          type="email" 
                          class="form-control" 
                          id="email"
                          v-model="input.email" 
                          placeholder="Enter your email"
                          required
                        >
                      </div>
                      <div class="form-text">We'll never share your email</div>
                    </div>
                    <div class="mb-3">
                      <label for="password" class="form-label">Password</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="mdi mdi-lock"></i></span>
                        <input 
                          :type="showPassword ? 'text' : 'password'" 
                          class="form-control" 
                          id="password"
                          v-model="input.password" 
                          placeholder="Enter your password"
                          minlength="8"
                          required
                        >
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary" 
                          @click="togglePassword()"
                          :title="showPassword ? 'Hide password' : 'Show password'"
                        >
                          <i :class="showPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
                        </button>
                      </div>
                      <div class="form-text">Minimum 8 characters</div>
                    </div>
                    <div class="mb-3">
                      <label for="confirmPassword" class="form-label">Confirm Password</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="mdi mdi-lock-check"></i></span>
                        <input 
                          :type="showConfirmPassword ? 'text' : 'password'" 
                          class="form-control" 
                          id="confirmPassword"
                          v-model="input.confirmPassword" 
                          placeholder="Confirm your password"
                          minlength="8"
                          required
                          @keyup.enter="register()"
                        >
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary" 
                          @click="toggleConfirmPassword()"
                          :title="showConfirmPassword ? 'Hide password' : 'Show password'"
                        >
                          <i :class="showConfirmPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
                        </button>
                      </div>
                      <div class="form-text">Must match your password</div>
                    </div>
                    <div class="d-grid gap-2 mb-3">
                      <button 
                        type="submit"
                        class="btn btn-primary btn-lg"
                        :disabled="loading"
                      >
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        Create Account
                      </button>
                    </div>
                    <div v-if="msg" class="alert" 
                         :class="msg.includes('successful') ? 'alert-success' : 'alert-danger'" role="alert">
                      {{ msg }}
                    </div>
                  </form>
                  <!-- Additional Links -->
                  <div class="text-center mt-3">
                    <p class="mb-1 text-muted">Already have an account?</p>
                    <router-link class="btn btn-link" to="/login">Sign In</router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `
};