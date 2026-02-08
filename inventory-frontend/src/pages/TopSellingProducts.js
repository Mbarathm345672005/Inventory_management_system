import React, { useState, useEffect } from 'react';
import ProductService from '../services/product.service';
import { Card, Row, Col, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// A component to fetch and display top-selling products
function TopSellingProducts() {
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the top-selling products when the component mounts
        ProductService.getTopSelling() // This line will now work
            .then(response => {
                setTopProducts(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching top selling products:", error);
                setLoading(false);
            });
    }, []); // The empty array means this runs once

    // Don't show anything if loading
    if (loading && !topProducts.length) { // Only show spinner if there's nothing to display
        return (
            <div className="text-center my-4">
                <Spinner animation="border" variant="primary" />
                <p>Loading Top Sellers...</p>
            </div>
        );
    }

    // Don't show the section if there are no top sellers
    if (!topProducts.length) {
        return null; // Return nothing if no top sellers
    }

    // If we have products, render the list
    return (
        <div className="my-5 p-4 bg-light rounded shadow-sm">
            <h2 className="mb-4">Top Selling Products</h2>
            <Row xs={1} md={3} lg={5} className="g-4">
                {topProducts.map(product => (
                    <Col key={product.id}>
                        <Card className="h-100 shadow-sm text-center">
                            <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Card.Img 
                                    variant="top" 
                                    // --- FIXED PLACEHOLDER URL ---
                                    src={product.imageUrl || `https://placehold.co/150x150/e9ecef/6c757d?text=No+Image`} 
                                    style={{ height: '150px', objectFit: 'contain', padding: '10px' }}
                                />
                                <Card.Body>
                                    <Card.Title as="h6" className="text-truncate" title={product.name}>
                                        {product.name}
                                    </Card.Title>
                                    <Card.Text className="fw-bold">${product.price.toFixed(2)}</Card.Text>
                                    <Button variant="primary" size="sm" as="div">
                                        View Details
                                    </Button>
                                </Card.Body>
                            </Link>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default TopSellingProducts;