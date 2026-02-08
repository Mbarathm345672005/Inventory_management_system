import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Alert, Modal } from 'react-bootstrap';
import UserService from '../../services/user.service'; // Import the new service

function ManageStoreManagers() {
    const [managers, setManagers] = useState([]);
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchManagers();
    }, []);

    const fetchManagers = () => {
        UserService.getStoreManagers()
            .then(res => setManagers(res.data))
            .catch(err => console.error("Error fetching managers", err));
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowModal(true);
    };

    const handleDelete = () => {
        UserService.deleteUser(deleteId)
            .then(() => {
                setMessage('Store Manager removed successfully.');
                fetchManagers(); // Refresh the list
                setShowModal(false);
            })
            .catch(err => {
                console.error(err);
                setMessage('Failed to delete user.');
                setShowModal(false);
            });
    };

    return (
        <Container className="mt-4 animate__animated animate__fadeIn">
            <h2 className="text-primary fw-bold mb-4">Manage Store Managers</h2>
            
            {message && <Alert variant="info" onClose={() => setMessage('')} dismissible>{message}</Alert>}

            <div className="shadow-sm rounded bg-white overflow-hidden">
                <Table hover className="table-modern align-middle mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th className="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {managers.length === 0 ? (
                            <tr><td colSpan="4" className="text-center p-4">No Store Managers found.</td></tr>
                        ) : (
                            managers.map(user => (
                                <tr key={user.id}>
                                    <td className="fw-bold">{user.name || user.username}</td>
                                    <td>{user.email}</td>
                                    <td><Badge bg="info">STORE_MANAGER</Badge></td>
                                    <td className="text-end">
                                        <Button variant="outline-danger" size="sm" onClick={() => confirmDelete(user.id)}>
                                            <i className="bi bi-trash"></i> Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Removal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this Store Manager? They will lose access immediately.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete Account</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ManageStoreManagers;