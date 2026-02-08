import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Spinner } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import NotificationService from '../services/notification.service'; 

const AdminLayout = () => {
    const location = useLocation();
    const role = localStorage.getItem('role');
    
    const [unreadCount, setUnreadCount] = useState(0); 
    const [isDataReady, setIsDataReady] = useState(false);

    const isActive = (path) => location.pathname.startsWith(path);
    const sidebarTitle = role === 'ROLE_ADMIN' ? 'Admin Panel' : 'Store Manager';

    // ... (Keep your existing startPolling and useEffect logic here) ...
    // Copy the startPolling function exactly as you had it in your code snippet
    const startPolling = () => {
        NotificationService.getUnreadCount()
            .then(res => {
                setUnreadCount(res.data);
                setIsDataReady(true);
            })
            .catch(err => {
                 console.error("Auth check failed", err);
                 setIsDataReady(true);
                 setUnreadCount(0);
            });

        const interval = setInterval(() => {
            NotificationService.getUnreadCount().then(res => setUnreadCount(res.data)).catch(() => clearInterval(interval));
        }, 5000);

        return () => clearInterval(interval);
    };
    
    useEffect(() => {
        const cleanup = startPolling();
        return cleanup;
    }, []);

    // --- UPDATED MENU LOGIC ---

    // 1. Common Items (Visible to both Admin and Manager)
    const menuItems = [
        ...(role === 'ROLE_ADMIN' ? [{ path: '/admin', name: 'Overview', icon: 'bi-bar-chart-line' }] : []),
        { path: '/admin/products', name: 'Products', icon: 'bi-boxes' },
        { path: '/admin/transactions', name: 'Transactions', icon: 'bi-arrow-left-right' },
        { path: '/admin/analytics', name: 'Analytics', icon: 'bi-bar-chart-line' },
        ...(role === 'ROLE_ADMIN' ? [{ path: '/admin/approvals', name: 'Approvals', icon: 'bi-person-check' }] : []),
    ];

    // 2. Admin Only Items (Forecasting, Restock, User Management)
    // We filter this array based on the role check
    const managementItems = [];

    if (role === 'ROLE_ADMIN') {
        managementItems.push(
            { path: '/admin/forecasting', name: 'Forecasting', icon: 'bi-graph-up' },
            { path: '/admin/restock', name: 'Restock', icon: 'bi-truck' },
            // --- NEW: Add the Manager Management Link ---
            { path: '/admin/managers', name: 'Store Managers', icon: 'bi-people-fill' }
        );
    }

    if (!isDataReady) {
        return (
            <div className="text-center p-5 mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading Security & Data...</p>
            </div>
        );
    }

    return (
        <Container fluid className="p-0" style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
            <Row className="g-0">
                <Col md={2} className="bg-dark text-white min-vh-100 d-none d-md-block" style={{ position: 'sticky', top: 0, height: '100vh' }}>
                    <div className="p-4 text-center">
                        <h4 className="fw-bold text-white mb-0">
                            <i className={`bi ${role === 'ROLE_ADMIN' ? 'bi-shield-lock-fill' : 'bi-shop'} me-2`}></i>
                            {sidebarTitle}
                        </h4>
                        <p className="small text-muted mb-3">{role?.replace('ROLE_', '')}</p>
                        <hr className="border-secondary" />
                    </div>
                    
                    <Nav className="flex-column px-2">
                         <Nav.Link as={Link} to="/admin/alerts" className={`position-relative mb-2 rounded fw-bold ${isActive('/admin/alerts') ? 'bg-danger text-white' : 'text-white'}`}>
                             <i className="bi bi-bell-fill me-2"></i> Alerts 
                             {unreadCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark px-2 py-1">
                                    {unreadCount}
                                </span>
                            )}
                        </Nav.Link>
                        <hr className="border-secondary my-3" />

                        {/* Render Common Items */}
                        {menuItems.map(item => (
                            <Nav.Link key={item.path} as={Link} to={item.path} className={`text-white mb-2 rounded fw-bold ${isActive(item.path) ? 'bg-primary shadow-sm' : 'text-opacity-75'}`}>
                                <i className={`bi ${item.icon} me-2`}></i> {item.name}
                            </Nav.Link>
                        ))}
                        
                        {/* Render Admin-Only Items (Only if array is not empty) */}
                        {managementItems.length > 0 && (
                            <>
                                <hr className="border-secondary my-3" />
                                {managementItems.map(item => (
                                    <Nav.Link key={item.path} as={Link} to={item.path} className={`text-white mb-2 rounded fw-bold ${isActive(item.path) ? 'bg-success shadow-sm' : 'text-opacity-50'}`} style={{ fontSize: '0.9rem' }}>
                                        <i className={`bi ${item.icon} me-2`}></i> {item.name}
                                    </Nav.Link>
                                ))}
                            </>
                        )}
                    </Nav>
                </Col>

                <Col md={10} className="p-4">
                    <Outlet /> 
                </Col>
            </Row>
        </Container>
    );
};

export default AdminLayout;