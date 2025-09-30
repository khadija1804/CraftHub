import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProduct, updateProduct } from '../services/api';
import ArtisanHeader from '../components/ArtisanHeader';
import ArtisanFooter from '../components/ArtisanFooter';
import NotificationToast from '../components/NotificationToast';
import useNotification from '../hooks/useNotification';

function EditProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState({ name: '', price: 0, category: '', images: [null, null, null], stock: 0, description: '' });
  const [imageUrls, setImageUrls] = useState([null, null, null]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    if (dataLoaded) return; // Ne pas recharger si les données sont déjà chargées
    
    const fetchProduct = async () => {
      try {
        const res = await getProduct(id);
        const data = res.data || { name: '', price: 0, category: '', images: [null, null, null], stock: 0, description: '' };
        // S'assurer que le stock est un nombre valide
        if (data.stock === undefined || data.stock === null || isNaN(data.stock)) {
          data.stock = 0;
        }
        // S'assurer que le tableau d'images a toujours 3 éléments
        if (data.images && data.images.length < 3) {
          while (data.images.length < 3) {
            data.images.push(null);
          }
        } else if (!data.images) {
          data.images = [null, null, null];
        }
        console.log('Fetched product data:', data); // Log pour débogage
        console.log('Product category:', data.category); // Log pour voir la catégorie
        console.log('Product stock:', data.stock); // Log pour voir le stock
        setProduct(data);
        setDataLoaded(true);
      } catch (err) {
        showNotification('Erreur lors du chargement du produit.', 'error');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, dataLoaded, showNotification]);

  // Debug: Surveiller les changements d'état des images
  useEffect(() => {
    console.log('Product images changed:', product.images);
  }, [product.images]);

  // Debug: Surveiller les changements d'état du produit
  useEffect(() => {
    console.log('Product state changed:', product);
    console.log('Product stock specifically:', product.stock);
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== SUBMIT DEBUG ===');
    console.log('Product data:', product);
    console.log('Product stock:', product.stock);
    console.log('Images:', product.images);
    
    // Validation renforcée
    if (!product.name || !product.name.trim()) {
      showNotification('Le nom du produit est requis.', 'warning');
      return;
    }
    
    if (!product.description || !product.description.trim()) {
      showNotification('La description est requise et ne peut pas être vide.', 'warning');
      return;
    }

    if (product.price <= 0) {
      showNotification('Le prix doit être supérieur à 0.', 'warning');
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.append('name', product.name.trim());
    formData.append('price', product.price || 0);
    formData.append('category', product.category || '');
    formData.append('stock', parseInt(product.stock) || 0);
    formData.append('description', product.description.trim());
    
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    product.images.forEach((image, index) => {
      if (image) {
        console.log(`Adding image ${index}:`, image);
        formData.append(`images`, image);
      }
    });

    try {
      const response = await updateProduct(id, formData);
      console.log('Update response:', response);
      showNotification('Produit modifié avec succès !', 'success');
      setTimeout(() => {
      navigate('/artisan-home');
      }, 2000);
    } catch (err) {
      showNotification('Erreur lors de la mise à jour du produit: ' + (err.response?.data?.message || err.message), 'error');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    console.log('File selected:', file);
    console.log('Index:', index);
    console.log('Current product.images:', product.images);
    
    if (file) {
      // Créer l'URL pour l'aperçu
      const imageUrl = URL.createObjectURL(file);
      console.log('Created image URL:', imageUrl);
      
      // Mettre à jour les fichiers
      const newImages = [...product.images];
      newImages[index] = file;
      
      // Mettre à jour les URLs
      const newImageUrls = [...imageUrls];
      newImageUrls[index] = imageUrl;
      
      console.log('New images array:', newImages);
      console.log('New image URLs array:', newImageUrls);
      
      setProduct(prevProduct => ({ ...prevProduct, images: newImages }));
      setImageUrls(newImageUrls);
    }
  };

  const handleStockChange = (e) => {
    const value = e.target.value;
    console.log('Raw input value:', value);
    
    // Ne pas convertir en nombre immédiatement, garder la valeur string
    setProduct(prevProduct => {
      const newProduct = {
        ...prevProduct,
        stock: value // Garder la valeur string pour l'affichage
      };
      console.log('Setting new product with string value:', newProduct);
      return newProduct;
    });
  };

  const categories = [
    { value: 'Produits naturels, biologiques & bien-être', label: '🌿 Nature & Bien-être & Bio' },
    { value: 'Maison, décoration & art de vivre', label: '🏠 Maison & Décoration & art de vivre' },
    { value: 'Mode, accessoires & bijoux', label: '💎 Mode & Bijoux' },
    { value: 'Produits alimentaires artisanaux', label: '🍯 Alimentaire Artisanal' },
    { value: 'Jouets & loisirs créatifs', label: '🎨 Jouets & Créatif' },
    { value: 'Mobilier & artisanat utilitaire', label: '🪑 Mobilier & Utilitaire' },
    { value: 'Arts visuels & artisanat artistique', label: '🎭 Arts Visuels & artisanat artistique' },
    { value: 'Artisanat culturel & traditionnel', label: '🏛️ Culturel & Traditionnel' }
  ];

  // Afficher un message de chargement
  if (loading) {
    return (
      <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
        <ArtisanHeader />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          fontSize: '1.2em',
          color: '#8a5a44'
        }}>
          Chargement du produit...
        </div>
        <ArtisanFooter />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
      <ArtisanHeader />
      
      {/* ===== Notification Toast ===== */}
      <NotificationToast 
        notification={notification} 
        onClose={hideNotification} 
      />

      {/* ===== Hero Section ===== */}
      <section style={{
        background: 'linear-gradient(135deg, #f8f1e9 0%, #e8d5c4 100%)',
        padding: '80px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'linear-gradient(45deg, rgba(212, 163, 115, 0.1), rgba(138, 90, 68, 0.1))',
          borderRadius: '50%',
          opacity: 0.6
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '400px',
          height: '400px',
          background: 'linear-gradient(45deg, rgba(138, 90, 68, 0.05), rgba(212, 163, 115, 0.05))',
          borderRadius: '50%',
          opacity: 0.8
        }}></div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 30px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>✏️</div>
            <h1 style={{
              fontSize: '3em',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              Modifier le Produit
        </h1>
            <p style={{
              fontSize: '1.3em',
              color: '#6b5b47',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              Mettez à jour les informations de votre produit artisanal
            </p>
          </div>
        </div>
      </section>

      {/* ===== Main Content ===== */}
      <section style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 30px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          padding: '50px',
          border: '1px solid #e8e8e8'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} encType="multipart/form-data">
            {/* ===== Informations de Base ===== */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{
                fontSize: '1.5em',
                color: '#8a5a44',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📝 Informations de Base
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                {/* Nom du Produit */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Nom du Produit *
                  </label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Entrez le nom de votre produit"
                    required
                  />
                </div>

                {/* Prix */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Catégorie *
                  </label>
                  <select
                    value={product.category}
                    onChange={(e) => setProduct({ ...product, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Stock Disponible * (Debug: product.stock={product.stock})
                  </label>
                  
                  <input
                    type="text"
                    value={product.stock || 0}
                    onChange={handleStockChange}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff'
                    }}
                    placeholder="0"
                    required
                  />
                  
                  <button 
                    type="button"
                    onClick={() => {
                      alert(`Test: Stock actuel = ${product.stock}, changement vers 999`);
                      setProduct(prev => ({ ...prev, stock: '999' }));
                    }}
                    style={{
                      marginTop: '10px',
                      padding: '5px 10px',
                      backgroundColor: '#8a5a44',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Test Stock (999)
                  </button>
                </div>
              </div>
            </div>

            {/* ===== Description ===== */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{
                fontSize: '1.5em',
                color: '#8a5a44',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📝 Description Détaillée
              </h3>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  color: '#3a2f1a',
                  fontSize: '1.1em'
                }}>
                  Description du Produit *
                </label>
                <textarea
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1em',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fff',
                    minHeight: '120px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8a5a44';
                    e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Décrivez votre produit en détail : matériaux utilisés, techniques, dimensions, etc..."
                  required
                />
              </div>
            </div>

            {/* ===== Images ===== */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{
                fontSize: '1.5em',
                color: '#8a5a44',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📸 Images du Produit
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {[0, 1, 2].map((index) => (
                  <div key={index} style={{
                    background: '#fff',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '2px dashed #dee2e6',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ fontSize: '2em', marginBottom: '10px' }}>📷</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, index)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        fontSize: '0.9em',
                        cursor: 'pointer'
                      }}
                    />
                    {product.images[index] && imageUrls[index] && (
                      <div style={{
                        marginTop: '10px',
                        textAlign: 'center'
                      }}>
                        <img
                          src={imageUrls[index]}
                          alt={`Aperçu ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #d4edda',
                            marginBottom: '8px'
                          }}
                        />
                        <div style={{
                          padding: '6px 12px',
                          background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
                          borderRadius: '6px',
                          color: '#155724',
                          fontSize: '0.85em',
                          fontWeight: 600
                        }}>
                          ✓ Image sélectionnée
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ===== Actions ===== */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginTop: '30px'
            }}>
              <Link
                to="/artisan-home"
                style={{
                  padding: '15px 30px',
                  background: 'linear-gradient(135deg, #6c757d, #5a6268)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontSize: '1.1em',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                ← Annuler
              </Link>
              
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '15px 40px',
                  background: saving ? 
                    'linear-gradient(135deg, #adb5bd, #6c757d)' : 
                    'linear-gradient(135deg, #8a5a44, #d4a373)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1.1em',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: saving ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!saving) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {saving ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #fff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    💾 Modifier le Produit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ===== CSS Animation ===== */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <ArtisanFooter />
    </div>
  );
}

export default EditProduct;