import React, { useState, useEffect } from 'react';
  import { Link } from 'react-router-dom';
  import { getPublicProducts, getPublicWorkshops, getPublicProductImage } from '../services/api';

  function Home() {
    const [products, setProducts] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [productImages, setProductImages] = useState({});
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [prodRes, workRes] = await Promise.all([getPublicProducts(), getPublicWorkshops()]);
          
          // Randomly select 9 products from all available products
          const allProducts = prodRes.data || [];
          const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
          const selectedProducts = shuffled.slice(0, 9);
          
          console.log('Selected 9 random products:', selectedProducts.map(p => p.name));
          setProducts(selectedProducts);
          setWorkshops(workRes.data.slice(0, 5)); // 5 ateliers

          // Fetch images for selected products
          const imageUrls = {};
          for (const product of selectedProducts) {
            if (product.images && product.images.length > 0) {
              try {
                const response = await getPublicProductImage(product._id, 0);
                imageUrls[product._id] = URL.createObjectURL(response.data);
              } catch (err) {
                console.error('Failed to fetch image for product ID:', product._id, err);
              }
            }
          }
          setProductImages(imageUrls);
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
        }
      };
      fetchData();
    }, []);

    // Cleanup image URLs when component unmounts
    useEffect(() => {
      return () => {
        Object.values(productImages).forEach(url => {
          if (url) URL.revokeObjectURL(url);
        });
      };
    }, [productImages]);

    // Group products into slides of 3
    const productsPerSlide = 3;
    const totalSlides = Math.ceil(products.length / productsPerSlide);
    const productSlides = [];
    for (let i = 0; i < products.length; i += productsPerSlide) {
      productSlides.push(products.slice(i, i + productsPerSlide));
    }
    
    console.log('Total slides:', totalSlides);
    console.log('Products per slide:', productSlides.map((slide, index) => 
      `Slide ${index + 1}: ${slide.map(p => p.name).join(', ')}`
    ));

    const nextSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

  return (
    <div style={{ 
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif', 
      backgroundColor: '#faf9f7', 
      color: '#2c3e50', 
      margin: 0, 
      padding: 0, 
      minHeight: '100vh', 
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Hero Section */}
      <header style={{ 
        background: 'linear-gradient(135deg, #8a5a44 0%, #d4a373 50%, #8a5a44 100%)', 
        color: '#fff', 
        textAlign: 'center', 
        padding: '200px 20px 150px', 
        position: 'relative', 
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '50%',
          filter: 'blur(25px)',
          animation: 'float 7s ease-in-out infinite'
        }}></div>

        {/* Main Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '50px',
            fontSize: '1.1em',
            fontWeight: '600',
            marginBottom: '30px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            ✨ Plateforme d'artisanat premium
          </div>

          <h1 style={{ 
            fontSize: 'clamp(3.5rem, 8vw, 6rem)', 
            fontWeight: '800', 
            margin: '0 0 30px', 
            textShadow: '4px 4px 8px rgba(0,0,0,0.3)',
            background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
            lineHeight: '1.1'
          }}>
            Bienvenue sur CraftHub
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', 
            margin: '0 auto 60px', 
            maxWidth: '900px', 
            lineHeight: '1.6',
            opacity: 0.95,
            fontWeight: '400'
          }}>
            Entrez dans un sanctuaire de l'artisanat où chaque création raconte une histoire, 
            soutient des artisans passionnés et préserve notre patrimoine culturel.
          </p>
          
          <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '50px' }}>
            <Link to="/register" style={{ 
              padding: '20px 45px', 
              backgroundColor: 'rgba(255,255,255,0.15)', 
              color: '#fff', 
              textDecoration: 'none', 
              borderRadius: '50px', 
              fontWeight: '700', 
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(15px)',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              fontSize: '1.1em',
              position: 'relative',
              overflow: 'hidden'
            }} onMouseOver={e => { 
              e.target.style.backgroundColor = 'rgba(255,255,255,0.25)'; 
              e.target.style.transform = 'translateY(-4px) scale(1.05)'; 
              e.target.style.boxShadow = '0 20px 50px rgba(0,0,0,0.25)';
            }} onMouseOut={e => { 
              e.target.style.backgroundColor = 'rgba(255,255,255,0.15)'; 
              e.target.style.transform = 'translateY(0) scale(1)'; 
              e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
            }}>
              🚀 Devenez membre
            </Link>
            
            <Link to="/login" style={{ 
              padding: '20px 45px', 
              backgroundColor: '#fff', 
              color: '#8a5a44', 
              textDecoration: 'none', 
              borderRadius: '50px', 
              fontWeight: '700', 
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              fontSize: '1.1em',
              position: 'relative',
              overflow: 'hidden'
            }} onMouseOver={e => { 
              e.target.style.backgroundColor = '#f8f9fa'; 
              e.target.style.transform = 'translateY(-4px) scale(1.05)'; 
              e.target.style.boxShadow = '0 20px 50px rgba(0,0,0,0.3)';
            }} onMouseOut={e => { 
              e.target.style.backgroundColor = '#fff'; 
              e.target.style.transform = 'translateY(0) scale(1)'; 
              e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
            }}>
              🔐 Se connecter
            </Link>
          </div>

          {/* Stats Preview */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '60px',
            flexWrap: 'wrap',
            marginTop: '40px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5em', fontWeight: '800', marginBottom: '8px' }}>150+</div>
              <div style={{ fontSize: '1em', opacity: 0.9 }}>Artisans</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5em', fontWeight: '800', marginBottom: '8px' }}>300+</div>
              <div style={{ fontSize: '1em', opacity: 0.9 }}>Créations</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5em', fontWeight: '800', marginBottom: '8px' }}>50+</div>
              <div style={{ fontSize: '1em', opacity: 0.9 }}>Ateliers</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          animation: 'bounce 2s infinite'
        }}>
          <span style={{ fontSize: '0.9em', opacity: 0.8 }}>Découvrir</span>
          <div style={{
            width: '2px',
            height: '30px',
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '2px'
          }}></div>
        </div>
      </header>

        {/* Section Valeurs */}
        <section style={{ 
          maxWidth: '1400px', 
          margin: '120px auto', 
          padding: '100px 40px', 
          backgroundColor: '#fff', 
          borderRadius: '40px', 
          boxShadow: '0 25px 80px rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          {/* Decorative background elements */}
          <div style={{
            position: 'absolute',
            top: '-150px',
            right: '-150px',
            width: '300px',
            height: '300px',
            background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
            borderRadius: '50%',
            opacity: 0.03,
            filter: 'blur(60px)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            borderRadius: '50%',
            opacity: 0.04,
            filter: 'blur(40px)'
          }}></div>
          
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: 'rgba(138, 90, 68, 0.1)',
              color: '#8a5a44',
              padding: '8px 20px',
              borderRadius: '25px',
              fontSize: '1em',
              fontWeight: '600',
              marginBottom: '20px',
              border: '1px solid rgba(138, 90, 68, 0.2)'
            }}>
              💎 Nos Valeurs
            </div>
            <h2 style={{ 
              color: '#2c3e50', 
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
              fontWeight: '800', 
              margin: '0 0 20px',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
              Fondamentales
            </h2>
            <p style={{
              color: '#5a6c7d',
              fontSize: '1.2em',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Les principes qui guident notre mission et façonnent chaque interaction
            </p>
          </div>

          {/* Values Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '40px',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Value 1 */}
            <div style={{ 
              padding: '50px 40px', 
              background: 'linear-gradient(135deg, #f8f9fa, #ffffff)', 
              borderRadius: '25px', 
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '2px solid rgba(138, 90, 68, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }} onMouseOver={e => {
              e.target.style.transform = 'translateY(-12px) scale(1.02)';
              e.target.style.boxShadow = '0 25px 50px rgba(0,0,0,0.12)';
              e.target.style.borderColor = 'rgba(138, 90, 68, 0.3)';
            }} onMouseOut={e => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
              e.target.style.borderColor = 'rgba(138, 90, 68, 0.1)';
            }}>
              {/* Decorative corner */}
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                borderRadius: '0 25px 0 80px',
                opacity: 0.1
              }}></div>
              
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2em',
                marginBottom: '25px',
                boxShadow: '0 8px 25px rgba(138, 90, 68, 0.3)'
              }}>
                🌍
              </div>
              
              <h3 style={{ 
                fontSize: '1.8em', 
                margin: '0 0 20px', 
                color: '#2c3e50', 
                fontWeight: '700',
                letterSpacing: '-0.01em'
              }}>
                Artisanat Local
              </h3>
              <p style={{ 
                color: '#5a6c7d', 
                lineHeight: '1.7', 
                fontSize: '1.1em',
                margin: '0 0 25px'
              }}>
                Nous honorons les traditions en soutenant les artisans de nos régions avec fierté et respect.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#8a5a44',
                fontSize: '0.9em',
                fontWeight: '600'
              }}>
                <span>→</span>
                <span>Découvrir nos artisans</span>
              </div>
            </div>

            {/* Value 2 */}
            <div style={{ 
              padding: '50px 40px', 
              background: 'linear-gradient(135deg, #f8f9fa, #ffffff)', 
              borderRadius: '25px', 
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '2px solid rgba(138, 90, 68, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }} onMouseOver={e => {
              e.target.style.transform = 'translateY(-12px) scale(1.02)';
              e.target.style.boxShadow = '0 25px 50px rgba(0,0,0,0.12)';
              e.target.style.borderColor = 'rgba(138, 90, 68, 0.3)';
            }} onMouseOut={e => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
              e.target.style.borderColor = 'rgba(138, 90, 68, 0.1)';
            }}>
              {/* Decorative corner */}
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                borderRadius: '0 25px 0 80px',
                opacity: 0.1
              }}></div>
              
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2em',
                marginBottom: '25px',
                boxShadow: '0 8px 25px rgba(138, 90, 68, 0.3)'
              }}>
                ♻️
              </div>
              
              <h3 style={{ 
                fontSize: '1.8em', 
                margin: '0 0 20px', 
                color: '#2c3e50', 
                fontWeight: '700',
                letterSpacing: '-0.01em'
              }}>
                Durabilité
              </h3>
              <p style={{ 
                color: '#5a6c7d', 
                lineHeight: '1.7', 
                fontSize: '1.1em',
                margin: '0 0 25px'
              }}>
                Nos créations utilisent des matériaux écologiques pour construire un avenir meilleur et responsable.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#8a5a44',
                fontSize: '0.9em',
                fontWeight: '600'
              }}>
                <span>→</span>
                <span>Notre engagement vert</span>
              </div>
            </div>

            {/* Value 3 */}
            <div style={{ 
              padding: '50px 40px', 
              background: 'linear-gradient(135deg, #f8f9fa, #ffffff)', 
              borderRadius: '25px', 
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '2px solid rgba(138, 90, 68, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }} onMouseOver={e => {
              e.target.style.transform = 'translateY(-12px) scale(1.02)';
              e.target.style.boxShadow = '0 25px 50px rgba(0,0,0,0.12)';
              e.target.style.borderColor = 'rgba(138, 90, 68, 0.3)';
            }} onMouseOut={e => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
              e.target.style.borderColor = 'rgba(138, 90, 68, 0.1)';
            }}>
              {/* Decorative corner */}
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                borderRadius: '0 25px 0 80px',
                opacity: 0.1
              }}></div>
              
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2em',
                marginBottom: '25px',
                boxShadow: '0 8px 25px rgba(138, 90, 68, 0.3)'
              }}>
                🎨
              </div>
              
              <h3 style={{ 
                fontSize: '1.8em', 
                margin: '0 0 20px', 
                color: '#2c3e50', 
                fontWeight: '700',
                letterSpacing: '-0.01em'
              }}>
                Créativité Partagée
              </h3>
              <p style={{ 
                color: '#5a6c7d', 
                lineHeight: '1.7', 
                fontSize: '1.1em',
                margin: '0 0 25px'
              }}>
                Participez à des ateliers pour apprendre, créer et transmettre votre art dans une communauté bienveillante.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#8a5a44',
                fontSize: '0.9em',
                fontWeight: '600'
              }}>
                <span>→</span>
                <span>Rejoindre nos ateliers</span>
              </div>
            </div>
          </div>
        </section>



        {/* Produits en vedette - Swiper */}
        <section style={{ 
          maxWidth: '1400px', 
          margin: '100px auto', 
          padding: '80px 40px', 
          backgroundColor: '#fff', 
          borderRadius: '30px', 
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background elements */}
          <div style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(45deg, #d4a373, #8a5a44)',
            borderRadius: '50%',
            opacity: 0.05
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            left: '-50px',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(45deg, #8a5a44, #d4a373)',
            borderRadius: '50%',
            opacity: 0.05
          }}></div>

          <h2 style={{ 
            color: '#8a5a44', 
            fontSize: '3.2em', 
            fontWeight: 700, 
            textAlign: 'center', 
            marginBottom: '60px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>Produits en vedette</h2>
          
            {products.length > 0 ? (
            <div style={{ position: 'relative', width: '100%' }}>
              {/* Swiper Container */}
              <div style={{
                display: 'flex',
                overflow: 'hidden',
                borderRadius: '20px',
                position: 'relative',
                width: '100%',
                maxWidth: '1000px',
                margin: '0 auto',
                height: 'auto',
                minHeight: '500px'
              }}>
                <div style={{
                  display: 'flex',
                  transform: `translateX(-${currentSlide * 100}%)`,
                  transition: 'transform 0.5s ease-in-out',
                  width: `${totalSlides * 100}%`,
                  height: 'auto',
                  minWidth: '100%'
                }}>
                  {productSlides.map((slide, slideIndex) => (
                    <div key={slideIndex} style={{
                      width: '100%',
                      display: 'flex',
                      gap: '15px',
                      padding: '0 15px',
                      flexShrink: 0,
                      justifyContent: 'center',
                      alignItems: 'stretch',
                      minHeight: '500px'
                    }}>
                      {slide.map((product) => (
                        <div key={product._id} style={{
                          width: 'calc(33.333% - 20px)',
                          flex: '0 0 calc(33.333% - 20px)',
                          backgroundColor: '#faf3e9',
                          borderRadius: '20px',
                          overflow: 'visible',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(212, 163, 115, 0.2)',
                          position: 'relative',
                          height: '100%',
                          minHeight: '400px',
                          maxWidth: '300px',
                          display: 'flex',
                          flexDirection: 'column'
                        }} onMouseOver={e => {
                          e.target.style.transform = 'translateY(-8px) scale(1.02)';
                          e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                        }} onMouseOut={e => {
                          e.target.style.transform = 'translateY(0) scale(1)';
                          e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                        }}>
                          {/* Product Image */}
                          <div style={{
                            height: '200px',
                            background: productImages[product._id] 
                              ? `url(${productImages[product._id]}) center/cover` 
                              : 'linear-gradient(135deg, #d4a373, #8a5a44)',
                            position: 'relative',
                            overflow: 'hidden',
                            flexShrink: 0
                          }}>
                            {!productImages[product._id] && (
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontSize: '3em',
                                color: '#fff',
                                opacity: 0.7
                              }}>🛍️</div>
                            )}
                            {/* Price Badge */}
                            <div style={{
                              position: 'absolute',
                              top: '15px',
                              right: '15px',
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              color: '#8a5a44',
                              padding: '8px 15px',
                              borderRadius: '20px',
                              fontWeight: 600,
                              fontSize: '1.1em',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                            }}>
                              {product.price} €
                            </div>
                          </div>
                          
                          {/* Product Info */}
                          <div style={{ 
                            padding: '25px',
                            flex: '1',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}>
                            <div>
                              <h3 style={{ 
                                fontSize: '1.3em', 
                                margin: '0 0 10px', 
                                color: '#8a5a44',
                                fontWeight: 600,
                                lineHeight: '1.3',
                                wordWrap: 'break-word'
                              }}>{product.name}</h3>
                              <p style={{ 
                                color: '#d4a373', 
                                fontSize: '0.85em',
                                fontWeight: 500,
                                margin: '0 0 15px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                wordWrap: 'break-word'
                              }}>{product.category}</p>
                            </div>
                            <p style={{ 
                              color: '#5c4b38', 
                              fontSize: '0.9em', 
                              lineHeight: '1.4',
                              margin: '0',
                              wordWrap: 'break-word'
                            }}>Fabriqué à la main avec amour et dévotion par un artisan local.</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              <button 
                onClick={prevSlide}
                style={{
                  position: 'absolute',
                  left: '-60px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5em',
                  color: '#8a5a44',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={e => {
                  e.target.style.backgroundColor = '#8a5a44';
                  e.target.style.color = '#fff';
                  e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseOut={e => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.9)';
                  e.target.style.color = '#8a5a44';
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                ‹
              </button>
              
              <button 
                onClick={nextSlide}
                style={{
                  position: 'absolute',
                  right: '-60px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5em',
                  color: '#8a5a44',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={e => {
                  e.target.style.backgroundColor = '#8a5a44';
                  e.target.style.color = '#fff';
                  e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseOut={e => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.9)';
                  e.target.style.color = '#8a5a44';
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                ›
              </button>

              {/* Dots Indicator */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '40px'
              }}>
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: index === currentSlide ? '#8a5a44' : '#d4a373',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={e => {
                      e.target.style.transform = 'scale(1.2)';
                    }}
                    onMouseOut={e => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: '#5c4b38', textAlign: 'center', width: '100%', fontSize: '1.2em' }}>Aucun produit disponible pour le moment.</p>
          )}
        </section>

        {/* Ateliers à venir */}
        <section style={{ maxWidth: '1400px', margin: '100px auto', padding: '60px 40px', backgroundColor: '#fff', borderRadius: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
          <h2 style={{ color: '#8a5a44', fontSize: '3em', fontWeight: 700, textAlign: 'center', marginBottom: '50px' }}>Ateliers à venir</h2>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '40px' }}>
            {workshops.length > 0 ? (
              workshops.map((w) => (
                <div key={w._id} style={{ flex: '1', minWidth: '280px', padding: '30px', backgroundColor: '#faf3e9', borderRadius: '15px', boxShadow: '0 6px 12px rgba(0,0,0,0.1)', transition: 'transform 0.3s' }} onMouseOver={e => (e.target.style.transform = 'scale(1.05)')} onMouseOut={e => (e.target.style.transform = 'scale(1)')}>
                  <h3 style={{ fontSize: '1.6em', margin: '0 0 15px', color: '#8a5a44' }}>{w.title}</h3>
                  <p style={{ color: '#5c4b38' }}>{new Date(w.date).toLocaleDateString()}</p>
                  <p style={{ color: '#5c4b38', fontSize: '1em', marginTop: '15px' }}>Une opportunité unique d’apprendre avec des maîtres artisans.</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#5c4b38', textAlign: 'center', width: '100%' }}>Aucun atelier programmé pour le moment.</p>
            )}
          </div>
        </section>


        {/* Guide pour débutants */}
        <section style={{ maxWidth: '1400px', margin: '100px auto', padding: '60px 40px', backgroundColor: '#fff', borderRadius: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
          <h2 style={{ color: '#8a5a44', fontSize: '3em', fontWeight: 700, textAlign: 'center', marginBottom: '50px' }}>Guide pour les Débutants</h2>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '40px' }}>
            <div style={{ flex: '1', minWidth: '280px', padding: '30px', backgroundColor: '#faf3e9', borderRadius: '15px', transition: 'transform 0.3s' }} onMouseOver={e => (e.target.style.transform = 'scale(1.05)')} onMouseOut={e => (e.target.style.transform = 'scale(1)')}>
              <h3 style={{ fontSize: '1.6em', margin: '0 0 15px', color: '#8a5a44' }}>Comment commencer ?</h3>
              <p style={{ color: '#5c4b38', lineHeight: '1.7' }}>Inscrivez-vous, explorez nos produits et rejoignez un atelier pour débuter votre voyage créatif.</p>
            </div>
            <div style={{ flex: '1', minWidth: '280px', padding: '30px', backgroundColor: '#faf3e9', borderRadius: '15px', transition: 'transform 0.3s' }} onMouseOver={e => (e.target.style.transform = 'scale(1.05)')} onMouseOut={e => (e.target.style.transform = 'scale(1)')}>
              <h3 style={{ fontSize: '1.6em', margin: '0 0 15px', color: '#8a5a44' }}>Devenir Artisan</h3>
              <p style={{ color: '#5c4b38', lineHeight: '1.7' }}>Créez un compte, ajoutez vos œuvres et connectez-vous avec des clients passionnés.</p>
            </div>
          </div>
        </section>

        {/* Statistiques d'impact */}
        <section style={{ maxWidth: '1400px', margin: '100px auto', padding: '60px 40px', backgroundColor: '#faf3e9', borderRadius: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#8a5a44', fontSize: '3em', fontWeight: 700, textAlign: 'center', marginBottom: '50px' }}>Notre Impact</h2>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '40px', textAlign: 'center' }}>
            <div style={{ flex: '1', minWidth: '200px', padding: '20px' }}>
              <p style={{ fontSize: '2.5em', color: '#d4a373', margin: '0' }}>150+</p>
              <p style={{ color: '#5c4b38', fontSize: '1.2em' }}>Artisans soutenus</p>
            </div>
            <div style={{ flex: '1', minWidth: '200px', padding: '20px' }}>
              <p style={{ fontSize: '2.5em', color: '#d4a373', margin: '0' }}>300+</p>
              <p style={{ color: '#5c4b38', fontSize: '1.2em' }}>Produits uniques</p>
            </div>
            <div style={{ flex: '1', minWidth: '200px', padding: '20px' }}>
              <p style={{ fontSize: '2.5em', color: '#d4a373', margin: '0' }}>50+</p>
              <p style={{ color: '#5c4b38', fontSize: '1.2em' }}>Ateliers organisés</p>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section style={{ maxWidth: '1400px', margin: '100px auto', padding: '60px 40px', backgroundColor: '#fff', borderRadius: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
          <h2 style={{ color: '#8a5a44', fontSize: '3em', fontWeight: 700, textAlign: 'center', marginBottom: '40px' }}>Restez informé</h2>
          <p style={{ color: '#5c4b38', textAlign: 'center', marginBottom: '30px', fontSize: '1.2em' }}>Abonnez-vous pour recevoir les dernières nouvelles, ateliers et offres exclusives.</p>
          <form style={{ display: 'flex', justifyContent: 'center', gap: '15px', maxWidth: '600px', margin: '0 auto' }}>
            <input type="email" placeholder="Votre email" style={{ padding: '18px 25px', border: '2px solid #d4a373', borderRadius: '30px', flex: '1', fontSize: '1.1em', color: '#3a2f1a', outline: 'none' }} />
            <button type="submit" style={{ padding: '18px 40px', backgroundColor: '#8a5a44', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: 600, transition: 'background-color 0.3s, transform 0.3s' }} onMouseOver={e => { e.target.style.backgroundColor = '#704838'; e.target.style.transform = 'scale(1.1)'; }} onMouseOut={e => { e.target.style.backgroundColor = '#8a5a44'; e.target.style.transform = 'scale(1)'; }}>S'abonner</button>
          </form>
        </section>

        {/* À propos */}
        <section style={{ maxWidth: '1400px', margin: '100px auto', padding: '60px 40px', backgroundColor: '#faf3e9', borderRadius: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#8a5a44', fontSize: '3em', fontWeight: 700, textAlign: 'center', marginBottom: '50px' }}>À propos de CraftHub</h2>
          <p style={{ color: '#5c4b38', textAlign: 'center', maxWidth: '900px', margin: '0 auto 30px', fontSize: '1.2em', lineHeight: '1.8' }}>
            CraftHub est née de la passion pour l’artisanat et le désir de connecter les créateurs avec ceux qui apprécient leur travail. Fondée en 2024, notre mission est de préserver les métiers traditionnels tout en innovant pour un avenir durable. Rejoignez-nous pour faire partie de cette aventure humaine !
          </p>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/about" style={{ 
              padding: '18px 40px', 
              background: 'linear-gradient(135deg, #d4a373, #c68e5d)', 
              color: '#fff', 
              textDecoration: 'none', 
              borderRadius: '50px', 
              fontWeight: 600, 
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(212, 163, 115, 0.3)',
              border: '2px solid rgba(255,255,255,0.2)'
            }} onMouseOver={e => { 
              e.target.style.background = 'linear-gradient(135deg, #c68e5d, #b87a4a)'; 
              e.target.style.transform = 'translateY(-3px) scale(1.05)'; 
              e.target.style.boxShadow = '0 12px 35px rgba(212, 163, 115, 0.4)';
            }} onMouseOut={e => { 
              e.target.style.background = 'linear-gradient(135deg, #d4a373, #c68e5d)'; 
              e.target.style.transform = 'translateY(0) scale(1)'; 
              e.target.style.boxShadow = '0 8px 25px rgba(212, 163, 115, 0.3)';
            }}>En savoir plus</Link>
          </div>
        </section>

        {/* ===== Modern Footer ===== */}
        <footer style={{
          background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
          color: '#fff',
          padding: '60px 0 40px',
          marginTop: '80px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(45deg, #d4a373, #8a5a44)',
            borderRadius: '50%',
            opacity: 0.1
          }}></div>
          
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '10%',
            width: '60px',
            height: '60px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            opacity: 0.3
          }}></div>
          
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '15%',
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            opacity: 0.2
          }}></div>

          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 30px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            alignItems: 'start'
          }}>
            {/* Company Info */}
            <div style={{ textAlign: 'left' }}>
              <h3 style={{
                fontSize: '1.8em',
                fontWeight: 700,
                marginBottom: '20px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                CraftHub
              </h3>
              <p style={{
                fontSize: '1.1em',
                lineHeight: '1.6',
                marginBottom: '20px',
                opacity: 0.9
              }}>
                Votre plateforme de confiance pour découvrir et acheter des produits artisanaux authentiques. 
                Connectons les artisans talentueux avec des clients passionnés.
              </p>
              <div style={{
                display: 'flex',
                gap: '15px',
                marginTop: '20px'
              }}>
                <a href="https://facebook.com/crafthub" style={{
                  color: '#fff',
                  fontSize: '1.5em',
                  transition: 'transform 0.3s ease',
                  textDecoration: 'none'
                }} onMouseOver={(e) => e.target.style.transform = 'scale(1.2)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                  📘
                </a>
                <a href="https://instagram.com/crafthub" style={{
                  color: '#fff',
                  fontSize: '1.5em',
                  transition: 'transform 0.3s ease',
                  textDecoration: 'none'
                }} onMouseOver={(e) => e.target.style.transform = 'scale(1.2)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                  📷
                </a>
                <a href="https://twitter.com/crafthub" style={{
                  color: '#fff',
                  fontSize: '1.5em',
                  transition: 'transform 0.3s ease',
                  textDecoration: 'none'
                }} onMouseOver={(e) => e.target.style.transform = 'scale(1.2)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                  🐦
                </a>
              </div>
            </div>

            {/* Call to Action */}
            <div>
              <h4 style={{
                fontSize: '1.3em',
                fontWeight: 600,
                marginBottom: '20px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}>
                Rejoignez-nous
              </h4>
              <p style={{
                fontSize: '1em',
                lineHeight: '1.6',
                marginBottom: '25px',
                opacity: 0.9
              }}>
                Inscrivez-vous pour explorer des créations uniques ou partagez votre talent avec le monde.
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                <Link to="/register" style={{
                  padding: '15px 30px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontWeight: 600,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }} onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }} onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}>
                  Devenez membre
                </Link>
                <Link to="/login" style={{
                  padding: '15px 30px',
                  backgroundColor: '#fff',
                  color: '#8a5a44',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontWeight: 600,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }} onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f8f1e9';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                }} onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                }}>
                  Se connecter
                </Link>
              </div>
            </div>

            {/* Contact Info */}
          <div>
              <h4 style={{
                fontSize: '1.3em',
                fontWeight: 600,
                marginBottom: '20px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}>
                Contact
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1em'
                }}>
                  <span style={{ fontSize: '1.2em' }}>📧</span>
                  <a href="mailto:contact@crafthub.com" style={{
                    color: '#fff',
                    textDecoration: 'none',
                    transition: 'opacity 0.3s ease'
                  }} onMouseOver={(e) => e.target.style.opacity = '0.8'} onMouseOut={(e) => e.target.style.opacity = '1'}>
                    contact@crafthub.com
                  </a>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1em'
                }}>
                  <span style={{ fontSize: '1.2em' }}>📞</span>
                  <span>+33 1 23 45 67 89</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1em'
                }}>
                  <span style={{ fontSize: '1.2em' }}>📍</span>
                  <span>123 Rue de l'Artisanat<br />75001 Paris, France</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.2)',
            marginTop: '40px',
            paddingTop: '20px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '0.9em',
              opacity: 0.8,
              margin: 0
            }}>
              © 2025 CraftHub. Tous droits réservés. | 
              <a href="/privacy" style={{ color: '#fff', textDecoration: 'none', marginLeft: '10px' }}>Confidentialité</a> | 
              <a href="/terms" style={{ color: '#fff', textDecoration: 'none', marginLeft: '10px' }}>Conditions</a>
            </p>
          </div>
        </footer>

        {/* CSS Animations */}
        <style>{`
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg); 
            }
            50% { 
              transform: translateY(-20px) rotate(5deg); 
            }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1); 
            }
            50% { 
              transform: scale(1.05); 
            }
          }
          
          @keyframes shimmer {
            0% { 
              background-position: -200px 0; 
            }
            100% { 
              background-position: calc(200px + 100%) 0; 
            }
          }
          
          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }
          
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #8a5a44, #d4a373);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #704838, #c19a6b);
          }
          
          /* Selection styling */
          ::selection {
            background: rgba(138, 90, 68, 0.2);
            color: #2c3e50;
          }
          
          /* Focus styles for accessibility */
          a:focus, button:focus {
            outline: 2px solid #8a5a44;
            outline-offset: 2px;
          }
          
          /* Responsive text sizing */
          @media (max-width: 768px) {
            .hero-title {
              font-size: 2.5rem !important;
            }
            
            .hero-subtitle {
              font-size: 1.1rem !important;
            }
          }
          
          /* Loading animation for images */
          img {
            transition: opacity 0.3s ease;
          }
          
          img[src=""] {
            opacity: 0;
          }
          
          /* Hover effects for cards */
          .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .card-hover:hover {
            transform: translateY(-8px);
          }
          
          /* Gradient text effect */
          .gradient-text {
            background: linear-gradient(135deg, #8a5a44, #d4a373);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          /* Glass morphism effect */
          .glass {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          /* Shimmer effect for loading states */
          .shimmer {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200px 100%;
            animation: shimmer 1.5s infinite;
          }
        `}</style>
      </div>
    );
  }

  export default Home;