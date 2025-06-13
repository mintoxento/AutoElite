const ForgotPassword = {
  data() {
    return {
      input: {
        email: "",
        newPassword: ""
      },
      msg: "",
      loading: false,
      styleElement: null
    };
  },
  methods: {
    forgotPassword() {
      if (!this.input.email || !this.input.newPassword) {
        this.msg = "Both email and new password are required.";
        return;
      }
      this.loading = true;
      fetch("resources/api_reset_password.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          email: this.input.email, 
          newPassword: this.input.newPassword 
        })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          this.loading = false;
          if (data.success) {
            this.msg = "Password has been reset successfully!";
            // Redirect to login after a short delay.
            setTimeout(() => {
              this.$router.push({ name: 'login' });
            }, 2000);
          } else {
            this.msg = data.message || "Failed to reset password.";
          }
        })
        .catch(error => {
          this.loading = false;
          this.msg = "Connection error. Please try again.";
          console.error("Forgot password error:", error);
        });
    }
  },
  mounted() {
    this.styleElement = document.createElement("style");
    this.styleElement.setAttribute("data-component", "forgotpassword");
    this.styleElement.textContent = `
      .forgotpassword-component {
        margin-top: -13px;
        min-height: 100vh;
        background: #1a1a2e;
        position: relative;
        overflow-x: hidden;
      }
      .forgotpassword-component::before {
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
      .forgotpassword-component .forgotpassword-hero-section {
        min-height: 100vh;
        position: relative;
        display: flex;
        align-items: center;
        z-index: 1;
      }
      .forgotpassword-component .container {
        position: relative;
        z-index: 1;
        animation: forgotpasswordFadeInUp 0.8s ease-out;
        max-width: 1140px;
      }
      .forgotpassword-component .forgotpassword-card {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        overflow: hidden;
        opacity: 0;
        transform: translateY(50px);
        animation: forgotpasswordMainSlideUp 0.8s ease-out 0.4s both;
        transition: all 0.3s ease;
        color: #f8f9fa;
      }
      .forgotpassword-component .forgotpassword-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        background: rgba(255,255,255,0.08);
      }
      .forgotpassword-component .forgotpassword-card .card-body {
        position: relative;
        z-index: 2;
        padding: 2.5rem !important;
        background: rgba(33, 37, 41, 0.8);
        backdrop-filter: blur(15px);
      }
      .forgotpassword-component .section-title {
        color: #f8f9fa;
        font-weight: 700;
        font-size: 2.5rem;
        margin-bottom: 1rem;
        text-align: center;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
        opacity: 0;
        transform: translateY(30px);
        animation: forgotpasswordHeaderAnimateIn 0.8s ease-out 0.2s both;
      }
      .forgotpassword-component .section-title::after {
        content: '';
        width: 80px;
        height: 4px;
        background: #007bff;
        margin: 1rem auto 0;
        display: block;
        border-radius: 2px;
      }
      .forgotpassword-component .mb-3 {
        opacity: 0;
        transform: translateY(20px);
        animation: forgotpasswordFormGroupAnimateIn 0.6s ease-out both;
      }
      .forgotpassword-component .form-label {
        color: #ced4da;
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: block;
      }
      .forgotpassword-component .input-group-text {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-right: none;
        color: #ced4da;
        transition: all 0.3s ease;
        border-radius: 8px 0 0 8px;
        backdrop-filter: blur(5px);
      }
      .forgotpassword-component .form-control {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-left: none;
        border-radius: 0 8px 8px 0;
        color: #f8f9fa;
        padding: 0.75rem 1rem;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
      }
      .forgotpassword-component .form-control::placeholder {
        color: #6c757d;
      }
      .forgotpassword-component .form-control:focus {
        background: rgba(255,255,255,0.08);
        border-color: #007bff;
        box-shadow: 0 0 0 0.25rem rgba(0,123,255,0.25);
        color: #f8f9fa;
        transform: translateY(-2px);
      }
      .forgotpassword-component .d-grid {
        margin-top: 1rem;
      }
      .forgotpassword-component .btn-primary {
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
        animation: forgotpasswordButtonAnimateIn 0.6s ease-out 1.0s both;
        box-shadow: 0 4px 15px rgba(0,123,255,0.3);
      }
      .forgotpassword-component .btn-primary::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.2);
        transition: left 0.6s;
      }
      .forgotpassword-component .btn-primary:hover::before {
        left: 100%;
      }
      .forgotpassword-component .btn-primary:hover {
        background: #0056b3;
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0,123,255,0.4);
      }
      .forgotpassword-component .btn-primary:disabled {
        background: #6c757d;
        cursor: not-allowed;
        opacity: 0.7;
        transform: none;
        box-shadow: none;
      }
      .forgotpassword-component .alert {
        border-radius: 12px;
        border: none;
        font-weight: 500;
        animation: forgotpasswordAlertSlideIn 0.5s ease-out;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        margin-top: 1rem;
      }
      .forgotpassword-component .alert-success {
        background: rgba(40, 167, 69, 0.9);
        color: #fff;
        border-left: 4px solid #28a745;
      }
      .forgotpassword-component .alert-danger {
        background: rgba(220, 53, 69, 0.9);
        color: #fff;
        border-left: 4px solid #dc3545;
      }
      @keyframes forgotpasswordFadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes forgotpasswordHeaderAnimateIn {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes forgotpasswordMainSlideUp {
        from { opacity: 0; transform: translateY(50px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes forgotpasswordFormGroupAnimateIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes forgotpasswordButtonAnimateIn {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes forgotpasswordAlertSlideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
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
    <main class="forgotpassword-component">
      <div class="forgotpassword-hero-section">
        <div class="login-hero-background"></div>
        <div class="login-hero-overlay"></div>
        <div class="container">
          <div class="row justify-content-md-center align-items-center min-vh-100">
            <div class="col col-lg-5">
              <div class="card forgotpassword-card shadow-lg border-0 rounded-lg">
                <div class="card-body p-4">
                  <div class="text-center mb-4">
                    <h2 class="section-title">Reset Password</h2>
                  </div>
                  <form @submit.prevent="forgotPassword()" novalidate>
                    <div class="mb-3">
                      <label for="email" class="form-label">Email Address</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="mdi mdi-email"></i></span>
                        <input 
                          type="email" 
                          class="form-control" 
                          id="email"
                          v-model="input.email" 
                          placeholder="Enter your registered email" 
                          required
                        >
                      </div>
                    </div>
                    <div class="mb-3">
                      <label for="newPassword" class="form-label">New Password</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="mdi mdi-lock"></i></span>
                        <input 
                          type="password" 
                          class="form-control" 
                          id="newPassword"
                          v-model="input.newPassword" 
                          placeholder="Enter your new password" 
                          required
                        >
                      </div>
                    </div>
                    <div class="d-grid gap-2 mb-3">
                      <button 
                        type="submit"
                        class="btn btn-primary btn-lg"
                        :disabled="loading"
                      >
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        Reset Password
                      </button>
                    </div>
                    <div v-if="msg" class="alert" :class="msg.includes('successfully') ? 'alert-success' : 'alert-danger'" role="alert">
                      {{ msg }}
                    </div>
                  </form>
                  <div class="text-center mt-3">
                    <router-link class="btn btn-link" :to="{ name: 'login' }">Back to Login</router-link>
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