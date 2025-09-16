// File: client-admin/src/components/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Spinner, Badge } from 'react-bootstrap';
import api from '../api/api';

const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
};

const Leaderboard = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/departments/leaderboard');
                setDepartments(response.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) {
        return <Spinner animation="border" />;
    }

    return (
        <Card className="h-100">
            <Card.Body>
                <Card.Title className="mb-3">Department Leaderboard</Card.Title>
                <ListGroup variant="flush">
                    {departments.map((dept, index) => (
                        <ListGroup.Item key={dept.id} className="d-flex justify-content-between align-items-center">
                            <div>
                                <span className="me-3 fs-5">{getMedal(index)}</span>
                                {dept.name}
                            </div>
                            <Badge bg="primary" pill>
                                {dept.points} pts
                            </Badge>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card.Body>
        </Card>
    );
};

export default Leaderboard;