import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// Import Bootstrap components
import { Container, Form, Button, Alert, Row, Col, Card, Spinner } from 'react-bootstrap';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Loading state for button
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true); // Start loading

        console.log("ATTEMPTING TO SEND:", { email, password });

        try {
            const response = await axios.post('/api/auth/login', { email, password });

            const { token, role, validated } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            // Redirect based on role (already correct)
           if ((role === 'ROLE_ADMIN' || role === 'ROLE_STORE_MANAGER') && validated) {
        navigate('/admin');
    } else if (role === 'ROLE_USER') {
        navigate('/user-dashboard');
    } else {
                 // This case might happen if backend logic changes or role isn't recognized
                 setError("Login successful, but role access is unclear.");
                 localStorage.clear(); // Clear storage if invalid state
            }

        } catch (err) {
            // Error handling (already improved)
            if (err.response) {
                if (err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else if (err.response.status === 401) {
                    setError("Login failed: Invalid email or password.");
                } else {
                    setError(`Error: ${err.response.statusText || 'An unexpected error occurred.'}`);
                }
            } else if (err.request) {
                setError("Network error: Could not connect to the backend.");
            } else {
                setError(err.message);
            }
        } finally {
             setLoading(false); // Stop loading regardless of outcome
        }
    };

    return (
        // Added background color and vertical centering
        <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 56px)', background: 'linear-gradient(to bottom right, #f8f9fa, #cfe2ff)' }}>
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={5} xl={4}> {/* Control the width */}
                    <Card className="shadow-lg border-primary"> {/* Added shadow and border */}
                        <Card.Header className="bg-primary text-white text-center py-3">
                            <h2 className="mb-0">
                                {/* Optional Icon */}
                                {/* <i className="bi bi-box-arrow-in-right me-2"></i> */}
                                Login
                            </h2>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {error && (
                                <Alert variant="danger" onClose={() => setError('')} dismissible>
                                    {error}
                                </Alert>
                            )}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formLoginEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        aria-describedby="emailHelpBlock"
                                    />
                                     <Form.Text id="emailHelpBlock" muted>
                                        We'll never share your email with anyone else.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="formLoginPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="primary" type="submit" size="lg" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Logging In...
                                            </>
                                        ) : (
                                            'Login'
                                        )}
                                    </Button>
                                </div>
                                <div className="text-end mb-3">
        <Link to="/forgot-password">Forgot Password?</Link>
    </div>
    
    <div className="d-grid">
        <Button variant="primary" type="submit" size="lg" disabled={loading}>
            {/* ... (button content) ... */}
        </Button>
    </div>
                            </Form>
                            <div className="mt-4 text-center">
                                Don't have an account? <Link to="/signup" className="fw-bold">Sign up here</Link>
                            </div>
                        </Card.Body>
                         {/* Optional: Add a subtle footer to the card */}
                         {/* <Card.Footer className="text-muted text-center small py-3">
                            Welcome to Inventory Pro
                         </Card.Footer> */}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default LoginPage;