"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useToast } from "../contexts/ToastContext"
import api from "../api"

const RoomsModal = ({ locationId, locationName, onClose }) => {
    const { showError } = useToast()
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [roomEmployees, setRoomEmployees] = useState([])
    const [employeesLoading, setEmployeesLoading] = useState(false)

    const fetchRooms = useCallback(async () => {
        try {
            setLoading(true)
            const response = await api.get(`/locations/${locationId}/rooms`)
            setRooms(response.data || [])
        } catch (err) {
            console.error("Error fetching rooms:", err)
            showError("Failed to load rooms for this location")
        } finally {
            setLoading(false)
        }
    }, [locationId])

    const fetchRoomEmployees = async (roomId) => {
        try {
            setEmployeesLoading(true)
            const response = await api.get(`/locations/rooms/${roomId}/employees`)
            setSelectedRoom(response.data.room)
            setRoomEmployees(response.data.employees || [])
        } catch (err) {
            console.error("Error fetching room employees:", err)
            showError("Failed to load employees for this room")
        } finally {
            setEmployeesLoading(false)
        }
    }

    useEffect(() => {
        if (locationId) {
            fetchRooms()
        }
    }, [fetchRooms, locationId])

    const closeRoomDetails = () => {
        setSelectedRoom(null)
        setRoomEmployees([])
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="rooms-modal" onClick={(e) => e.stopPropagation()}>
                <div className="rooms-modal-header">
                    <h2>Rooms in {locationName}</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="rooms-modal-content">
                    {/* Rooms List */}
                    <div className={`rooms-section ${selectedRoom ? 'with-details' : ''}`}>
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading rooms...</p>
                            </div>
                        ) : rooms.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <h3>No rooms found</h3>
                                <p>There are no rooms in this location.</p>
                            </div>
                        ) : (
                            <div className="rooms-grid">
                                {rooms.map((room) => (
                                    <div 
                                        key={room.id} 
                                        className={`room-card ${selectedRoom?.id === room.id ? 'active' : ''}`}
                                        onClick={() => fetchRoomEmployees(room.id)}
                                    >
                                        <div className="room-header">
                                            <div className="room-icon">🚪</div>
                                            <h3 className="room-name">{room.name}</h3>
                                        </div>
                                        <div className="room-details-grid">
                                            {room.floor && (
                                                <div className="room-detail">
                                                    <span className="label">Floor</span>
                                                    <span className="value">{room.floor}</span>
                                                </div>
                                            )}
                                            {room.capacity && (
                                                <div className="room-detail">
                                                    <span className="label">Capacity</span>
                                                    <span className="value">{room.capacity}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Room Employees Details */}
                    {selectedRoom && (
                        <div className="employees-section">
                            <div className="employees-header">
                                <h3>{selectedRoom.name} - Employees</h3>
                                <button className="close-btn-small" onClick={closeRoomDetails}>✕</button>
                            </div>

                            {employeesLoading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Loading employees...</p>
                                </div>
                            ) : roomEmployees.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">👥</div>
                                    <h3>No employees in this room</h3>
                                </div>
                            ) : (
                                <div className="employees-list">
                                    <div className="employees-count">
                                        👥 {roomEmployees.length} employee{roomEmployees.length !== 1 ? 's' : ''}
                                    </div>
                                    {roomEmployees.map((emp) => (
                                        <div key={emp.id} className="employee-card">
                                            <div className="employee-header">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${emp.name}&background=6366f1&color=fff`}
                                                    alt={emp.name}
                                                    className="employee-avatar"
                                                />
                                                <div className="employee-info">
                                                    <h4 className="employee-name">{emp.name}</h4>
                                                    <span className="employee-role">{emp.role}</span>
                                                </div>
                                            </div>
                                            <div className="employee-details">
                                                <div className="detail-item">
                                                    <span className="icon">📧</span>
                                                    <span className="text">{emp.email}</span>
                                                </div>
                                                {emp.phone && (
                                                    <div className="detail-item">
                                                        <span className="icon">📞</span>
                                                        <span className="text">{emp.phone}</span>
                                                    </div>
                                                )}
                                                {emp.department && (
                                                    <div className="detail-item">
                                                        <span className="icon">🏢</span>
                                                        <span className="text">{emp.department}</span>
                                                    </div>
                                                )}
                                                {emp.assets_count && (
                                                    <div className="detail-item">
                                                        <span className="icon">📦</span>
                                                        <span className="text">{emp.assets_count} asset{emp.assets_count !== 1 ? 's' : ''}</span>
                                                    </div>
                                                )}
                                                {emp.supervised_by && (
                                                    <div className="detail-item">
                                                        <span className="icon">👨‍💼</span>
                                                        <span className="text">Supervisor: {emp.supervised_by}</span>
                                                    </div>
                                                )}
                                                {emp.maintained_by && (
                                                    <div className="detail-item">
                                                        <span className="icon">🔧</span>
                                                        <span className="text">Maintained by: {emp.maintained_by}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <style>{`
                    .rooms-modal {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: var(--bg-secondary);
                        border-radius: 0.75rem;
                        border: 1px solid var(--border-color);
                        width: 90vw;
                        max-width: 1200px;
                        max-height: 85vh;
                        display: flex;
                        flex-direction: column;
                        z-index: 1000;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    }

                    .rooms-modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1.5rem;
                        border-bottom: 1px solid var(--border-color);
                    }

                    .rooms-modal-header h2 {
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: var(--text-primary);
                        margin: 0;
                    }

                    .rooms-modal-content {
                        flex: 1;
                        overflow-y: auto;
                        padding: 1.5rem;
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .rooms-modal-content.with-details {
                        grid-template-columns: 1fr 1fr;
                    }

                    .rooms-section {
                        transition: all 0.3s ease;
                    }

                    .rooms-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                        gap: 1rem;
                    }

                    .room-card {
                        padding: 1.5rem;
                        background: var(--bg-primary);
                        border: 2px solid var(--border-color);
                        border-radius: 0.75rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    .room-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
                        border-color: var(--primary-color);
                    }

                    .room-card.active {
                        background: var(--primary-color);
                        color: white;
                        border-color: var(--primary-color);
                    }

                    .room-header {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        margin-bottom: 1rem;
                    }

                    .room-icon {
                        font-size: 2rem;
                    }

                    .room-name {
                        font-size: 1.25rem;
                        font-weight: 700;
                        margin: 0;
                    }

                    .room-card.active .room-name {
                        color: white;
                    }

                    .room-details-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.5rem;
                    }

                    .room-detail {
                        display: flex;
                        flex-direction: column;
                    }

                    .room-detail .label {
                        font-size: 0.75rem;
                        color: var(--text-secondary);
                        text-transform: uppercase;
                        font-weight: 600;
                    }

                    .room-card.active .room-detail .label {
                        color: rgba(255, 255, 255, 0.7);
                    }

                    .room-detail .value {
                        font-size: 0.95rem;
                        font-weight: 600;
                        color: var(--text-primary);
                    }

                    .room-card.active .room-detail .value {
                        color: white;
                    }

                    .employees-section {
                        background: var(--bg-primary);
                        border: 1px solid var(--border-color);
                        border-radius: 0.75rem;
                        padding: 1.5rem;
                        max-height: 60vh;
                        overflow-y: auto;
                    }

                    .employees-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1rem;
                        padding-bottom: 1rem;
                        border-bottom: 1px solid var(--border-color);
                    }

                    .employees-header h3 {
                        font-size: 1.1rem;
                        font-weight: 700;
                        color: var(--text-primary);
                        margin: 0;
                    }

                    .close-btn-small {
                        background: none;
                        border: none;
                        font-size: 1.25rem;
                        color: var(--text-secondary);
                        cursor: pointer;
                        padding: 0;
                    }

                    .employees-count {
                        padding: 0.75rem 1rem;
                        background: var(--bg-secondary);
                        border-radius: 0.5rem;
                        font-weight: 600;
                        color: var(--text-primary);
                        margin-bottom: 1rem;
                        font-size: 0.9rem;
                    }

                    .employees-list {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .employee-card {
                        padding: 1rem;
                        background: var(--bg-secondary);
                        border-radius: 0.5rem;
                        border: 1px solid var(--border-color);
                        transition: all 0.3s ease;
                    }

                    .employee-card:hover {
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        border-color: var(--primary-color);
                    }

                    .employee-header {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        margin-bottom: 1rem;
                        padding-bottom: 1rem;
                        border-bottom: 1px solid var(--border-color);
                    }

                    .employee-avatar {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                    }

                    .employee-info {
                        flex: 1;
                    }

                    .employee-name {
                        font-size: 0.95rem;
                        font-weight: 700;
                        color: var(--text-primary);
                        margin: 0 0 0.25rem 0;
                    }

                    .employee-role {
                        display: inline-block;
                        padding: 0.2rem 0.4rem;
                        background: var(--primary-color);
                        color: white;
                        border-radius: 0.25rem;
                        font-size: 0.7rem;
                        font-weight: 600;
                    }

                    .employee-details {
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .detail-item {
                        display: flex;
                        align-items: flex-start;
                        gap: 0.5rem;
                        font-size: 0.85rem;
                        color: var(--text-secondary);
                    }

                    .detail-item .icon {
                        font-size: 0.9rem;
                        flex-shrink: 0;
                    }

                    .detail-item .text {
                        word-break: break-word;
                    }

                    .empty-state {
                        padding: 2rem;
                        text-align: center;
                        background: var(--bg-secondary);
                        border-radius: 0.75rem;
                        border: 2px dashed var(--border-color);
                    }

                    .empty-icon {
                        font-size: 2.5rem;
                        margin-bottom: 1rem;
                    }

                    .empty-state h3 {
                        font-size: 1rem;
                        color: var(--text-primary);
                        margin-bottom: 0.5rem;
                    }

                    .empty-state p {
                        color: var(--text-secondary);
                        font-size: 0.9rem;
                    }

                    .loading-state {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 2rem;
                    }

                    .spinner {
                        width: 30px;
                        height: 30px;
                        border: 3px solid var(--border-color);
                        border-top-color: var(--primary-color);
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                        margin-bottom: 1rem;
                    }

                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }

                    @media (max-width: 1024px) {
                        .rooms-modal {
                            width: 95vw;
                            max-height: 90vh;
                        }

                        .rooms-modal-content {
                            grid-template-columns: 1fr;
                        }

                        .rooms-grid {
                            grid-template-columns: 1fr;
                        }
                    }

                    @media (max-width: 768px) {
                        .rooms-modal {
                            width: 98vw;
                            max-height: 95vh;
                        }

                        .rooms-modal-header {
                            padding: 1rem;
                        }

                        .rooms-modal-header h2 {
                            font-size: 1.25rem;
                        }

                        .rooms-modal-content {
                            padding: 1rem;
                        }
                    }
                `}</style>
            </div>
        </div>
    )
}

export default RoomsModal
