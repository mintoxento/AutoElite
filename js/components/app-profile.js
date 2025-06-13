const Profile = {
  data() {
    return {
      user: {
        username: "",
        fullname: "",
        email: "",
        phone: "",
        address: "",
        profilepic: ""
      },
      msg: "",
      msgType: "",
      loading: false,
      formErrors: {},
      selectedFile: null,
      styleElement: null
    };
  },

  methods: {
    async getProfile() {
      if (!this.user.username) {
        this.showNotification("User not logged in.", "error");
        return;
      }

      try {
        const response = await fetch(`resources/api_profile.php?action=get&username=${encodeURIComponent(this.user.username)}`, {
          method: "GET",
          credentials: "include",
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          this.showNotification(data.message, "error");
        } else {
          this.user = { 
            username: this.user.username,
            fullname: data.fullname || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            profilepic: data.profilepic || ""
          };
        }
      } catch (error) {
        console.error("Error getting profile:", error);
        this.showNotification("Failed to load profile. Please try again.", "error");
      }
    },

    async updateProfile() {
      this.formErrors = {};

      if (!this.validateForm()) {
        return;
      }

      this.loading = true;

      const formData = new FormData();
      formData.append("username", this.user.username);
      formData.append("fullname", this.user.fullname);
      formData.append("email", this.user.email);
      formData.append("phone", this.user.phone);
      formData.append("address", this.user.address);
      if (this.selectedFile) {
        formData.append("profilepic", this.selectedFile);
      }

      try {
        const response = await fetch("resources/api_profile.php?action=update", {
          method: "POST",
          credentials: "include",
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          this.showNotification(data.message, "error");
        } else {
          this.showNotification("Profile updated successfully.", "success");
          if (data.profilepic) {
            this.user.profilepic = data.profilepic;
          }
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        this.showNotification("Failed to update profile. Please try again.", "error");
      } finally {
        this.loading = false;
      }
    },

    validateForm() {
      let isValid = true;

      if (this.user.email && this.user.email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.user.email)) {
          this.formErrors.email = "Please enter a valid email address.";
          isValid = false;
        }
      }

      if (this.user.fullname && this.user.fullname.length > 100) {
        this.formErrors.fullname = "Full name must be less than 100 characters.";
        isValid = false;
      }

      if (this.user.phone && this.user.phone.trim() !== "") {
        const phoneRegex = /^[0-9+\-\s()]+$/;
        if (!phoneRegex.test(this.user.phone)) {
          this.formErrors.phone = "Please enter a valid phone number.";
          isValid = false;
        }
      }

      if (this.user.address && this.user.address.length > 255) {
        this.formErrors.address = "Address must be less than 255 characters.";
        isValid = false;
      }

      if (!isValid) {
        this.showNotification("Please fix the form errors below.", "error");
      }
      return isValid;
    },

    handleFileUpload(evt) {
      const file = evt.target.files[0];
      if (file) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.user.profilepic = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    showNotification(message, type) {
      const notification = document.createElement('div');
      notification.className = `profile-notification profile-notification-${type} show`;
      notification.textContent = message;
      document.body.insertBefore(notification, document.body.firstChild);

      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    },

    setMessage(message, type) {
      this.msg = message;
      this.msgType = type;
    },

    clearMessage() {
      this.msg = "";
      this.msgType = "";
    },

    initializeUser() {
      const storedUser = sessionStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.username) {
            this.user.username = parsedUser.username;
            this.getProfile();
          } else {
            this.showNotification("Invalid user session. Please log in again.", "error");
          }
        } catch (e) {
          console.error("Error parsing user session:", e);
          this.showNotification("Error parsing user session. Please log in again.", "error");
        }
      } else {
        this.showNotification("No user session found. Please log in.", "error");
      }
    }
  },

  mounted() {
    this.initializeUser();

    this.styleElement = document.createElement('style');
    this.styleElement.setAttribute('data-component', 'profile');
    this.styleElement.textContent = `
      .profile-component {
        margin-top: -13px;
        min-height: 100vh;
        background: #1a1a2e;
        position: relative;
        overflow-x: hidden;
      }

      .profile-component::before {
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

      .profile-component .container {
        position: relative;
        z-index: 1;
        animation: profileFadeInUp 0.8s ease-out;
        max-width: 1140px;
      }

      /* Header Styles - matching homepage section headers */
      .profile-component .profile-header {
        text-align: center;
        margin-bottom: 3rem;
        padding: 2rem 0;
        opacity: 0;
        transform: translateY(30px);
        animation: profileHeaderAnimateIn 0.8s ease-out 0.2s both;
      }

      .profile-component .profile-header h1 {
        color: #f8f9fa;
        font-weight: 700;
        font-size: 3rem;
        margin-bottom: 0.5rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
      }

      .profile-component .profile-header .subtitle {
        color: #ced4da;
        font-size: 1.2rem;
        font-weight: 400;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
      }

      .profile-component .profile-header::after {
        content: '';
        width: 80px;
        height: 4px;
        background: #007bff;
        margin: 1rem auto 0;
        display: block;
        border-radius: 2px;
      }

      /* Main Profile Card - glassmorphism like homepage cards */
      .profile-component .profile-main {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        overflow: hidden;
        opacity: 0;
        transform: translateY(50px);
        animation: profileMainSlideUp 0.8s ease-out 0.4s both;
        transition: all 0.3s ease;
        color: #f8f9fa;
      }

      .profile-component .profile-main:hover {
        transform: translateY(-10px);
        box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        background: rgba(255,255,255,0.08);
      }

      /* Profile Picture Section */
      .profile-component .profile-picture-section {
        background: rgba(52, 58, 64, 0.8);
        backdrop-filter: blur(15px);
        padding: 2.5rem;
        border-right: 1px solid rgba(255,255,255,0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        min-height: 600px;
      }

      .profile-component .profile-picture-container {
        position: relative;
        margin-bottom: 2rem;
        opacity: 0;
        transform: translateY(30px) scale(0.9);
        animation: profileImageAnimateIn 0.8s ease-out 0.6s both;
      }

      .profile-component .profile-picture {
        width: 280px;
        height: 280px;
        border-radius: 50%;
        object-fit: cover;
        border: 6px solid #495057;
        box-shadow: 0 15px 35px rgba(0,0,0,0.4);
        transition: all 0.3s ease;
      }

      .profile-component .profile-picture:hover {
        transform: scale(1.05);
        box-shadow: 0 20px 45px rgba(0,0,0,0.5);
        border-color: #007bff;
      }

      .profile-component .upload-section {
        width: 100%;
        opacity: 0;
        transform: translateY(20px);
        animation: profileUploadAnimateIn 0.6s ease-out 0.8s both;
      }

      .profile-component .upload-label {
        display: block;
        color: #f8f9fa;
        font-weight: 600;
        margin-bottom: 1rem;
        font-size: 1.1rem;
        text-align: center;
      }

      .profile-component .file-input-wrapper {
        position: relative;
        overflow: hidden;
        display: inline-block;
        width: 100%;
      }

      .profile-component .file-input-custom {
        background: #007bff;
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        border: none;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        text-align: center;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0,123,255,0.3);
      }

      .profile-component .file-input-custom:hover {
        background: #0056b3;
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0,123,255,0.4);
      }

      .profile-component .file-input-custom::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.2);
        transition: left 0.6s;
      }

      .profile-component .file-input-custom:hover::before {
        left: 100%;
      }

      .profile-component .file-input-hidden {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }

      /* Form Section */
      .profile-component .profile-form-section {
        padding: 2.5rem;
        background: rgba(33, 37, 41, 0.8);
        backdrop-filter: blur(15px);
      }

      .profile-component .form-section-title {
        color: #f8f9fa;
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #495057;
        opacity: 0;
        transform: translateY(20px);
        animation: profileFormTitleAnimateIn 0.6s ease-out 0.7s both;
      }

      .profile-component .form-group {
        margin-bottom: 2rem;
        opacity: 0;
        transform: translateY(20px);
        animation: profileFormGroupAnimateIn 0.6s ease-out both;
      }

      /* Staggered animation delays for form groups */
      .profile-component .form-group:nth-child(1) { animation-delay: 0.8s; }
      .profile-component .form-group:nth-child(2) { animation-delay: 0.9s; }
      .profile-component .form-group:nth-child(3) { animation-delay: 1.0s; }
      .profile-component .form-group:nth-child(4) { animation-delay: 1.1s; }
      .profile-component .form-group:nth-child(5) { animation-delay: 1.2s; }
      .profile-component .form-group:nth-child(6) { animation-delay: 1.3s; }

      .profile-component .form-label {
        color: #ced4da;
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: block;
      }

      .profile-component .form-control {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        color: #f8f9fa;
        padding: 0.75rem 1rem;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
      }

      .profile-component .form-control:focus {
        background: rgba(255,255,255,0.08);
        border-color: #007bff;
        box-shadow: 0 0 0 0.25rem rgba(0,123,255,0.25);
        color: #f8f9fa;
      }

      .profile-component .form-control:disabled {
        background: rgba(108, 117, 125, 0.3);
        color: #adb5bd;
        cursor: not-allowed;
      }

      .profile-component .form-control::placeholder {
        color: #6c757d;
      }

      .profile-component .textarea {
        resize: vertical;
        min-height: 100px;
      }

      .profile-component .char-counter {
        font-size: 0.875rem;
        color: #6c757d;
        text-align: right;
        margin-top: 0.25rem;
      }

      .profile-component .char-counter.warning {
        color: #ffc107;
      }

      .profile-component .char-counter.danger {
        color: #dc3545;
      }

      .profile-component .invalid-feedback {
        display: block;
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .profile-component .is-invalid {
        border-color: #dc3545;
      }

      /* Submit Button - matching homepage button styles */
      .profile-component .btn-submit {
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
        margin-top: 1rem;
        opacity: 0;
        transform: translateY(30px);
        animation: profileButtonAnimateIn 0.6s ease-out 1.4s both;
        box-shadow: 0 4px 15px rgba(0,123,255,0.3);
      }

      .profile-component .btn-submit::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.2);
        transition: left 0.6s;
      }

      .profile-component .btn-submit:hover::before {
        left: 100%;
      }

      .profile-component .btn-submit:hover {
        background: #0056b3;
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0,123,255,0.4);
      }

      .profile-component .btn-submit:disabled {
        background: #6c757d;
        cursor: not-allowed;
        opacity: 0.7;
        transform: none;
        box-shadow: none;
      }

      /* Loading Overlay */
      .profile-component .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(33, 37, 41, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20px;
        backdrop-filter: blur(5px);
        z-index: 10;
      }

      .profile-component .spinner-border {
        color: #007bff;
      }

      /* Notification Styles - matching homepage notifications */
      .profile-notification {
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

      .profile-notification.show {
        opacity: 1;
      }

      .profile-notification-success {
        background: rgba(40, 167, 69, 0.9);
        border-left: 4px solid #28a745;
      }

      .profile-notification-error {
        background: rgba(220, 53, 69, 0.9);
        border-left: 4px solid #dc3545;
      }

      /* Keyframe Animations */
      @keyframes profileFadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes profileHeaderAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes profileMainSlideUp {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes profileImageAnimateIn {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes profileUploadAnimateIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes profileFormTitleAnimateIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes profileFormGroupAnimateIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes profileButtonAnimateIn {
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
        .profile-component .profile-header h1 {
          font-size: 2.5rem !important;
        }

        .profile-component .profile-header .subtitle {
          font-size: 1.1rem !important;
        }

        .profile-component .profile-picture {
          width: 200px;
          height: 200px;
        }

        .profile-component .profile-picture-section {
          min-height: auto;
          padding: 2rem 1.5rem;
        }

        .profile-component .profile-form-section {
          padding: 2rem 1.5rem;
        }

        .profile-component .form-section-title {
          font-size: 1.5rem;
        }

        .profile-component .btn-submit {
          padding: 1rem 2rem;
          font-size: 1rem;
        }
      }

      @media (max-width: 576px) {
        .profile-component .container {
          padding: 0 1rem;
        }

        .profile-component .profile-main {
          border-radius: 15px;
        }

        .profile-component .profile-picture {
          width: 150px;
          height: 150px;
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
    <main class="profile-component">
      <div class="container py-5">
        <!-- Header Section -->
        <header class="profile-header">
          <h1>My Profile</h1>
          <p class="subtitle">Manage your personal information and preferences</p>
        </header>
        
        <!-- Main Profile Content -->
        <div class="profile-main">
          <div class="row g-0">
            <!-- Profile Picture Section -->
            <div class="col-lg-4 profile-picture-section">
              <div>
                <div class="profile-picture-container">
                  <img 
                    :src="user.profilepic || 'resources/images/default-profile-pic.png'" 
                    class="profile-picture" 
                    alt="Profile Picture"
                  >
                </div>
                <div class="upload-section">
                  <label class="upload-label">Update Profile Picture</label>
                  <div class="file-input-wrapper">
                    <input 
                      type="file" 
                      class="file-input-hidden" 
                      id="profilepic" 
                      @change="handleFileUpload" 
                      accept="image/*"
                    >
                    <label for="profilepic" class="file-input-custom">
                      <i class="mdi mdi-upload me-1"></i>
                      Choose New Photo
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <!-- Form Section -->
            <div class="col-lg-8">
              <div class="profile-form-section">
                <h2 class="form-section-title">Personal Information</h2>
                <form v-if="user.username" @submit.prevent="updateProfile()" novalidate>
                  <div class="form-group">
                    <label for="username" class="form-label">
                      Username
                    </label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="username" 
                      v-model="user.username" 
                      disabled 
                      readonly
                    >
                  </div>
                  <div class="form-group">
                    <label for="fullname" class="form-label">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      class="form-control" 
                      :class="{ 'is-invalid': formErrors.fullname }" 
                      id="fullname"
                      v-model="user.fullname" 
                      placeholder="Enter your full name" 
                      maxlength="100" 
                    >
                    <div class="char-counter" :class="{ 'warning': user.fullname && user.fullname.length > 80, 'danger': user.fullname && user.fullname.length > 95 }">
                      {{ user.fullname ? user.fullname.length : 0 }}/100
                    </div>
                    <div v-if="formErrors.fullname" class="invalid-feedback">
                      {{ formErrors.fullname }}
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="email" class="form-label">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      class="form-control" 
                      :class="{ 'is-invalid': formErrors.email }" 
                      id="email"
                      v-model="user.email" 
                      placeholder="Enter your email address" 
                    >
                    <div v-if="formErrors.email" class="invalid-feedback">
                      {{ formErrors.email }}
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="phone" class="form-label">
                      Phone Number
                    </label>
                    <input 
                      type="text" 
                      class="form-control" 
                      :class="{ 'is-invalid': formErrors.phone }" 
                      id="phone" 
                      v-model="user.phone" 
                      placeholder="Enter your phone number" 
                    >
                    <div v-if="formErrors.phone" class="invalid-feedback">
                      {{ formErrors.phone }}
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="address" class="form-label">
                      Address
                    </label>
                    <textarea 
                      class="form-control textarea" 
                      :class="{ 'is-invalid': formErrors.address }" 
                      id="address" 
                      v-model="user.address" 
                      placeholder="Enter your complete address" 
                      rows="4" 
                      maxlength="255" 
                    ></textarea>
                    <div class="char-counter" :class="{ 'warning': user.address && user.address.length > 200, 'danger': user.address && user.address.length > 240 }">
                      {{ user.address ? user.address.length : 0 }}/255
                    </div>
                    <div v-if="formErrors.address" class="invalid-feedback">
                      {{ formErrors.address }}
                    </div>
                  </div>
                  <div class="form-group">
                    <button type="submit" class="btn-submit" :disabled="loading">
                      <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      <i v-if="!loading" class="fas fa-save me-2"></i>
                      {{ loading ? 'Saving Changes...' : 'Save Changes' }}
                    </button>
                  </div>
                </form>
                <!-- Loading State for Initial Load -->
                <div v-else class="text-center py-5">
                  <div class="spinner-border mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="text-muted">Loading your profile information...</p>
                </div>
              </div>
            </div>
          </div>
          <!-- Loading Overlay -->
          <div v-if="loading" class="loading-overlay">
            <div class="text-center">
              <div class="spinner-border mb-3" role="status">
                <span class="visually-hidden">Saving...</span>
              </div>
              <p class="mb-0 text-muted">Updating your profile...</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  `
};