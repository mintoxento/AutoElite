const HomePage = {
  template: `
    <div class="homepage-wrapper">
      <!-- Hero Section -->
      <section class="hero-section position-relative overflow-hidden">
        <div class="w-100 p-0">
          <!-- Fixed Slogan -->
          <div class="slogan-overlay position-absolute w-100 text-center d-flex align-items-center justify-content-center" style="top: 0; height: 100%; z-index: 10;">
            <div class="hero-content">
              <h1 class="display-2 fw-bold text-white mb-4 hero-title" ref="heroTitle">AutoElite</h1>
              <p class="lead text-white fs-1 hero-subtitle" ref="heroSubtitle">"Where Luxury Meets Performance"</p>
              <div class="mt-5 hero-cta" ref="heroCta">
                <router-link to="/models" class="btn btn-primary btn-lg px-5 py-3 me-3 pulse-btn">Explore Collection</router-link>
                <button class="btn btn-outline-light btn-lg px-5 py-3">Schedule Test Drive</button>
              </div>
            </div>
          </div>
          <!-- Carousel Slideshow -->
          <div id="heroCarousel" class="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="5000">
            <div class="carousel-inner">
              <div class="carousel-item active">
                <div class="hero-slide" style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url('resources/images/hero-slide-1.jpg') center/cover;"></div>
              </div>
              <div class="carousel-item">
                <div class="hero-slide" style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url('resources/images/hero-slide-2.jpg') center/cover;"></div>
              </div>
              <div class="carousel-item">
                <div class="hero-slide" style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url('resources/images/hero-slide-3.jpg') center/cover;"></div>
              </div>
            </div>
            <div class="carousel-indicators">
              <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" class="active"></button>
              <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1"></button>
              <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2"></button>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section py-5 bg-dark text-white position-relative overflow-hidden">
        <div class="stats-bg-pattern"></div>
        <div class="container-fluid px-4">
          <div class="row justify-content-center">
            <div class="col-xl-10">
              <div class="row text-center g-4">
                <div class="col-lg-3 col-md-6" v-for="(stat, index) in stats" :key="index">
                  <div class="stat-item p-4 h-100" :ref="'stat' + index">
                    <div class="stat-icon mb-3">
                      <i :class="stat.icon + ' display-3 text-primary'"></i>
                    </div>
                    <div class="stat-number mb-2">
                      <h2 class="fw-bold text-white mb-0" :ref="'statNumber' + index">{{ stat.displayNumber }}</h2>
                    </div>
                    <p class="text-light fs-5 mb-0">{{ stat.label }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Cars Section -->
      <section class="featured-cars py-5 bg-light position-relative">
        <div class="container-fluid px-4">
          <div class="row justify-content-center">
            <div class="col-xl-10">
              <div class="section-header text-center mb-5" ref="featuredHeader">
                <h2 class="display-4 fw-bold mb-4 text-dark">Featured Vehicles</h2>
                <p class="lead text-muted fs-4">Discover our handpicked selection of premium automobiles</p>
                <div class="header-line mx-auto"></div>
              </div>
              
              <!-- Loading state -->
              <div v-if="isLoadingCars" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Loading featured vehicles...</p>
              </div>
              
              <!-- Cars display -->
              <div v-else-if="featuredCars.length > 0" class="row g-4">
                <div class="col-xl-4 col-lg-6" v-for="(car, index) in featuredCars" :key="car.id">
                  <div class="card h-100 border-0 car-card shadow-sm" :ref="'carCard' + index">
                    <div class="position-relative overflow-hidden card-img-container">
                      <img :src="car.image" class="card-img-top car-image" :alt="car.name">
                      <div class="car-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                        <div class="overlay-content text-center">
                          <router-link class="btn btn-primary btn-lg mb-3 overlay-btn" to="/models">
                            <i class="mdi mdi-eye me-2"></i>View Details
                          </router-link>
                        </div>
                      </div>
                      <div class="position-absolute top-0 end-0 m-3">
                        <span class="badge bg-primary fs-6 px-3 py-2">{{ car.status }}</span>
                      </div>
                    </div>
                    <div class="card-body p-4">
                      <h5 class="card-title fw-bold fs-4 mb-3">{{ car.name }}</h5>
                      <p class="card-text text-muted mb-4">{{ car.description }}</p>
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="h4 text-primary fw-bold mb-0">\${{ car.price.toLocaleString() }}</span>
                        <span class="badge bg-light text-dark fs-6 px-3 py-2">{{ car.year }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="text-center mt-5">
                <router-link class="btn btn-primary btn-lg px-5 py-3 view-all-btn" to="/models">
                  <i class="mdi mdi-car-multiple me-2"></i>View All Vehicles
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Brand Partners Section -->
      <section class="brand-partners py-5 bg-white">
        <div class="container-fluid px-4">
          <div class="row justify-content-center">
            <div class="col-xl-10">
              <div class="section-header text-center mb-5" ref="brandsHeader">
                <h2 class="display-4 fw-bold mb-4">Our Brand Partners</h2>
                <p class="lead text-muted fs-4">Authorized dealers for world's leading automotive brands</p>
                <div class="header-line mx-auto"></div>
              </div>
              <div class="row justify-content-center g-4">
                <div class="col-lg-2 col-md-3 col-4" v-for="(brand, index) in brandPartners" :key="brand.name">
                  <div class="brand-logo text-center p-4 bg-light rounded-3 h-100 d-flex align-items-center justify-content-center brand-item" :ref="'brand' + index">
                    <img :src="brand.logo" :alt="brand.name" class="img-fluid brand-img">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="testimonials py-5 bg-light">
        <div class="container-fluid px-4">
          <div class="row justify-content-center">
            <div class="col-xl-10">
              <div class="section-header text-center mb-5" ref="testimonialsHeader">
                <h2 class="display-4 fw-bold mb-4">What Our Customers Say</h2>
                <p class="lead text-muted fs-4">Real experiences from our valued clients</p>
                <div class="header-line mx-auto"></div>
              </div>
              <div class="row g-4">
                <div class="col-lg-4 col-md-6" v-for="(testimonial, index) in testimonials" :key="testimonial.id">
                  <div class="card h-100 border-0 shadow-sm testimonial-card" :ref="'testimonial' + index">
                    <div class="card-body text-center p-4">
                      <div class="mb-4">
                        <i class="mdi mdi-format-quote-open display-4 text-primary quote-icon"></i>
                      </div>
                      <p class="card-text mb-4 fs-5 text-muted fst-italic">{{ testimonial.review }}</p>
                      <div class="d-flex align-items-center justify-content-center mb-3">
                        <img :src="testimonial.avatar" :alt="testimonial.name" class="rounded-circle me-3 testimonial-avatar">
                        <div class="text-start">
                          <h6 class="mb-1 fw-bold fs-5">{{ testimonial.name }}</h6>
                          <small class="text-muted">{{ testimonial.title }}</small>
                        </div>
                      </div>
                      <div class="rating">
                        <span v-for="n in 5" :key="n" class="star">
                          <i class="mdi mdi-star" :class="n <= testimonial.rating ? 'text-warning' : 'text-muted'"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section (without Quick Contact Form) -->
      <section class="contact-section py-5 bg-black text-white position-relative overflow-hidden">
        <div class="contact-bg-pattern"></div>
        <div class="container-fluid px-4">
          <div class="row justify-content-center">
            <div class="col-xl-10">
              <div class="section-header text-center mb-5" ref="contactHeader">
                <h2 class="display-4 fw-bold mb-4 text-white">Get In Touch</h2>
                <p class="lead fs-4">Ready to find your dream car? Contact us today!</p>
                <div class="header-line mx-auto bg-primary"></div>
              </div>
              <div class="row g-4 mb-5">
                <div class="col-lg-4 col-md-6" v-for="(contact, index) in contactInfo" :key="index">
                  <div class="contact-item text-center p-4 h-100" :ref="'contact' + index">
                    <div class="contact-icon mb-3">
                      <i :class="contact.icon + ' display-4 text-primary'"></i>
                    </div>
                    <h5 class="fw-bold mb-3">{{ contact.title }}</h5>
                    <div class="text-light" v-html="contact.content"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  data() {
    return {
      stats: [
        { icon: 'mdi mdi-car-multiple', number: 500, displayNumber: '0', label: 'Premium Cars' },
        { icon: 'mdi mdi-account-group', number: 2000, displayNumber: '0', label: 'Happy Customers' },
        { icon: 'mdi mdi-calendar-check', number: 15, displayNumber: '0', label: 'Years Experience' },
        { icon: 'mdi mdi-trophy', number: 50, displayNumber: '0', label: 'Awards Won' }
      ],
      featuredCars: [],
      isLoadingCars: true,
      brandPartners: [
        { name: "BMW", logo: "resources/images/bmw.png" },
        { name: "Mercedes", logo: "resources/images/mercedes.png" },
        { name: "Honda", logo: "resources/images/honda.png" },
        { name: "Toyota", logo: "resources/images/toyota.png" },
        { name: "Chevrolet", logo: "resources/images/chevrolet.png" },
        { name: "Ford", logo: "resources/images/ford.png" }
      ],
      testimonials: [
        {
          id: 1,
          name: "Sarah Johnson",
          title: "Business Executive",
          review: "Exceptional service and quality! The team at AutoElite made my car buying experience seamless and truly enjoyable. Their attention to detail is unmatched.",
          rating: 5,
          avatar: "resources/images/sarah-johnson.jpg"
        },
        {
          id: 2,
          name: "Michael Chen",
          title: "Entrepreneur",
          review: "Found my dream car at AutoElite. Professional staff, transparent pricing, and excellent after-sales service. Couldn't be happier with my purchase.",
          rating: 5,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        },
        {
          id: 3,
          name: "Emma Williams",
          title: "Doctor",
          review: "Outstanding experience from start to finish. AutoElite truly understands luxury and customer satisfaction. Highly recommend to anyone seeking premium vehicles.",
          rating: 5,
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        }
      ],
      contactInfo: [
        {
          icon: 'mdi mdi-map-marker',
          title: 'Visit Us',
          content: '123 Elite Avenue<br>Luxury District<br>City, State 12345'
        },
        {
          icon: 'mdi mdi-phone',
          title: 'Call Us',
          content: 'Sales: (555) 123-4567<br>Service: (555) 123-4568'
        },
        {
          icon: 'mdi mdi-email',
          title: 'Email Us',
          content: 'sales@autoelite.com<br>service@autoelite.com'
        }
      ],
      animationObserver: null
    }
  },
  methods: {
    async loadFeaturedCars() {
      this.isLoadingCars = true;
      this.carsError = null;
      try {
        const path = 'resources/data/cars.json';
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        const carsData = await response.json();
        if (Array.isArray(carsData) && carsData.length > 0) {
          this.featuredCars = carsData.slice(0, 3);
        } else {
          throw new Error('Car data is empty or invalid');
        }
      } catch (error) {
        console.error('Error loading featured cars:', error);
        this.carsError = `Unable to load car data: ${error.message}`;
        this.featuredCars = [];
      } finally {
        this.isLoadingCars = false;
      }
    },
    animateCounter(element, target, duration = 2000) {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          element.textContent = target + '+';
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(start) + '+';
        }
      }, 16);
    },
    setupIntersectionObserver() {
      this.animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            if (entry.target.classList.contains('stat-item')) {
              const statItems = document.querySelectorAll('.stat-item');
              const index = Array.from(statItems).indexOf(entry.target);
              const numberElement = this.$refs['statNumber' + index];
              const actualElement = Array.isArray(numberElement) ? numberElement[0] : numberElement;
              if (actualElement && !actualElement.classList.contains('animated')) {
                actualElement.classList.add('animated');
                this.animateCounter(actualElement, this.stats[index].number);
              }
            }
          }
        });
      }, { threshold: 0.1 });
      this.$nextTick(() => {
        const elementsToObserve = [
          ...document.querySelectorAll('.stat-item'),
          ...document.querySelectorAll('.car-card'),
          ...document.querySelectorAll('.brand-item'),
          ...document.querySelectorAll('.testimonial-card'),
          ...document.querySelectorAll('.contact-item'),
          ...document.querySelectorAll('.section-header')
        ];
        elementsToObserve.forEach(el => {
          if (el) this.animationObserver.observe(el);
        });
      });
    }
  },
  async mounted() {
    const style = document.createElement('style');
    style.textContent = `
      .homepage-wrapper {
        margin-top: -13px;
        overflow-x: hidden;
      }
      /* Hero Section */
      .hero-slide {
        height: 100vh;
        min-height: 700px;
        position: relative;
      }
      .hero-title {
        animation: fadeInUp 1.2s ease-out;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
      }
      .hero-subtitle {
        animation: fadeInUp 1.2s ease-out 0.3s both;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
      }
      .hero-cta {
        animation: fadeInUp 1.2s ease-out 0.6s both;
      }
      .pulse-btn {
        animation: pulse 2s infinite;
      }
      /* Section Headers */
      .section-header {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease-out;
      }
      .section-header.animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      .header-line {
        width: 80px;
        height: 4px;
        background: linear-gradient(45deg, #007bff, #0056b3);
        margin-top: 1rem;
        border-radius: 2px;
      }
      /* Stats Section */
      .stats-section {
        position: relative;
      }
      .stats-bg-pattern {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 50%, rgba(0,123,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 50%, rgba(0,123,255,0.1) 0%, transparent 50%);
      }
      .stat-item {
        opacity: 0;
        transform: translateY(50px) scale(0.9);
        transition: all 0.8s ease-out;
        border-radius: 15px;
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
      }
      .stat-item.animate-in {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      .stat-item:hover {
        transform: translateY(-10px) scale(1.05);
        background: rgba(255,255,255,0.1);
      }
      .stat-icon {
        transition: transform 0.3s ease;
      }
      .stat-item:hover .stat-icon {
        transform: scale(1.2) rotateY(360deg);
      }
      /* Featured Cars */
      .car-card {
        opacity: 0;
        transform: translateY(50px);
        transition: all 0.8s ease-out;
        border-radius: 20px;
        overflow: hidden;
      }
      .car-card.animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      .car-card:hover {
        transform: translateY(-15px) scale(1.02);
        box-shadow: 0 25px 50px rgba(0,0,0,0.15) !important;
      }
      .card-img-container {
        height: 280px;
        border-radius: 20px 20px 0 0;
      }
      .car-image {
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
      .car-card:hover .car-image {
        transform: scale(1.1);
      }
      .car-overlay {
        background: rgba(0,0,0,0.8);
        opacity: 0;
        transition: all 0.4s ease;
        backdrop-filter: blur(5px);
      }
      .car-card:hover .car-overlay {
        opacity: 1;
      }
      .overlay-btn {
        transform: translateY(20px);
        transition: all 0.3s ease;
      }
      .car-card:hover .overlay-btn {
        transform: translateY(0);
      }
      .view-all-btn {
        transition: all 0.3s ease;
      }
      .view-all-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(0,123,255,0.3);
      }
      /* Brand Partners */
      .brand-item {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
        transition: all 0.6s ease-out;
        border-radius: 15px;
      }
      .brand-item.animate-in {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      .brand-item:hover {
        transform: translateY(-10px) scale(1.05);
        box-shadow: 0 15px 30px rgba(0,0,0,0.1);
      }
      .brand-img {
        max-height: 70px;
        filter: grayscale(100%) opacity(0.7);
        transition: all 0.4s ease;
      }
      .brand-item:hover .brand-img {
        filter: grayscale(0%) opacity(1);
        transform: scale(1.1);
      }
      /* Testimonials */
      .testimonial-card {
        opacity: 0;
        transform: translateY(50px);
        transition: all 0.8s ease-out;
        border-radius: 20px;
        background: linear-gradient(145deg, #ffffff, #f8f9fa);
      }
      .testimonial-card.animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      .testimonial-card:hover {
        transform: translateY(-10px) rotateX(5deg);
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      }
      .quote-icon {
        opacity: 0.3;
        transition: all 0.3s ease;
      }
      .testimonial-card:hover .quote-icon {
        opacity: 0.6;
        transform: scale(1.1);
      }
      .testimonial-avatar {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border: 3px solid #007bff;
        transition: transform 0.3s ease;
      }
      .testimonial-card:hover .testimonial-avatar {
        transform: scale(1.1);
      }
      .star {
        transition: transform 0.2s ease;
      }
      .testimonial-card:hover .star {
        transform: scale(1.2);
      }
      /* Contact Section */
      .contact-item {
        opacity: 0;
        transform: translateY(40px);
        transition: all 0.8s ease-out;
        border-radius: 15px;
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
      }
      .contact-item.animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      .contact-item:hover {
        transform: translateY(-10px);
        background: rgba(255,255,255,0.1);
      }
      .contact-icon {
        transition: all 0.3s ease;
      }
      .contact-item:hover .contact-icon {
        transform: scale(1.2) rotateY(360deg);
      }
      /* Keyframe Animations */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(0,123,255,0.7);
        }
        70% {
          box-shadow: 0 0 0 15px rgba(0,123,255,0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(0,123,255,0);
        }
      }
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes rotateIn {
        from {
          opacity: 0;
          transform: rotate(-180deg) scale(0.5);
        }
        to {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }
      }
      @media (max-width: 768px) {
        .hero-slide {
          height: 70vh;
          min-height: 500px;
        }
        .hero-title {
          font-size: 2.5rem !important;
        }
        .hero-subtitle {
          font-size: 1.2rem !important;
        }
        .hero-cta .btn {
          display: block;
          width: 100%;
          margin-bottom: 1rem;
        }
        .card-img-container {
          height: 220px;
        }
        .display-4 {
          font-size: 2rem !important;
        }
        .section-header .lead {
          font-size: 1.1rem !important;
        }
      }
      .carousel-indicators {
        bottom: 30px;
      }
      .carousel-indicators [data-bs-target] {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.5);
        background: transparent;
        transition: all 0.3s ease;
      }
      .carousel-indicators .active {
        background: #007bff;
        border-color: #007bff;
        transform: scale(1.2);
      }
      html {
        scroll-behavior: smooth;
      }
      .loading {
        opacity: 0.5;
        pointer-events: none;
      }
      .glass {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .hover-lift {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .hover-lift:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      }
      .car-card:nth-child(1) { animation-delay: 0.1s; }
      .car-card:nth-child(2) { animation-delay: 0.2s; }
      .car-card:nth-child(3) { animation-delay: 0.3s; }
      .stat-item:nth-child(1) { transition-delay: 0s; }
      .stat-item:nth-child(2) { transition-delay: 0.1s; }
      .stat-item:nth-child(3) { transition-delay: 0.2s; }
      .stat-item:nth-child(4) { transition-delay: 0.3s; }
      .brand-item:nth-child(1) { transition-delay: 0s; }
      .brand-item:nth-child(2) { transition-delay: 0.05s; }
      .brand-item:nth-child(3) { transition-delay: 0.1s; }
      .brand-item:nth-child(4) { transition-delay: 0.15s; }
      .brand-item:nth-child(5) { transition-delay: 0.2s; }
      .brand-item:nth-child(6) { transition-delay: 0.25s; }
      .testimonial-card:nth-child(1) { transition-delay: 0s; }
      .testimonial-card:nth-child(2) { transition-delay: 0.1s; }
      .testimonial-card:nth-child(3) { transition-delay: 0.2s; }
      .contact-item:nth-child(1) { transition-delay: 0s; }
      .contact-item:nth-child(2) { transition-delay: 0.1s; }
      .contact-item:nth-child(3) { transition-delay: 0.2s; }
    `;
    document.head.appendChild(style);
    
    // Load featured cars
    await this.loadFeaturedCars();

    // Setup intersection observer for animations
    this.setupIntersectionObserver();

    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const heroSlides = document.querySelectorAll('.hero-slide');
      heroSlides.forEach(slide => {
        slide.style.transform = `translateY(${scrolled * 0.5}px)`;
      });
    });

    // Initialize Bootstrap carousel with custom settings
    const carousel = document.querySelector('#heroCarousel');
    if (carousel) {
      // Add touch/swipe support
      let startX = null;
      let startY = null;

      carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      });

      carousel.addEventListener('touchmove', (e) => {
        if (!startX || !startY) return;

        const diffX = startX - e.touches[0].clientX;
        const diffY = startY - e.touches[0].clientY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 50) {
            // Swipe left - next slide
            bootstrap.Carousel.getInstance(carousel).next();
          } else if (diffX < -50) {
            // Swipe right - previous slide
            bootstrap.Carousel.getInstance(carousel).prev();
          }
        }

        startX = null;
        startY = null;
      });
    }
  },
  
  beforeUnmount() {
    if (this.animationObserver) {
      this.animationObserver.disconnect();
    }
    window.removeEventListener('scroll', () => {});
  }
};