import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductService from '../../services/product.service';
import { Row, Col, Form, Button, Table, Alert, Card, Spinner } from 'react-bootstrap';

function ManageProducts() {
    // --- State Hooks ---
    const [products, setProducts] = useState([]);
    // State for the Create Product Form
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        quantity: 0,
        imageUrl: '',
        price: 0
    });
    // Feedback messages
    const [productMessage, setProductMessage] = useState({ type: '', text: '' });
    // Loading state for the table
    const [loadingProducts, setLoadingProducts] = useState(true);
    
    // File Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageSourceOption, setImageSourceOption] = useState('url'); // 'url' or 'upload'

    // --- 1. Fetch Products Function ---
    const fetchProducts = () => {
        setLoadingProducts(true);
        ProductService.getAllProducts()
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
                setProductMessage({ type: 'danger', text: "Error fetching products." });
            })
            .finally(() => {
                setLoadingProducts(false);
            });
    };

    // Load products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // --- 2. Form Input Handler ---
    const handleProductChange = (e) => {
        setProductForm({ ...productForm, [e.target.name]: e.target.value });
    };

    // --- 3. File Input Handler ---
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            // Clear the URL field if a file is selected to avoid confusion
            setProductForm({ ...productForm, imageUrl: '' });
        } else {
             setSelectedFile(null);
        }
    };

    // --- 4. Create Product Handler (Submit) ---
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setProductMessage({ type: '', text: '' }); // Clear previous messages
        let finalImageUrl = productForm.imageUrl; // Default to the text input URL

        // Step A: Handle File Upload (if selected)
        if (imageSourceOption === 'upload' && selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                // Get token for secure upload
                const token = localStorage.getItem('token');
                // Call the upload endpoint directly using axios
                const uploadResponse = await axios.post('/api/files/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                // The backend returns { "url": "/uploads/filename.jpg" }
                finalImageUrl = uploadResponse.data.url;
                
            } catch (error) {
                console.error("File upload error:", error);
                setProductMessage({ type: 'danger', text: "File upload failed. Check backend connection." });
                return; // Stop submission if upload fails
            }
        }

        // Step B: Create the Product
        const productData = { ...productForm, imageUrl: finalImageUrl };

        ProductService.createProduct(productData)
            .then(() => {
                setProductMessage({ type: 'success', text: "Product created successfully!" });
                fetchProducts(); // Refresh the list
                // Reset the form
                setProductForm({ name: '', description: '', quantity: 0, imageUrl: '', price: 0 });
                setSelectedFile(null);
                setImageSourceOption('url');
            })
            .catch(error => {
                console.error("Create product error:", error);
                setProductMessage({ type: 'danger', text: "Error creating product." });
            });
    };

    // --- 5. Delete Product Handler ---
    const handleProductDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            ProductService.deleteProduct(id)
                .then(response => {
                    // Ideally show a success message here too, but refreshing is key
                    fetchProducts(); 
                })
                .catch(error => {
                    setProductMessage({ type: 'danger', text: "Error deleting product." });
                });
        }
    };
    
    // --- 6. Update Quantity Handler (Inline Edit) ---
    const handleQuantityUpdate = (id, newQuantity) => {
         const product = products.find(p => p.id === id);
         if (!product) return;

         const updatedProduct = { ...product, quantity: parseInt(newQuantity) };
         
         ProductService.updateProduct(id, updatedProduct)
            .then(() => {
                // Success - refresh to ensure data consistency
                fetchProducts();
            })
            .catch(error => {
                setProductMessage({ type: 'danger', text: "Error updating quantity." });
            });
    };

    // --- Render JSX ---
    return (
        <div className="animate__animated animate__fadeIn">
            <h2 className="mb-4 text-primary fw-bold">Product Management</h2>
            
            {/* --- CREATE PRODUCT SECTION --- */}
            <Card className="custom-card mb-4 shadow-sm border-primary">
                <Card.Header as="h5" className="card-header-modern">
                    <i className="bi bi-plus-circle-fill me-2"></i> Create New Product
                </Card.Header>
                <Card.Body>
                    {/* Alert Message Area */}
                    {productMessage.text && (
                        <Alert 
                            variant={productMessage.type} 
                            dismissible 
                            onClose={() => setProductMessage({ type: '', text: '' })}
                        >
                            {productMessage.text}
                        </Alert>
                    )}
                    
                    <Form onSubmit={handleProductSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6">
                                <Form.Label>Name</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="name" 
                                    value={productForm.name} 
                                    onChange={handleProductChange} 
                                    required 
                                    placeholder="e.g., Wireless Mouse"
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="6">
                                <Form.Label>Price ($)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    step="0.01" 
                                    name="price" 
                                    value={productForm.price} 
                                    onChange={handleProductChange} 
                                    required 
                                    placeholder="0.00"
                                />
                            </Form.Group>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                name="description" 
                                value={productForm.description} 
                                onChange={handleProductChange} 
                                placeholder="Product details..."
                                rows={2}
                            />
                        </Form.Group>

                        <Row className="mb-3">
                             <Form.Group as={Col} md="6">
                                <Form.Label>Initial Quantity</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name="quantity" 
                                    value={productForm.quantity} 
                                    onChange={handleProductChange} 
                                    required 
                                />
                            </Form.Group>
                        </Row>

                        {/* Image Handling Section */}
                        <Form.Group className="mb-3">
                            <div className="mb-2">
                                <Form.Check 
                                    inline 
                                    type="radio" 
                                    label="Enter Image URL" 
                                    checked={imageSourceOption === 'url'} 
                                    onChange={() => setImageSourceOption('url')} 
                                />
                                <Form.Check 
                                    inline 
                                    type="radio" 
                                    label="Upload Image" 
                                    checked={imageSourceOption === 'upload'} 
                                    onChange={() => setImageSourceOption('upload')} 
                                />
                            </div>
                            
                            {imageSourceOption === 'url' ? (
                                 <Form.Control 
                                    type="text" 
                                    placeholder="https://example.com/image.jpg" 
                                    name="imageUrl" 
                                    value={productForm.imageUrl} 
                                    onChange={handleProductChange} 
                                />
                            ) : (
                                 <Form.Control 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    accept="image/*"
                                />
                            )}
                        </Form.Group>

                        <div className="d-grid">
                            <Button className="btn-modern btn-primary-modern" type="submit" size="lg">
                                Create Product
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* --- MANAGE INVENTORY SECTION --- */}
            <Card className="custom-card mb-4 shadow-sm border-secondary">
                <Card.Header as="h5" className="card-header-modern" style={{background: 'linear-gradient(135deg, #434343 0%, #000000 100%)'}}>
                    <i className="bi bi-list-ul me-2"></i> Manage Inventory
                </Card.Header>
                <Card.Body>
                     {loadingProducts ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                     ) : (
                        <div className="table-responsive">
                            <Table hover className="table-modern align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Name</th>
                                        <th className="text-end">Price</th>
                                        <th className="text-center">Qty</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td className="fw-bold">{p.name}</td>
                                            <td className="text-end">${p.price ? p.price.toFixed(2) : '0.00'}</td>
                                            <td className="text-center">
                                                <Form.Control 
                                                    type="number" 
                                                    defaultValue={p.quantity} 
                                                    onBlur={(e) => handleQuantityUpdate(p.id, e.target.value)} 
                                                    style={{width: '80px', margin: 'auto', textAlign: 'center'}} 
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Button 
                                                    className="btn-modern btn-danger" 
                                                    size="sm" 
                                                    onClick={() => handleProductDelete(p.id)}
                                                >
                                                    <i className="bi bi-trash"></i> Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">No products found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                     )}
                </Card.Body>
            </Card>
        </div>
    );
}

export default ManageProducts;