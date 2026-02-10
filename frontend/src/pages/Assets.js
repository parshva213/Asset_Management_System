import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import api from "../api";
import { formatDate } from "../utils/dateUtils";

const Assets = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [formData, setFormData] = useState({
    company_name: "",
    name: "",
    description: "",
    quantity: "1",
    purchase_cost: "",
    warranty_expiry: "",
    asset_type: "",
    category_id: "",
    location_id: "",
    room_id: "",
    purchase_date: "",
  });

  const fetchInitial = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([fetchAssets()]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const fetchAssets = async () => {
    try {
      console.log("asset")
      const res = await api.get("/assets");
      setAssets(res.data) ? console.log("asset success") : console.log("asset Error");
      
    } catch (err) {
      console.error("Error fetching assets:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log("categories");
      const res = await api.get("/categories");
      setCategories(res.data) ? console.log("cat success") : console.log("cat Error");
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchLocations = async () => {
    try {
      console.log("locations")
      const res = await api.get("/locations");
      setLocations(res.data) ? console.log("loc success") : console.log("loc Error");
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  const fetchRooms = async (locId) => {
    console.log("rooms")
    const targetLocId = locId || formData.location_id;
    if (!targetLocId) {
        setRooms([]);
        return;
    }
    try {
      const res = await api.get(`/locations/${targetLocId}/rooms`);
      console.log("Assets.js: fetchRooms response length:", res.data.length);
      setRooms(res.data) ? console.log("rooms success") : console.log("rooms Error");
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  const resetForm = () => {
    console.log("resetForm")
    setFormData({
      company_name: "",
      name: "",
      description: "",
      quantity: "1",
      purchase_cost: "",
      warranty_expiry: "",
      asset_type: "",
      category_id: "",
      location_id: "",
      room_id: "",
      purchase_date: "",
    });
    setEditingAsset(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "location_id") {
        setFormData((prev) => ({ ...prev, room_id: "" })); // Reset room selection
        fetchRooms(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalName = `${formData.company_name} ${formData.name}`.trim();
      const payload = {
        ...formData,
        name: finalName,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        location_id: formData.location_id ? Number(formData.location_id) : null,
        room_id: formData.room_id ? Number(formData.room_id) : null,
        purchase_cost: formData.purchase_cost ? Number(formData.purchase_cost) : null,
      };

      if (editingAsset) {
        await api.put(`/assets/${editingAsset.id}`, payload);
        showSuccess("Asset updated successfully");
      } else {
        await api.post("/assets", payload);
        showSuccess("Asset created successfully");
      }
      setShowModal(false);
      resetForm();
      fetchAssets();
    } catch (err) {
      console.error("Error saving asset:", err);
      showError(err.response?.data?.message || "Error saving asset");
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    // For edit, we might want to split the name back into company and asset name if possible, 
    // but for now let's just populate the asset name field with the full name to avoid complexity.
    setFormData({
      company_name: "", // Leave empty for edits or logic to extract it
      name: asset.name,
      description: asset.description || "",
      quantity: asset.quantity || "1",
      purchase_cost: asset.purchase_cost || "",
      warranty_expiry: asset.warranty_expiry || "",
      asset_type: asset.asset_type,
      category_id: asset.category_id || "",
      location_id: asset.location_id || "",
      room_id: asset.room_id || "",
      purchase_date: asset.purchase_date || "",
    });
    dataFetch();
  };
  const dataFetch = () => {
    fetchCategories();
    fetchLocations();
    fetchRooms();
    setShowModal(true);
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
          <button onClick={() => dataFetch()} className="btn btn-primary">
            Add Asset
          </button>
        )}
      </div>

      {assets.length === 0 ? (
        <div className="empty-state">
          <p>No assets found</p>
        </div>
      ) : (
        <div className="table-container">
            <table className="table">
            <thead>
                <tr>
                {user?.role === "Super Admin" ? (
                    <>                      
                        <th>Serial Number</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Room</th>
                        <th>Warranty</th>
                        <th>Purchase Cost</th>
                    </>
                ) : (
                    <>
                        <th>Serial Number</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Purchased</th>
                        <th>Warranty</th>
                        <th>Actions</th>
                    </>
                )}
                </tr>
            </thead>
            <tbody>
                {assets.map((asset) => (
                <tr key={asset.id} id={`asset-${asset.id}`}>
                    {user?.role === "Super Admin" ? (
                        <>
                            <td>{asset.sn}</td>
                            <td>{asset.aname}</td>
                            <td>{asset.status}</td>
                            <td>{asset.cat_name}</td>
                            <td>{asset.loc_name}</td>
                            <td>{asset.room_name}</td>
                            <td>{asset.warranty_expiry}</td>
                            <td>{asset.purchase_cost}</td>
                        </>
                    ) : (
                        <>
                            <td>{asset.serial_number || "N/A"}</td>
                            <td>
                            <div className="fw-bold">{asset.name}</div>
                            </td>
                            <td>{asset.category_name || "N/A"}</td>
                            <td>{asset.location_name || "Unassigned"}</td>
                            <td>
                            <span
                                className={`badge ${
                                asset.status === "Available"
                                    ? "badge-success"
                                    : asset.status === "Assigned"
                                    ? "badge-primary"
                                    : "badge-warning"
                                }`}
                            >
                                {asset.status}
                            </span>
                            {asset.status === "Assigned" && asset.assign && (
                                <div className="text-muted small mt-1">To: {asset.assign}</div>
                            )}
                            </td>
                            <td>{formatDate(asset.purchase_date)}</td>
                            <td>{formatDate(asset.warranty_expiry)}</td>
                            <td>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(asset)} className="btn btn-secondary">
                                Edit
                                </button>
                            </div>
                            </td>
                        </>
                    )}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingAsset ? "Edit Asset" : "Add Asset"}</h2>
              <button className="close-modal" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>
            <div className="modal-body">
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                
                {/* Step 1: Asset Type */}
                <div className="form-group">
                    <label className="form-label">Asset Type</label>
                    <select className="form-select" name="asset_type" value={formData.asset_type} onChange={handleChange} required>
                    <option value="">Select Type</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    </select>
                </div>

                {/* Step 2: Category */}
                {formData.asset_type && (
                  <>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-select" name="category_id" value={formData.category_id} onChange={handleChange} required>
                        <option value="">Select category</option>
                        {categories.filter(c => c.type === formData.asset_type).map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <select className="form-select" name="location_id" value={formData.location_id} onChange={handleChange} required>
                        <option value="">Select location</option>
                        {locations.map((l) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                        </select>
                    </div>
                  </>
                )}

                {/* Step 3: Room */}
                {formData.location_id && (
                    <div className="form-group">
                        <label className="form-label">Room</label>
                        <select className="form-select" name="room_id" value={formData.room_id} onChange={handleChange} required>
                        <option value="">Select room</option>
                        {rooms.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                        </select>
                    </div>
                )}

                {/* Step 4: Company Name */}
                {formData.asset_type && (
                    <div className="form-group">
                        <label className="form-label">Company Name</label>
                        <input type="text" className="form-input" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="e.g. Apple" />
                    </div>
                )}

                {/* Step 5: Name, Purchase Date, Quantity */}
                {formData.company_name && (
                  <>
                    <div className="form-group">
                        <label className="form-label">Asset Name</label>
                        <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. MacBook Pro" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Purchase Date</label>
                        <input type="date" className="form-input" name="purchase_date" value={formData.purchase_date} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Quantity</label>
                        <input type="number" className="form-input" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="e.g. 1 or 5" />
                    </div>
                  </>
                )}

                {/* Step 6: Cost, Warranty Expiry, Description */}
                {formData.name && formData.purchase_date && (
                   <>
                    <div className="form-group">
                        <label className="form-label">Purchase Cost for single unit</label>
                        <input type="number" className="form-input" name="purchase_cost" value={formData.purchase_cost} onChange={handleChange} placeholder="e.g. 1200" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Warranty Expiry</label>
                        <input type="date" className="form-input" name="warranty_expiry" value={formData.warranty_expiry} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" name="description" value={formData.description} onChange={handleChange} rows="3" />
                    </div>

                   </>
                )}
                </form>
            </div>
            <div className="modal-footer">
              <div className="flex gap-2 mt-2">
                {formData.purchase_cost && (
                  <button type="submit" onClick={handleSubmit} className="btn btn-primary" style={{flex: 1}}>{editingAsset ? "Update" : "Add"} Asset</button>
                )}
                <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
