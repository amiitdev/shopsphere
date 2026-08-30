import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: "/images/slideshow/slide-01.png",
    title: "Immersive Sound",
    subtitle: "Premium wireless headphones with industry-leading noise cancellation",
    ctaText: "Shop Audio",
    ctaHref: "/product/1",
  },
  {
    id: 2,
    image: "/images/slideshow/slide-02.png",
    title: "Type in Style",
    subtitle: "Low-profile mechanical keyboard with customizable RGB lighting",
    ctaText: "Explore Keyboards",
    ctaHref: "/product/2",
  },
  {
    id: 3,
    image: "/images/slideshow/slide-03.png",
    title: "Time Redefined",
    subtitle: "Titanium smartwatch with sapphire crystal and all-day battery",
    ctaText: "View Watches",
    ctaHref: "/product/3",
  },
  {
    id: 4,
    image: "/images/slideshow/slide-04.png",
    title: "Capture Perfection",
    subtitle: "Full-frame mirrorless camera for professional creators",
    ctaText: "Shop Cameras",
    ctaHref: "/product/4",
  },
  {
    id: 5,
    image: "/images/slideshow/slide-05.png",
    title: "Audiophile Grade",
    subtitle: "Planar magnetic headphones with natural, open soundstage",
    ctaText: "Discover Audio",
    ctaHref: "/product/5",
  },
  {
    id: 6,
    image: "/images/slideshow/slide-06.png",
    title: "Expand Your View",
    subtitle: "Ultra-wide 4K curved monitor for immersive productivity",
    ctaText: "Explore Displays",
    ctaHref: "/product/6",
  },
  {
    id: 7,
    image: "/images/slideshow/slide-07.png",
    title: "Crafted Journeys",
    subtitle: "Handcrafted leather messenger bag with brass hardware",
    ctaText: "Shop Bags",
    ctaHref: "/product/7",
  },
  {
    id: 8,
    image: "/images/slideshow/slide-08.png",
    title: "Ritual Elevated",
    subtitle: "Artisan ceramic coffee set for the perfect morning brew",
    ctaText: "Explore Home",
    ctaHref: "/product/8",
  },
];

export default function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, nextSlide]);

  const currentSlide = SLIDES[currentIndex];

  return (
    <div
      className="hero-slideshow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Product showcase"
    >
      {/* Background image with smooth transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          className="slideshow-bg"
          style={{ backgroundImage: `url(${currentSlide.image})` }}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </AnimatePresence>

      {/* Overlay gradient */}
      <div className="slideshow-overlay" />

      {/* Content */}
      <div className="slideshow-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            className="slideshow-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.span
              className="slideshow-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Featured Collection
            </motion.span>
            <motion.h1
              className="slideshow-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {currentSlide.title}
            </motion.h1>
            <motion.p
              className="slideshow-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {currentSlide.subtitle}
            </motion.p>
            <motion.a
              className="btn btn-primary btn-lg slideshow-cta"
              href={currentSlide.ctaHref}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {currentSlide.ctaText}
              <span className="cta-arrow">→</span>
            </motion.a>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <motion.button
        className="slideshow-nav prev"
        onClick={prevSlide}
        aria-label="Previous slide"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </motion.button>
      <motion.button
        className="slideshow-nav next"
        onClick={nextSlide}
        aria-label="Next slide"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </motion.button>

      {/* Dot indicators */}
      <div className="slideshow-dots" role="tablist" aria-label="Slide indicators">
        {SLIDES.map((slide, index) => (
          <motion.button
            key={slide.id}
            className={`slideshow-dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => goToSlide(index)}
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`Go to slide ${index + 1}`}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.8 }}
            animate={{ scale: index === currentIndex ? 1.25 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        ))}
      </div>

      {/* Progress bar for auto-advance */}
      {!isHovered && (
        <motion.div
          className="slideshow-progress"
          key={currentIndex}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 5, ease: "linear" }}
        />
      )}
    </div>
  );
}