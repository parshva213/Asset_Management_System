"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import api from "../api"
import Button from "../components/Button"

const Categories = () => {
        const { user } = useAuth()
        const { showSuccess, showError } = useToast()
        const [categories, setCategories] = useState([])
        const [loading, setLoading] = useState(true)
        const [showModal, setShowModal] = useState(false)
        const [editingCategory, setEditingCategory] = useState(null)
        const [formData, setFormData] = useState({ name: "", description: "", type: "" })
        const [submitting, setSubmitting] = useState(false)
        const [error, setError] = useState(null)
        const [filterType, setFilterType] = useState("")

        useEffect(() => {
            fetchCategories()
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])

    const fetchCategories = async () => {
            try {
                const response = await api.get("/categories")
                setCategories(response.data)
            } catch (err) {
                console.error("Error fetching categories:", err)
                showError("Failed to load categories")
            } finally {
                setLoading(false)
            }
        }

    const handleSubmit = async (e) => {
            e.preventDefault()
            setError(null)

            if (!formData.type) {
                setError("Please select a category type")
                return
            }

            if (!formData.name || formData.name.trim().length < 2) {
                setError("Category name must be at least 2 characters")
                return
            }

            setSubmitting(true)
            try {
                if (editingCategory) {
                    await api.put(`/categories/${editingCategory.id}`, formData)
                    showSuccess("Category updated successfully")
                    // Update the category in the local state immediately
                    setCategories(prev => prev.map(cat => 
                        cat.id === editingCategory.id 
                            ? { ...cat, name: formData.name, description: formData.description }
                            : cat
                    ))
                } else {
                    const response = await api.post("/categories", formData)
                    showSuccess("Category added successfully")
                    // Add the new category to the local state immediately
                    setCategories(prev => [...prev, { 
                        id: response.data.id, 
                        name: formData.name, 
                        description: formData.description,
                        created_at: new Date().toISOString()
                    }])
                }
                setShowModal(false)
                setEditingCategory(null)
                resetForm()
            } catch (err) {
                console.error("Error saving category:", err)
                showError(err?.response?.data?.message || "Error saving category")
            } finally {
                setSubmitting(false)
            }
        }

        const handleEdit = (category) => {
            setEditingCategory(category)
            setFormData({ 
                name: category.name || "", 
                description: category.description || "",
                type: category.type || "" 
            })
            setShowModal(true)
        }


        const resetForm = () => setFormData({ name: "", description: "", type: "" })

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    if (loading) return <div className="loading">Loading categories...</div>

    return (
        <div>
            <div className="flex-between mb-4">
                <h2>Categories Management</h2>
                {['Super Admin', 'Supervisor'].includes(user?.role) && (
                    <Button onClick={() => {
                        setEditingCategory(null)
                        setFormData({ name: "", description: "", type: "" })
                        setShowModal(true)
                    }}>
                        Add New Category
                    </Button>
                )}
            </div>
            
            <div className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label className="fw-bold" style={{ margin: 0 }}>Filter by Type:</label>
                <select 
                    className="form-select" 
                    style={{maxWidth: '200px'}}
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="">All Types</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                </select>
            </div>

            {categories.length === 0 ? (
                <div className="empty-state">
                    <p>No categories found</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Type</th>
                                {user?.role === "Super Admin" && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {categories
                                .filter(category => !filterType || category.type === filterType)
                                .map((category) => (
                                <tr key={category.id} id={`cat-${category.id}`}>
                                    <td>{category.name}</td>
                                    <td>{category.description || "N/A"}</td>
                                    <td>{category.type || "N/A"}</td>
                                    {user?.role === "Super Admin" && (
                                        <td>
                                            <Button variant="secondary" onClick={() => handleEdit(category)}>
                                                Edit
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingCategory ? "Edit Category" : "Add New Category"}</h2>
                            <button
                                className="close-modal"
                                aria-label="Close"
                                onClick={() => {
                                        setShowModal(false)
                                        setEditingCategory(null)
                                        resetForm()
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                             <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Category Type</label>
                                    <select 
                                        name="type" 
                                        className="form-select"
                                        value={formData.type} 
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Hardware">Hardware</option>
                                        <option value="Software">Software</option>
                                    </select>
                                </div>

                                {formData.type && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Category Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-input"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                minLength={2}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                name="description"
                                                className="form-input"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={3}
                                            />
                                        </div>
                                    </>
                                )}

                                {error && <div className="alert alert-error">{error}</div>}
                            </div>
                            
                            <div className="modal-footer" style={{ borderTop: '1px solid #eee', padding: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowModal(false)
                                        setEditingCategory(null)
                                        resetForm()
                                        setError(null)
                                    }}
                                >
                                    Cancel
                                </Button>
                                {formData.name && (
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? (editingCategory ? "Updating..." : "Adding...") : editingCategory ? "Update Category" : "Add Category"}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
        )
    }
export default Categories