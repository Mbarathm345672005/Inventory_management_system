import React, { useState, useEffect } from 'react';
import ProductService from '../services/product.service';
import TopSellingProducts from './TopSellingProducts';

// Import Form for the input box
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Toast, ToastContainer, Form, InputGroup } from 'react-bootstrap';

function UserDashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });
    const [addingProductId, setAddingProductId] = useState(null);

    // --- NEW: State to track quantity for EACH product ID ---
    // Example: { "prod_id_1": 3, "prod_id_2": 1 }
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        setLoading(true);
        setAlertMessage({ type: '', text: '' });
        ProductService.getAllProducts()
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
                setAlertMessage({ type: 'danger', text: 'Could not load products.' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // --- NEW: Helper to update quantity state ---
    const handleQuantityChange = (productId, change, maxStock) => {
        setQuantities(prev => {
            const currentQty = prev[productId] || 1; // Default is 1 if not set
            const newQty = currentQty + change;

            // Validation: Don't go below 1, don't go above max stock
            if (newQty < 1) return prev;
            if (newQty > maxStock) return prev;

            return { ...prev, [productId]: newQty };
        });
    };

    const handleBuy = (productId, productName) => {
        setAlertMessage({ type: '', text: '' });
        setAddingProductId(productId);

        // --- NEW: Get the specific quantity for this product (Default to 1) ---
        const quantityToAdd = quantities[productId] || 1;

        // Pass quantity to the service
        ProductService.addToCart(productId, quantityToAdd)
            .then(response => {
                setToastMessage(`Added ${quantityToAdd} x ${productName} to cart!`);
                setShowToast(true);
                
                // Reset quantity back to 1 after adding
                setQuantities(prev => ({...prev, [productId]: 1}));

                setTimeout(() => {
                     fetchProducts(); // Refresh to check stock updates
                }, 1000);
            })
            .catch(error => {
                const errorMsg = error.response?.data?.message || "Error adding item to cart.";
                setAlertMessage({ type: 'danger', text: errorMsg });
            })
            .finally(() => {
                 setTimeout(() => setAddingProductId(null), 500);
            });
    };

    return (
        <Container fluid className="p-4" style={{
            background: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)',
            minHeight: 'calc(100vh - 56px)'
        }}>
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="success" text="white">
                    <Toast.Header closeButton={true}>
                        <strong className="me-auto">Success</strong>
                    </Toast.Header>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>

            <h1 className="mb-4 text-center display-5 fw-bold text-success">
                Welcome to SmartShelfX
            </h1>

            {/* --- RECOMMENDATION SECTION (Based on Top Sellers) --- */}
            <div className="mb-5">
                
                <TopSellingProducts />
            </div>

            <hr className="my-5" />

            {/* --- ALL PRODUCTS SECTION --- */}
            <h3 className="mb-4 text-dark">All Products</h3>

            {loading ? (
                <div className="text-center mt-5">
                    <Spinner animation="grow" variant="success" />
                </div>
            ) : (
                <>
                    {alertMessage.text && (
                        <Alert variant={alertMessage.type} onClose={() => setAlertMessage({ type: '', text: '' })} dismissible>
                            {alertMessage.text}
                        </Alert>
                    )}

                    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                        {products.map(product => (
                            <Col key={product.id}>
                                <Card className="h-100 custom-card border-0 shadow-sm">
                                    {/* Image Section */}
                                    <div className="product-img-container" style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                        <Card.Img
                                            variant="top"
                                            src={product.imageUrl || 'https://placehold.co/300x200?text=Product'}
                                            className="product-img-hover"
                                            style={{ height: '100%', width: '100%', objectFit: 'contain', padding: '10px' }}
                                        />
                                        {product.quantity <= 5 && product.quantity > 0 && (
                                            <Badge bg="warning" text="dark" className="position-absolute top-0 end-0 m-2 shadow">
                                                Low Stock: {product.quantity} left
                                            </Badge>
                                        )}
                                    </div>

                                    <Card.Body className="d-flex flex-column p-3">
                                        <Card.Title className="fw-bold text-dark">{product.name}</Card.Title>
                                        <Card.Text className="text-muted small">
                                            {product.description ? product.description.substring(0, 50) + "..." : "No description."}
                                        </Card.Text>
                                        
                                        <div className="mt-auto">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h4 className="text-primary mb-0 fw-bold">${product.price}</h4>
                                            </div>

                                            {/* --- BULK QUANTITY SELECTOR --- */}
                                            {product.quantity > 0 ? (
                                                <div className="mb-3">
                                                    <InputGroup size="sm">
                                                        <Button 
                                                            variant="outline-secondary" 
                                                            onClick={() => handleQuantityChange(product.id, -1, product.quantity)}
                                                        >
                                                            -
                                                        </Button>
                                                        <Form.Control 
                                                            className="text-center" 
                                                            value={quantities[product.id] || 1} // Read specific qty or default 1
                                                            readOnly 
                                                        />
                                                        <Button 
                                                            variant="outline-secondary" 
                                                            onClick={() => handleQuantityChange(product.id, 1, product.quantity)}
                                                        >
                                                            +
                                                        </Button>
                                                    </InputGroup>
                                                </div>
                                            ) : (
                                                <Alert variant="danger" className="py-1 text-center small mb-3">Out of Stock</Alert>
                                            )}
                                            
                                            <Button 
                                                className="btn-modern btn-primary-modern w-100"
                                                onClick={() => handleBuy(product.id, product.name)}
                                                disabled={product.quantity === 0 || addingProductId === product.id}
                                            >
                                                {addingProductId === product.id ? (
                                                    <>
                                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-cart-plus me-2"></i> 
                                                        Add {(quantities[product.id] || 1) > 1 ? (quantities[product.id] || 1) : ""} to Cart
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </Container>
    );
}

export default UserDashboard;