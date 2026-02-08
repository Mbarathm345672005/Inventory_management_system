import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Button } from 'react-bootstrap';

function AdminHome() {
    return (
        <div className="animate__animated animate__fadeIn">
            <h2 className="mb-4 text-primary fw-bold">Dashboard Overview</h2>
            <Row xs={1} md={2} className="g-4">
                <Col>
                    <Card className="h-100 shadow-sm border-primary custom-card">
                        <Card.Body className="text-center p-5">
                            <div className="mb-3 text-primary"><i className="bi bi-graph-up-arrow fs-1"></i></div>
                            <h3>Demand Forecasting</h3>
                            <p className="text-muted">Predict future sales and trends.</p>
                            <Link to="/admin/forecasting">
                                <Button className="btn-modern btn-primary-modern">View Forecast</Button>
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="h-100 shadow-sm border-warning custom-card">
                        <Card.Body className="text-center p-5">
                            <div className="mb-3 text-warning"><i className="bi bi-box-seam fs-1"></i></div>
                            <h3>Restock Suggestions</h3>
                            <p className="text-muted">View automated purchase orders.</p>
                            <Link to="/admin/restock">
                                <Button className="btn-modern btn-warning-modern">Manage Restock</Button>
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
export default AdminHome;