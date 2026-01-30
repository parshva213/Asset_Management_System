import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";
import { formatDate } from "../utils/dateUtils";

const Assets = () => {
  const { user } = useAuth();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    serial_number: "",
    warranty_expiry: "",
    asset_type: "Hardware",
    category_id: "",
    location_id: "",
    purchase_date: "",
  });

  const fetchInitial = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([fetchAssets(), fetchCategories(), fetchLocations()]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const fetchAssets = async () => {
    try {
      const res = await api.get("/assets");
      setAssets(res.data);
    } catch (err) {
      console.error("Error fetching assets:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get("/locations");
      setLocations(res.data);
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      serial_number: "",
      warranty_expiry: "",
      asset_type: "Hardware",
      category_id: "",
      location_id: "",
      purchase_date: "",
    });
    setEditingAsset(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const payload = {
        ...formData,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        location_id: formData.location_id ? Number(formData.location_id) : null,
      };

      if (editingAsset) {
        await api.put(`/assets/${editingAsset.id}`, payload);
        setMessageType("success");
        setMessage("Asset updated successfully");
      } else {
        await api.post("/assets", payload);
        setMessageType("success");
        setMessage("Asset created successfully");
      }
      setShowModal(false);
      resetForm();
      fetchAssets();
    } catch (err) {
      console.error("Error saving asset:", err);
      setMessageType("error");
      setMessage(err.response?.data?.message || "Error saving asset");
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      description: asset.description || "",
      serial_number: asset.serial_number || "",
      warranty_expiry: asset.warranty_expiry || "",
      asset_type: asset.asset_type,
      category_id: asset.category_id || "",
      location_id: asset.location_id || "",
      purchase_date: asset.purchase_date || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await api.delete(`/assets/${id}`);
      fetchAssets();
      setMessageType("success");
      setMessage("Asset deleted successfully");
    } catch (err) {
      console.error("Error deleting asset:", err);
      setMessageType("error");
      setMessage("Error deleting asset");
    }
  };

  if (loading) return <div className="loading">Loading assets...</div>;

  if ((user?.role === "Supervisor" || user?.role === "Employee") && !user?.room_id) {
    return (
      <div className="content">
        <div className="flex-center h-full">
           <div className="empty-state">
             <h3>Set your location first</h3>
             <p className="text-secondary">You need to be assigned to a room to view the assets.</p>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>Assets Management</h2>
        {(user?.role === "Super Admin" || user?.role === "Supervisor") && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            Add Asset
          </button>
        )}
      </div>

      {message && (
        <div className={`alert ${messageType === "success" ? "alert-success" : messageType === "error" ? "alert-error" : "alert-info"}`}>
          {message}
        </div>
      )}

      {assets.length === 0 ? (
        <div className="empty-state">
          <p>No assets found</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Serial Number</th>
              <th>Warranty Expiry</th>
              <th>Category</th>
              <th>Location</th>
              <th>Purchase Date</th>
              {(user?.role === "Super Admin" || user?.role === "Supervisor") && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} id={`asset-${asset.id}`}>
                <td>{asset.name}</td>
                <td>{asset.asset_type}</td>
                <td>{asset.serial_number || "N/A"}</td>
                <td>{formatDate(asset.warranty_expiry) || "N/A"}</td>
                <td>{asset.category_name || "N/A"}</td>
                <td>{asset.location_name || "N/A"}</td>
                <td>{formatDate(asset.purchase_date) || "N/A"}</td>
                {(user?.role === "Super Admin" || user?.role === "Supervisor") && (
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(asset)} className="btn btn-secondary">Edit</button>
                      <button onClick={() => handleDelete(asset.id)} className="btn btn-danger">Delete</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingAsset ? "Edit Asset" : "Add Asset"}</h3>
              <button className="close-btn" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Asset Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Asset Type</label>
                <select name="asset_type" value={formData.asset_type} onChange={handleChange}>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                </select>
              </div>

              {formData.asset_type === "Hardware" ? (
                <div className="form-group">
                  <label>Serial Number</label>
                  <input type="text" name="serial_number" value={formData.serial_number} onChange={handleChange} />
                </div>
              ) : (
                <div className="form-group">
                  <label>Warranty Expiry</label>
                  <input type="date" name="warranty_expiry" value={formData.warranty_expiry} onChange={handleChange} />
                </div>
              )}

              <div className="form-group">
                <label>Category</label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>
                <select name="location_id" value={formData.location_id} onChange={handleChange} required>
                  <option value="">Select location</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Purchase Date</label>
                <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
              </div>

              <div className="flex gap-2 mt-2">
                <button type="submit" className="btn btn-primary">{editingAsset ? "Update" : "Add"} Asset</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
