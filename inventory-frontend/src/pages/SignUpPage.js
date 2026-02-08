import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// Import Bootstrap components
import { Container, Form, Button, Alert, Row, Col, Card, Spinner } from 'react-bootstrap';

function SignUpPage() {
    const [formData, setFormData] = useState({
        name: '', dept: '', email: '', password: '', confirmPassword: '',
        role: 'ROLE_USER', phoneNo: '', warehouseLocation: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        setLoading(true); // Start loading

        try {
            const response = await axios.post('/api/auth/signup', formData);
            setMessage(response.data.message);

            // Hide form and show success message prominently
            // Optionally redirect after a delay
            setTimeout(() => {
                navigate('/login');
            }, 3000); // Redirect after 3 seconds

        } catch (err) {
            if (err.response) {
                setError(err.response.data.message);
            } else if (err.request) {
                setError("Network error: Could not connect to the backend.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        // Consistent background and centering
        <Container fluid className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: 'calc(100vh - 56px)', background: 'linear-gradient(to bottom right, #f8f9fa, #d1e7dd)' }}>
             <Row className="w-100 justify-content-center">
                 {/* Increased width slightly for more fields */}
                <Col md={8} lg={7} xl={6}>
                    <Card className="shadow-lg border-success"> {/* Added shadow and border */}
                        <Card.Header className="bg-success text-white text-center py-3">
                             <h2 className="mb-0">
                                {/* Optional Icon */}
                                {/* <i className="bi bi-person-plus-fill me-2"></i> */}
                                Create Your Account
                            </h2>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {/* Show success message prominently if registered */}
                            {message ? (
                                <Alert variant="success" className="text-center">
                                    <Alert.Heading>Registration Successful!</Alert.Heading>
                                    <p>{message}</p>
                                    <p>You will be redirected to the login page shortly.</p>
                                    <Spinner animation="border" size="sm" />
                                </Alert>
                            ) : (
                                <> {/* Show form only if no success message */}
                                    {error && (
                                        <Alert variant="danger" onClose={() => setError('')} dismissible>
                                            {error}
                                        </Alert>
                                    )}
                                    <Form onSubmit={handleSubmit}>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} md="6" controlId="formSignUpName">
                                                <Form.Label>Name</Form.Label>
                                                <Form.Control type="text" name="name" placeholder="Enter name" onChange={handleChange} required />
                                            </Form.Group>
                                             <Form.Group as={Col} md="6" controlId="formSignUpEmail">
                                                <Form.Label>Email address</Form.Label>
                                                <Form.Control type="email" name="email" placeholder="Enter email" onChange={handleChange} required />
                                            </Form.Group>
                                        </Row>

                                        <Row className="mb-3">
                                            <Form.Group as={Col} md="6" controlId="formSignUpPassword">
                                                <Form.Label>Password</Form.Label>
                                                <Form.Control type="password" name="password" placeholder="Password" onChange={handleChange} required />
                                            </Form.Group>
                                            <Form.Group as={Col} md="6" controlId="formSignUpConfirmPassword">
                                                <Form.Label>Confirm Password</Form.Label>
                                                <Form.Control type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
                                            </Form.Group>
                                        </Row>

                                         <Row className="mb-3">
                                             <Form.Group as={Col} md="6" controlId="formSignUpRole">
                                                <Form.Label>Role</Form.Label>
                                                <Form.Select name="role" value={formData.role} onChange={handleChange}>
                                                    <option value="ROLE_USER">User</option>
                                                    <option value="ROLE_ADMIN">Admin</option>
                                                    <option value="ROLE_STORE_MANAGER">Store Manager</option>
                                                </Form.Select>
                                            </Form.Group>
                                            <Form.Group as={Col} md="6" controlId="formSignUpPhone">
                                                <Form.Label>Phone Number</Form.Label>
                                                <Form.Control type="tel" name="phoneNo" placeholder="Optional" onChange={handleChange} />
                                            </Form.Group>
                                        </Row>

                                        <Row className="mb-4">
                                            <Form.Group as={Col} md="6" controlId="formSignUpDept">
                                                <Form.Label>Department</Form.Label>
                                                <Form.Control type="text" name="dept" placeholder="Optional" onChange={handleChange} />
                                            </Form.Group>
                                            <Form.Group as={Col} md="6" controlId="formSignUpWarehouse">
                                                <Form.Label>Warehouse Location</Form.Label>
                                                <Form.Control type="text" name="warehouseLocation" placeholder="Optional" onChange={handleChange} />
                                            </Form.Group>
                                        </Row>

                                        <div className="d-grid">
                                            <Button variant="success" type="submit" size="lg" disabled={loading}>
                                                 {loading ? (
                                                    <>
                                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                                                        Registering...
                                                    </>
                                                ) : (
                                                    'Sign Up'
                                                )}
                                            </Button>
                                        </div>
                                    </Form>
                                    <div className="mt-4 text-center">
                                        Already have an account? <Link to="/login" className="fw-bold">Login here</Link>
                                    </div>
                                </>
                            )} {/* End conditional form rendering */}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default SignUpPage;