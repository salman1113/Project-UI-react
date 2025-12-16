import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import CountUp from 'react-countup';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Import axios

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/products/');

        let data = response.data;

        // 1. Check for Pagination (DRF returns data in 'results')
        if (data.results) {
          data = data.results;
        }

        // 2. Filter Active Products (Use 'is_active' instead of 'isActive')
        // Note: If your backend filters this automatically, you can remove this filter.
        const activeProducts = Array.isArray(data)
          ? data.filter(p => p.is_active !== false)
          : [];

        setProducts(activeProducts);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E2E2B6]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-8">
        <p>Error loading products: {error}</p>
      </div>
    );
  }

  // If no products found
  if (products.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No featured products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      {products.slice(0, 4).map((product) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-50px" }}
          whileHover={{ y: -5 }}
          className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
        >
          <Link to={`/product/${product.id}`} className="block h-full flex flex-col">
            <div className="relative pb-[100%] bg-gray-700">
              <img
                // 3. FIXED IMAGE HANDLING (Checks for 'image' or 'images')
                src={product.image || (product.images && product.images[0]) || "https://via.placeholder.com/400"}
                alt={product.name}
                className="absolute top-0 left-0 w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400?text=No+Image"
                }}
              />
            </div>
            <div className="p-4 sm:p-6 flex flex-col flex-grow">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 truncate">{product.name}</h3>
              <p className="text-gray-300 text-sm sm:text-base mb-3 line-clamp-2 flex-grow">
                {product.description}
              </p>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-[#E2E2B6] font-bold text-lg sm:text-xl">
                  ₹ {Number(product.price).toLocaleString()}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#E2E2B6] text-gray-900 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium"
                >
                  View Details
                </motion.button>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

const Home = () => {
  const swiperRef = useRef(null);
  // ... (Logos and Slides arrays remain unchanged)
  const logos = [
    "https://cdn.shopify.com/s/files/1/0548/8849/7221/files/logo_white_text_blue.png",
    "https://cdn.shopify.com/s/files/1/0548/8849/7221/files/logo_white_text_blue.png",
    "https://cdn.shopify.com/s/files/1/0548/8849/7221/files/logo_white_text_blue.png",
    "https://cdn.shopify.com/s/files/1/0548/8849/7221/files/logo_white_text_blue.png",
    "https://cdn.shopify.com/s/files/1/0548/8849/7221/files/logo_white_text_blue.png",
    "https://cdn.shopify.com/s/files/1/0548/8849/7221/files/logo_white_text_blue.png"
  ];

  const slides = [
    {
      id: 1,
      image: "https://www.apple.com/v/airpods-max/i/images/overview/bento/midnight/bento_1_airpod_max_midnight__4jy1tkqh9qay_xlarge_2x.jpg",
      mobileImage: "https://www.apple.com/v/airpods-max/i/images/overview/bento/midnight/bento_1_airpod_max_midnight__4jy1tkqh9qay_small_2x.jpg",
      title: "Apple Always",
      subtitle: "Discover the latest trends",
      description: "Up to 30% off on selected items",
      buttonText: "Shop Now"
    },
    {
      id: 2,
      image: "https://www.apple.com/v/airpods-max/i/images/overview/bento/starlight/bento_1_airpod_max_starlight__f7v0k5blkzqm_xlarge_2x.jpg",
      mobileImage: "https://www.apple.com/v/airpods-max/i/images/overview/bento/starlight/bento_1_airpod_max_starlight__f7v0k5blkzqm_small_2x.jpg",
      title: "Premium Quality",
      subtitle: "Crafted with perfection",
      description: "Experience unmatched quality and comfort",
      buttonText: "Explore"
    },
    {
      id: 3,
      image: "https://www.apple.com/v/airpods-max/i/images/overview/bento/purple/bento_1_airpod_max_purple__2udwesqoiyq2_xlarge_2x.jpg",
      mobileImage: "https://www.apple.com/v/airpods-max/i/images/overview/bento/purple/bento_1_airpod_max_purple__2udwesqoiyq2_small_2x.jpg",
      title: "New Arrivals",
      subtitle: "Fresh from the runway",
      description: "Be the first to own these exclusive pieces",
      buttonText: "View Collection"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const sectionAnimation = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.8, ease: [0.16, 0.77, 0.47, 0.97] }
  };

  const staggeredAnimation = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <div className="mx-auto bg-gradient-to-br from-[#0a192f] via-[#0f1b32] to-[#020617] sm">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full overflow-hidden">
        <div className="relative bg-black py-4">
          <motion.div
            className="flex"
            animate={{
              x: ['0%', '-100%'],
            }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
            }}>
            {[...logos, ...logos].map((logo, index) => (
              <div key={index} className="flex-shrink-0 px-4 sm:px-8 bg-black">
                <img
                  src={logo}
                  alt={`Logo ${index}`}
                  className="h-8 sm:h-12 object-contain"
                  loading="lazy" />
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <section className="mb-8 sm:mb-12 w-full h-[50vh] sm:h-[60vh] md:h-[80vh] max-h-[800px] relative">
        <Swiper
          ref={swiperRef}
          modules={[Autoplay, EffectFade]}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="h-full w-full">
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="relative">
              <picture>
                <source media="(max-width: 640px)" srcSet={slide.mobileImage} />
                <source media="(min-width: 641px)" srcSet={slide.image} />
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  loading="lazy" />
              </picture>

              <div className="absolute inset-0 bg-black/30 z-10" />

              <div className="absolute inset-0 z-20 flex items-center">
                <div className="container mx-auto px-4 sm:px-6">
                  {/* ALIGNMENT: Left-aligned for standard professional look (removed mx-auto and text-center) */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-lg text-white" >
                    <motion.p variants={itemVariants} className="text-sm sm:text-base font-medium mb-1 sm:mb-2">
                      {slide.subtitle}
                    </motion.p>
                    <motion.h1
                      variants={itemVariants}
                      className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-2 sm:mb-4">
                      {slide.title}
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-sm sm:text-base md:text-lg mb-3 sm:mb-6">
                      {slide.description}
                    </motion.p>
                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-black px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm rounded-full font-medium">
                      <Link to='/products'>
                        {slide.buttonText}
                      </Link>
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <motion.section
        {...sectionAnimation}
        className="py-12 sm:py-16 md:py-20">

        {/* The container for the three counters */}
        <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

          {/* 1. Happy Customers (CENTERED) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true, margin: "-50px" }}
            className="p-4 rounded-lg">

            {/* Icon: Centered using mx-auto */}
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#E2E2B6] mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657A8 8 0 016.343 5.343M17.657 16.657L20 19m-4.343-2.343l-1.657-1.657m-4.343-2.343L12 12m0 0l-2.343-2.343m2.343 2.343l2.343 2.343m-2.343-2.343L9.657 9.657m1.686-2.657L12 5m-2 7a2 2 0 11-4 0 2 2 0 014 0zM12 21a9 9 0 00-6.183-1.85A1 1 0 015 17.5V17m7 4a9 9 0 006.183-1.85A1 1 0 0019 17.5V17" />
            </svg>

            <h2 className="text-4xl sm:text-6xl md:text-6xl lg:text-7xl font-bold mb-1">
              <motion.span className="text-white">
                <CountUp
                  end={100000}
                  duration={3}
                  separator=","
                  delay={0.5} />
                +
              </motion.span>
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-gray-400">
              Happy Customers
            </p>
          </motion.div>

          {/* 2. Products Shipped (CENTERED) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, margin: "-50px" }}
            className="p-4 rounded-lg border-y-2 border-gray-700/50 md:border-y-0 md:border-x-2">

            {/* Icon: Centered using mx-auto */}
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#E2E2B6] mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 5h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>

            <h2 className="text-4xl sm:text-6xl md:text-6xl lg:text-7xl font-bold mb-1">
              <motion.span className="text-white">
                <CountUp
                  end={500000}
                  duration={3.5}
                  separator=","
                  delay={0.7} />
                +
              </motion.span>
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-gray-400">
              Products Shipped
            </p>
          </motion.div>

          {/* 3. Years in Business (CENTERED) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true, margin: "-50px" }}
            className="p-4 rounded-lg">

            {/* Icon: Centered using mx-auto */}
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#E2E2B6] mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>

            <h2 className="text-4xl sm:text-6xl md:text-6xl lg:text-7xl font-bold mb-1">
              <motion.span className="text-white">
                <CountUp
                  end={10}
                  duration={2}
                  delay={0.9} />
                +
              </motion.span>
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-gray-400">
              Years in Business
            </p>
          </motion.div>

        </div>
      </motion.section>

      <motion.section
        {...sectionAnimation}
        className="mb-8 sm:mb-12 md:mb-16 w-full">
        <div className="relative w-full h-0 pb-[75%] sm:pb-[56.25%] overflow-hidden rounded-lg sm:rounded-xl">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover">
            <source src="https://www.apple.com/105/media/us/airpods-max/2024/e8f376d6-82b2-40ca-8a22-5f87de755d6b/anim/max-loop/xlarge_2x.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4 sm:px-6">
              <motion.div
                className="max-w-md md:max-w-lg lg:max-w-xl text-[#E2E2B6]"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }} >
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }} >
                  AirPods Max
                </motion.h1>

                <motion.h2
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-4"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }} >
                  Symphonic boom.
                </motion.h2>

                <motion.p
                  className="text-sm sm:text-base md:text-lg text-gray-200 mb-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}   >
                  Experience the perfect harmony of high-fidelity audio and cutting-edge design.
                  Our premium headphones deliver immersive sound with adaptive EQ, active
                  noise cancellation, and spatial audio for a theater-like experience.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#E2E2B6] text-black px-6 py-3 rounded-full font-medium text-sm sm:text-base">
                    <Link to='/products'>
                      Shop Now

                    </Link>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-[#E2E2B6] text-[#E2E2B6] px-6 py-3 rounded-full font-medium text-sm sm:text-base" >
                    Learn More
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
      <motion.section
        {...sectionAnimation}
        className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#0a192f] to-[#020617]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}>
            Featured Products
          </motion.h2>

          <FeaturedProducts />
        </div>
      </motion.section>

      <motion.section
        {...sectionAnimation}
        className="mb-8 sm:mb-12 md:mb-16 w-full overflow-hidden">
        <div className="relative w-full h-0 pb-[100%] sm:pb-[75%] md:pb-[50%]">
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ scale: 1.2 }}
            whileInView={{ scale: 1 }}
            transition={{
              duration: 1.8,
              ease: [0.16, 0.77, 0.47, 0.97]
            }}
            viewport={{ once: true, margin: "-100px" }}>
            <motion.img
              src="https://www.apple.com/v/airpods-max/i/images/overview/product-stories/hifi-sound/audio_airpod_max__filcqiddcmye_xlarge_2x.jpg"
              alt="Premium Audio Experience"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0.8 }}
              whileInView={{ opacity: 1 }}
              transition={{
                duration: 1.2,
                ease: "easeOut"
              }} />
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 to-black/30 px-4">
            <motion.div
              className="text-center text-white max-w-2xl mx-auto"
              initial="hidden"
              whileInView="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.3
                  }
                }
              }}
              viewport={{ once: true, margin: "-50px" }} >
              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.8,
                      ease: [0.33, 1, 0.68, 1]
                    }
                  }
                }}>
                Premium Audio Experience
              </motion.h2>

              <motion.p
                className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8"
                variants={{
                  hidden: { y: 15, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.7,
                      ease: [0.33, 1, 0.68, 1],
                      delay: 0.2
                    }
                  }
                }}>
                Immerse yourself in high-fidelity sound with our latest audio technology
              </motion.p>

              <motion.div
                variants={{
                  hidden: { y: 10, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.6,
                      ease: [0.33, 1, 0.68, 1],
                      delay: 0.4
                    }
                  }
                }}>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{
                    scale: 0.98,
                    transition: { duration: 0.1 }
                  }}
                  className="bg-[#E2E2B6] text-black px-6 py-3 sm:px-8 sm:py-4 rounded-full font-medium text-sm sm:text-base">
                  Explore Audio Products
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        {...sectionAnimation}
        className="mb-8 sm:mb-12 md:mb-16 bg-gradient-to-r from-gray-900 to-indigo-900 p-6 sm:p-8 md:p-12 rounded-xl sm:rounded-2xl" >
        <motion.h2
          initial={{ y: 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12 text-white">
          Why Choose Us?
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {[
            {
              icon: (
                <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-0 mb-4 sm:mb-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ),
              title: "Quality Products",
              description: "We source only the highest quality products from trusted suppliers worldwide."
            },
            {
              icon: (
                <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-0 mb-4 sm:mb-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: "Best Prices",
              description: "Competitive pricing without compromising on quality or customer service."
            },
            {
              icon: (
                <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-0 mb-4 sm:mb-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              ),
              title: "Fast Shipping",
              description: "Quick and reliable delivery with real-time tracking to your doorstep."
            }].map((item, index) => (
              <motion.div
                key={index}
                {...staggeredAnimation}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                className="bg-gray-800 p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow text-white" // ALIGNMENT: Removed text-center
                whileHover={{
                  y: -5,
                  transition: { duration: 0.3 }
                }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="inline-block" >
                  {item.icon}
                </motion.div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-300">{item.description}</p>
              </motion.div>
            ))}
        </div>
      </motion.section>

      <motion.section
        {...sectionAnimation}
        className="mb-8 sm:mb-12 md:mb-16 bg-gradient-to-r from-gray-900 to-[#0A0F2C] text-[#E2E2B6] p-6 sm:p-8 md:p-10 lg:p-12 rounded-xl sm:rounded-2xl" >
        <div className="max-w-3xl mx-auto text-left"> {/* ALIGNMENT: Changed text-center to text-left */}
          <motion.h2
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Stay Updated
          </motion.h2>
          <motion.p
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8">
            Subscribe to our newsletter for the latest products and exclusive offers.
          </motion.p>
          <motion.div
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-full"> {/* ALIGNMENT: Removed max-w-md mx-auto to align left */}
            <motion.input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-2 sm:py-3 rounded-full text-gray-900 focus:outline-none text-sm sm:text-base"
              whileFocus={{
                scale: 1.02,
                boxShadow: "0 0 0 2px rgba(225, 219, 104, 1)"
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 px-4 py-2 sm:px-6 sm:py-3 rounded-full font-bold text-sm sm:text-base" >
              Subscribe
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;