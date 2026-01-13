"use client"

import React, { useState, useEffect } from "react"
import { useToast } from "../contexts/ToastContext"
import api from "../api"
import Button from "../components/Button"
import { generateKey } from "../utils/helpers"

const Organizations = () => {
    const { showSuccess, showError } = useToast()
    const [organizations, setOrganizations] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingOrganization, setEditingOrganization] = useState(null)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        orgpk: "",
        member: "",
        v_opk: ""
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchOrganizations()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchOrganizations = async () => {
        try {
            const response = await api.get("/organizations")
            setOrganizations(response.data)
        } catch (err) {
            console.error("Error fetching organizations:", err)
            showError("Failed to load organizations")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!formData.name || formData.name.trim().length < 2) {
            setError("Organization name must be at least 2 characters")
            return
        }

        setSubmitting(true)
        try {
            if (editingOrganization) {
                await api.put(`/organizations/${editingOrganization.id}`, formData)
                showSuccess("Organization updated successfully")
                // Update the organization in the local state immediately
                setOrganizations(prev => prev.map(org =>
                    org.id === editingOrganization.id
                        ? { ...org, ...formData }
                        : org
                ))
            } else {
                const response = await api.post("/organizations", formData)
                showSuccess("Organization added successfully")
                // Add the new organization to the local state immediately
                setOrganizations(prev => [...prev, {
                    id: response.data.id,
                    ...formData,
                    created_at: new Date().toISOString()
                }])
            }
            setShowModal(false)
            setEditingOrganization(null)
            resetForm()
        } catch (err) {
            console.error("Error saving organization:", err)
            showError(err?.response?.data?.message || "Error saving organization")
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (organization) => {
        setEditingOrganization(organization)
        setFormData({
            name: organization.name || "",
            description: organization.description || "",
            orgpk: organization.orgpk || "",
            member: organization.member || "",
            v_opk: organization.v_opk || ""
        })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this organization?")) return
        try {
            await api.delete(`/organizations/${id}`)
            // Remove the organization from local state immediately
            setOrganizations(prev => prev.filter(org => org.id !== id))
            showSuccess("Organization deleted successfully")
        } catch (err) {
            console.error("Error deleting organization:", err)
            showError(err?.response?.data?.message || "Error deleting organization")
        }
    }

    const resetForm = () => setFormData({
        name: "",
        description: "",
        orgpk: "",
        member: "",
        v_opk: ""
    })

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    if (loading) return <div className="loading">Loading organizations...</div>

    return (
        <div>
            <div className="flex-between mb-4">
                <h2>Organizations Management</h2>
                <Button onClick={() => {
                    setEditingOrganization(null)
                    setFormData({
                        name: "",
                        description: "",
                        orgpk: generateKey(5),
                        member: "",
                        v_opk: generateKey(5)
                    })
                    setShowModal(true)
                }}>
                    Add Organization
                </Button>
            </div>

            {organizations.length === 0 ? (
                <div className="empty-state">
                    <p>No organizations found</p>
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Org PK</th>
                            <th>Member</th>
                            <th>V OPK</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {organizations.map((organization) => (
                            <tr key={organization.id}>
                                <td>{organization.name}</td>
                                <td>{organization.description || "N/A"}</td>
                                <td>{organization.orgpk || "N/A"}</td>
                                <td>{organization.member || "N/A"}</td>
                                <td>{organization.v_opk || "N/A"}</td>
                                <td>{organization.created_at ? new Date(organization.created_at).toLocaleDateString() : "-"}</td>
                                <td>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" onClick={() => handleEdit(organization)}>
                                            Edit
                                        </Button>
                                        <Button variant="danger" onClick={() => handleDelete(organization.id)}>
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showModal && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">{editingOrganization ? "Edit Organization" : "Add New Organization"}</h3>
                            <button
                                className="close-btn"
                                aria-label="Close"
                                onClick={() => {
                                    setShowModal(false)
                                    setEditingOrganization(null)
                                    resetForm()
                                    setError(null)
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Organization Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    minLength={2}
                                    maxLength={150}
                                    placeholder="Enter organization name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    className="form-input"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter organization description"
                                    maxLength={255}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Org PK</label>
                                <input
                                    type="text"
                                    name="orgpk"
                                    className="form-input"
                                    value={formData.orgpk}
                                    onChange={handleChange}
                                    placeholder="Organization PK"
                                    maxLength={255}
                                    readOnly
                                    style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Member</label>
                                <input
                                    type="text"
                                    name="member"
                                    className="form-input"
                                    value={formData.member}
                                    onChange={handleChange}
                                    placeholder="Enter member"
                                    maxLength={255}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">V OPK</label>
                                <input
                                    type="text"
                                    name="v_opk"
                                    className="form-input"
                                    value={formData.v_opk}
                                    onChange={handleChange}
                                    placeholder="V OPK"
                                    maxLength={255}
                                    readOnly
                                    style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}
                                />
                            </div>

                            {error && <div className="alert alert-error">{error}</div>}

                            <div className="flex gap-2">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (editingOrganization ? "Updating..." : "Adding...") : editingOrganization ? "Update Organization" : "Add Organization"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowModal(false)
                                        setEditingOrganization(null)
                                        resetForm()
                                        setError(null)
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Organizations
