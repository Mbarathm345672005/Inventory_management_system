import React, { useState, useEffect } from 'react';
import NotificationService from '../services/notification.service';
import { Container, Table, Button, Badge, Spinner, Card, Alert } from 'react-bootstrap';

function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchAlerts(); }, []);

    const fetchAlerts = () => {
        setLoading(true);
        NotificationService.getAllNotifications()
            .then(res => { 
                setAlerts(res.data); 
                setLoading(false); 
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load alerts.");
                setLoading(false);
            });
    };

    const handleDismiss = (id) => {
        // 1. OPTIMISTIC UPDATE: Remove from UI immediately
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));

        // 2. Send request to backend silently
        NotificationService.markAsRead(id)
            .catch(err => {
                console.error("Error dismissing alert", err);
                // If it fails, we might want to reload the list, but usually silent fail is better for UX here
            });
    };

    // --- DATE FIX HELPER FUNCTION ---
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        
        // If backend sends array: [2025, 11, 29, 20, 30, 45]
        if (Array.isArray(timestamp)) {
            // Java months are 1-12, JS months are 0-11. Subtract 1 from month.
            const [year, month, day, hour, minute, second] = timestamp;
            return new Date(year, month - 1, day, hour, minute, second || 0).toLocaleString();
        }

        // If backend sends standard ISO string
        return new Date(timestamp).toLocaleString();
    };

    // Filter out read alerts to ensure they disappear from the table
    const visibleAlerts = alerts.filter(alert => !alert.isRead);

    return (
        <Container className="mt-4 animate__animated animate__fadeIn">
            <h2 className="mb-4 text-primary fw-bold">Alerts & Notifications</h2>
            
            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="custom-card shadow-sm">
                <Card.Body className="p-0">
                    {loading ? <div className="text-center p-5"><Spinner animation="border" /></div> : (
                        <div className="table-responsive">
                            <Table hover className="table-modern align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Type</th>
                                        <th>Message</th>
                                        <th>Date</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleAlerts.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center p-4 text-muted">No active alerts.</td></tr>
                                    ) : (
                                        visibleAlerts.map(alert => (
                                            <tr key={alert.id}>
                                                <td>
                                                    <Badge bg={alert.type.includes('CRITICAL') ? 'danger' : alert.type.includes('WARNING') ? 'warning' : 'info'}>
                                                        {alert.type}
                                                    </Badge>
                                                </td>
                                                <td className="fw-bold">{alert.message}</td>
                                                
                                                {/* --- DATE FIX APPLIED HERE --- */}
                                                <td className="text-muted small" style={{minWidth: '150px'}}>
                                                    {formatDate(alert.createdAt)}
                                                </td>

                                                <td className="text-center">
                                                    <Button size="sm" variant="outline-secondary" onClick={() => handleDismiss(alert.id)}>
                                                        Dismiss
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}
export default AlertsPage;