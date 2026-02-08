import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Container, Navbar as BootstrapNavbar, Nav, Button, Row, Col, Card, Image, Badge } from 'react-bootstrap';
import 'animate.css';
import ManageStoreManagers from './pages/admin/ManageStoreManagers';

// --- Page Imports ---
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import UserDashboard from './pages/UserDashboard';
import CartPage from './pages/CartPage';
import ProtectedRoute from './pages/ProtectedRoute';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForecastingPage from './pages/ForecastingPage';
import RestockPage from './pages/RestockPage';
import './App.css';
import NotificationService from './services/notification.service'; 
import AlertsPage from './pages/AlertsPage';
// --- Admin Component Imports ---
import AdminLayout from './components/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import ManageProducts from './pages/admin/ManageProducts';
import PendingApprovals from './pages/admin/PendingApprovals';
import StockTransactions from './pages/admin/StockTransactions';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';

// --- Navbar Component ---
function Navbar() {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    
    // 1. REMOVE: The useState(0) for unreadCount is gone from here.
    // 2. REMOVE: The useEffect for polling is gone from here.

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <BootstrapNavbar variant="dark" expand="lg" sticky="top" style={{ background: 'var(--primary-gradient)', boxShadow: 'var(--shadow-md)' }}>
            <Container>
                <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold" style={{ letterSpacing: '1px' }}>
                    <i className="bi bi-box-seam-fill me-2"></i>SMARTSHELFX Pro
                </BootstrapNavbar.Brand>
                <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
                <BootstrapNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {(role === 'ROLE_ADMIN' || role === 'ROLE_STORE_MANAGER') && (
                            // Point to the new Admin Home
                            <Nav.Link as={Link} to="/admin" className="fw-bold">Admin Panel</Nav.Link>
                        )}
                        {role === 'ROLE_USER' && (
                            <>
                                <Nav.Link as={Link} to="/user-dashboard" className="fw-bold">Products</Nav.Link>
                                <Nav.Link as={Link} to="/cart" className="fw-bold">Cart</Nav.Link>
                            </>
                        )}
                        {/* 3. REMOVE THE BELL ICON HERE (It lives in AdminLayout now) */}
                    </Nav>
                    <Nav>
                        {token ? (
                            <Button variant="light" className="btn-modern" size="sm" onClick={handleLogout} style={{ color: '#667eea' }}>Logout</Button>
                        ) : (
                            <Button as={Link} to="/login" variant="outline-light" className="btn-modern" size="sm">Login / Sign Up</Button>
                        )}
                    </Nav>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
}

// --- LandingPage Component (JSX only) ---
function LandingPage() {
    return (
        <>
            <Container fluid className="text-white vh-100 d-flex align-items-center justify-content-center animate__animated animate__fadeIn" style={{
                background: 'var(--primary-gradient)',
                marginTop: '-56px',
                paddingTop: '56px'
            }}>
                <Row className="text-center">
                    <Col>
                        <h1 className="display-2 fw-bold mb-3 animate__animated animate__fadeInDown">SmartShelfX Inventory</h1>
                        <p className="lead fs-4 mb-4 animate__animated animate__fadeInUp" style={{ maxWidth: '600px', margin: 'auto', opacity: 0.9 }}>
                            AI-Powered Demand Forecasting & Automated Restocking for the Modern Supply Chain.
                        </p>
                        <Button as={Link} to="/login" variant="light" size="lg" className="btn-modern fw-bold px-5 py-3 shadow animate__animated animate__fadeInUp animate__delay-1s" style={{ color: '#667eea' }}>
                            Get Started <i className="bi bi-arrow-right ms-2"></i>
                        </Button>
                    </Col>
                </Row>
            </Container>

            <Container className="py-5">
                <h2 className="text-center display-5 fw-bold mb-5" style={{ color: 'var(--text-primary)' }}>Key Features</h2>
                <Row xs={1} md={3} className="g-4 text-center">
                    <Col className="animate__animated animate__fadeInUp">
                        <Card className="h-100 feature-card p-3">
                            <Card.Body>
                                <div className="mb-3" style={{ color: '#11998e' }}><i className="bi bi-shield-lock-fill fs-1"></i></div>
                                <Card.Title as="h3">Role-Based Access</Card.Title>
                                <Card.Text className="text-muted">
                                    Secure login for Admins and Users with distinct dashboards.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col className="animate__animated animate__fadeInUp animate__delay-1s">
                        <Card className="h-100 feature-card p-3">
                            <Card.Body>
                                <div className="mb-3" style={{ color: '#667eea' }}><i className="bi bi-graph-up-arrow fs-1"></i></div>
                                <Card.Title as="h3">AI Forecasting</Card.Title>
                                <Card.Text className="text-muted">
                                    Predict future sales and visualize trends to prevent stockouts.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col className="animate__animated animate__fadeInUp animate__delay-2s">
                        <Card className="h-100 feature-card p-3">
                            <Card.Body>
                                <div className="mb-3" style={{ color: '#f6d365' }}><i className="bi bi-cart-check-fill fs-1"></i></div>
                                <Card.Title as="h3">Smart Cart</Card.Title>
                                <Card.Text className="text-muted">
                                    Intuitive shopping experience with real-time inventory updates.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

// --- Footer Component ---
function Footer() {
    return (
        <Container fluid as="footer" className="text-white text-center py-4 mt-auto" style={{ background: '#2d3748' }}>
            <p className="mb-0 opacity-75">&copy; {new Date().getFullYear()} SMARTSHELFX. All Rights Reserved.</p>
        </Container>
    );
}

function App() {
    return (
        <BrowserRouter>
            <div className="d-flex flex-column" style={{ minHeight: "100vh", backgroundColor: 'var(--bg-color)' }}>
                <Navbar />
                <main className="flex-grow-1">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                        
                        {/* PROTECTED ROUTES */}
                        <Route element={<ProtectedRoute />}>
                            
                            {/* --- NEW ADMIN ROUTES (The Magic Happens Here) --- */}
                            <Route path="/admin" element={<AdminLayout />}>
                                {/* Default Page: Admin Home (Quick Actions) */}
                                <Route index element={<AdminHome />} /> 
                                
                                {/* Sub-Pages mapped to Sidebar Links */}
                                <Route path="products" element={<ManageProducts />} />
                                <Route path="approvals" element={<PendingApprovals />} />
                                <Route path="transactions" element={<StockTransactions />} />
                                <Route path="analytics" element={<AnalyticsDashboard />} />
                                
                                {/* Forecasting & Restock inside Admin Layout */}
                                <Route path="forecasting" element={<ForecastingPage />} />
                                <Route path="restock" element={<RestockPage />} />
                                <Route path="managers" element={<ManageStoreManagers />} />

                                {/* Alerts Page is now a child of /admin */}
                                <Route path="alerts" element={<AlertsPage />} />
                            </Route>

                            <Route path="/user-dashboard" element={<UserDashboard />} />
                            <Route path="/cart" element={<CartPage />} />
                        </Route>
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;