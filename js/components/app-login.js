const Login = {
  data() {
    return {
      msg: '',
      input: {
        username: "",
        password: ""
      },
      valid: true,
      showPassword: false,
      loading: false,
      usernameRules: [
        v => !!v || 'Username is required',
        v => (v && v.length <= 10) || 'Username must be less than 10 characters',
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => (v && v.length >= 8) || 'Password must be more than 8 characters',
      ],
      styleElement: null // Track the style element
    }
  },
  
  methods: {
    login() {
      if (this.$refs.form.checkValidity()) {
        this.loading = true;
        this.msg = '';

        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: this.input.username,
            password: this.input.password
          })
        };

        fetch("resources/api_login.php", requestOptions)
          .then(response => {
            // Don't throw error for 4xx status codes, let the API handle error messages
            return response.json();
          })
          .then(data => {
            this.loading = false;
            
            // Check if login was successful based on the secure API response
            if (data && !data.error && data.username) {
              console.log('Login successful, user data:', data);
              
              // Set authentication state with user data
              this.$root.setAuthenticated(true, {
                username: data.username,
                id: data.id,
                email: data.email,
                // Include any other user fields returned by API
                ...data
              });
              
              this.$emit("authenticated", true);
              this.msg = "Login successful! Redirecting...";
              
              setTimeout(() => {
                this.$router.replace({ name: "home" });
              }, 1000);
            } else {
              // Login failed - show the error message from API
              this.msg = data.message || "Username or password incorrect.";
            }
          })
          .catch(error => {
            this.loading = false;
            this.msg = "Connection error. Please try again.";
            console.error('Login error:', error);
          });
      } else {
        // Form validation failed
        this.msg = "Please fill in all required fields correctly.";
      }
    },
    
    togglePassword() {
      this.showPassword = !this.showPassword;
    }
  },

  mounted() {
    if (this.$root.authenticated) {
      if (this.$router.hasRoute('dashboard')) {
        this.$router.replace({ name: "dashboard" });
      } else {
        this.$router.replace({ name: "home" });
      }
    }

    // Add scoped styles with a unique class prefix
    this.styleElement = document.createElement('style');
    this.styleElement.setAttribute('data-component', 'login');
    this.styleElement.textContent = `
      .login-component {
        margin-top: -13px;
        min-height: 100vh;
        background: #1a1a2e;
        position: relative;
        overflow-x: hidden;
      }

      .login-component::before {
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
      .login-component .login-hero-section {
        min-height: 100vh;
        position: relative;
        display: flex;
        align-items: center;
        z-index: 1;
      }

      .login-component .container {
        position: relative;
        z-index: 1;
        animation: loginFadeInUp 0.8s ease-out;
        max-width: 1140px;
      }

      /* Login Card - glassmorphism like profile cards */
      .login-component .login-card {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        overflow: hidden;
        opacity: 0;
        transform: translateY(50px);
        animation: loginMainSlideUp 0.8s ease-out 0.4s both;
        transition: all 0.3s ease;
        color: #f8f9fa;
      }

      .login-component .login-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        background: rgba(255,255,255,0.08);
      }

      .login-component .login-card .card-body {
        position: relative;
        z-index: 2;
        padding: 2.5rem !important;
        background: rgba(33, 37, 41, 0.8);
        backdrop-filter: blur(15px);
      }

      /* Section Title - matching profile header */
      .login-component .section-title {
        color: #f8f9fa;
        font-weight: 700;
        font-size: 2.5rem;
        margin-bottom: 1rem;
        text-align: center;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
        opacity: 0;
        transform: translateY(30px);
        animation: loginHeaderAnimateIn 0.8s ease-out 0.2s both;
      }

      .login-component .section-title::after {
        content: '';
        width: 80px;
        height: 4px;
        background: #007bff;
        margin: 1rem auto 0;
        display: block;
        border-radius: 2px;
      }

      /* Form Groups with staggered animation */
      .login-component .mb-3 {
        opacity: 0;
        transform: translateY(20px);
        animation: loginFormGroupAnimateIn 0.6s ease-out both;
      }

      .login-component .mb-3:nth-child(2) { animation-delay: 0.6s; }
      .login-component .mb-3:nth-child(3) { animation-delay: 0.7s; }
      .login-component .mb-3:nth-child(4) { animation-delay: 0.8s; }
      .login-component .mb-3:nth-child(5) { animation-delay: 0.9s; }

      /* Form Labels */
      .login-component .form-label {
        color: #ced4da;
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: block;
      }

      /* Input Groups */
      .login-component .input-group-text {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-right: none;
        color: #ced4da;
        transition: all 0.3s ease;
        border-radius: 8px 0 0 8px;
        backdrop-filter: blur(5px);
      }

      .login-component .form-control {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-left: none;
        border-radius: 0 8px 8px 0;
        color: #f8f9fa;
        padding: 0.75rem 1rem;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
      }

      .login-component .form-control::placeholder {
        color: #6c757d;
      }

      .login-component .form-control:focus {
        background: rgba(255,255,255,0.08);
        border-color: #007bff;
        box-shadow: 0 0 0 0.25rem rgba(0,123,255,0.25);
        color: #f8f9fa;
        transform: translateY(-2px);
      }

      .login-component .form-control:focus + .input-group-text,
      .login-component .input-group:focus-within .input-group-text {
        border-color: #007bff;
        background: rgba(0,123,255,0.1);
        color: #007bff;
        transform: translateY(-2px);
      }

      /* Password Toggle Button */
      .login-component .btn-outline-secondary {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-left: none;
        border-radius: 0 8px 8px 0;
        color: #ced4da;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
      }

      .login-component .btn-outline-secondary:hover {
        background: #007bff;
        border-color: #007bff;
        color: white;
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(0,123,255,0.3);
      }

      /* Form Text */
      .login-component .form-text {
        color: #6c757d;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      /* Submit Button - matching profile button styles */
      .login-component .btn-primary {
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
        animation: loginButtonAnimateIn 0.6s ease-out 1.0s both;
        box-shadow: 0 4px 15px rgba(0,123,255,0.3);
      }

      .login-component .btn-primary::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.2);
        transition: left 0.6s;
      }

      .login-component .btn-primary:hover::before {
        left: 100%;
      }

      .login-component .btn-primary:hover {
        background: #0056b3;
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0,123,255,0.4);
      }

      .login-component .btn-primary:disabled {
        background: #6c757d;
        cursor: not-allowed;
        opacity: 0.7;
        transform: none;
        box-shadow: none;
      }

      /* Alert Messages */
      .login-component .alert {
        border-radius: 12px;
        border: none;
        font-weight: 500;
        animation: loginAlertSlideIn 0.5s ease-out;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      }

      .login-component .alert-success {
        background: rgba(40, 167, 69, 0.9);
        color: #fff;
        border-left: 4px solid #28a745;
      }

      .login-component .alert-danger {
        background: rgba(220, 53, 69, 0.9);
        color: #fff;
        border-left: 4px solid #dc3545;
      }

      /* Additional Links */
      .login-component .btn-link {
        color: #007bff;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        opacity: 0;
        animation: loginFadeIn 0.6s ease-out 1.1s both;
      }

      .login-component .btn-link:hover {
        color: #0056b3;
        background: rgba(0,123,255,0.1);
        transform: translateY(-2px);
      }

      .login-component .text-muted {
        color: #6c757d !important;
        opacity: 0;
        animation: loginFadeIn 0.6s ease-out 1.1s both;
      }

      /* Loading Spinner */
      .login-component .spinner-border-sm {
        animation: loginSpin 1s linear infinite;
        color: #fff;
      }

      /* Keyframe Animations */
      @keyframes loginFadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes loginHeaderAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes loginMainSlideUp {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes loginFormGroupAnimateIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes loginButtonAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes loginFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes loginAlertSlideIn {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes loginSpin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .login-component .section-title {
          font-size: 2rem !important;
        }

        .login-component .login-card .card-body {
          padding: 2rem !important;
        }

        .login-component .form-control {
          font-size: 16px; /* Prevents zoom on iOS */
        }

        .login-component .btn-primary {
          font-size: 1rem;
          padding: 1rem 2rem;
        }
      }

      @media (max-width: 576px) {
        .login-component .container {
          padding: 0 1rem;
        }

        .login-component .login-card {
          border-radius: 15px;
        }

        .login-component .login-card .card-body {
          padding: 1.5rem !important;
        }

        .login-component .section-title {
          font-size: 1.75rem !important;
        }
      }

      /* Focus States for Accessibility */
      .login-component .btn:focus,
      .login-component .form-control:focus,
      .login-component .btn-link:focus {
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
    <main class="login-component">
      <div class="login-hero-section">
        <div class="login-hero-background"></div>
        <div class="login-hero-overlay"></div>
        <div class="container">
          <div class="row justify-content-md-center align-items-center min-vh-100">
            <div class="col col-lg-5">
              <div class="card login-card shadow-lg border-0 rounded-lg">
                <div class="card-body p-4">
                  <!-- Card Title -->
                  <div class="text-center mb-4">
                    <h2 class="section-title">Welcome Back</h2>
                  </div>
                  <!-- Login Form -->
                  <form ref="form" @submit.prevent="login()" novalidate>
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
                          @keyup.enter="login()"
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
                    <div class="d-grid gap-2 mb-3">
                      <button 
                        type="submit"
                        class="btn btn-primary btn-lg"
                        :disabled="!valid || loading"
                      >
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        Sign In
                      </button>
                    </div>
                    <div v-if="msg" class="alert" :class="msg.includes('successful') ? 'alert-success' : 'alert-danger'" role="alert">
                      {{ msg }}
                    </div>
                  </form>
                  <!-- Additional Links -->
                  <div class="text-center mt-3">
                    <p class="mb-1 text-muted">Don't have an account?</p>
                    <p><router-link class="btn btn-link" :to="{ name: 'register' }">Sign Up</router-link></p>
                    <p><router-link class="btn btn-link" :to="{ name: 'forgotpassword' }">Forgot Password?</router-link></p>
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