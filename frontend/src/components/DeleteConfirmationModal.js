import React from 'react';
import Button from './Button';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                    <h2 className="modal-title" style={{ color: 'var(--danger)' }}>Confirm Deletion</h2>
                    <button className="close-modal" onClick={onClose}>×</button>
                </div>
                
                <div className="modal-body">
                    <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                        {message || `Are you sure you want to delete ${itemName ? `"${itemName}"` : 'this item'}? This action cannot be undone.`}
                    </p>
                    
                    <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                        <Button variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={onConfirm}>
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
