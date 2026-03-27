import { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import api from "../api";
import { formatDate } from "../utils/dateUtils";

const Assets = () => {
  const { user } = useAuth();
  // const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [itemsList, setItemsList] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedItemType, setSelectedItemType] = useState("");
  const [itemsLoading, setItemsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [itemToAssign, setItemToAssign] = useState(null);
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [viewType, setViewType] = useState("assets");
  const [requests, setRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState("my");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    asset_id: "",
    request_type: "Repair",
    reason: "",
    description: "",
    priority: "Medium",
    location_id: "",
    room_id: "",
    asset_name: "",
  });

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

  const fetchAssets = useCallback(async () => {
    try {
      let path = "/assets";
      if (user?.role === "Employee") {
        path = `/assets/current-asset/${user?.id}`;
      } else if (user?.role === "Supervisor") {
        path = `/assets?location_id=${user?.loc_id}&room_id=${user?.room_id}`;
      }
      const res = await api.get(`${path}`);
      let assetList = res.data;
      // for admins, if they have a room defined sort assets so any duplicates
      // prefer the ones in their current room first before others
      if ((user?.role === "Super Admin" || user?.role === "Admin") && user?.loc_id && user?.room_id) {
        assetList = assetList.slice().sort((a, b) => {
          if (a.name === b.name || a.aname === b.aname) {
            const aRoomMatch = a.room_id === user.room_id;
            const bRoomMatch = b.room_id === user.room_id;
            if (aRoomMatch && !bRoomMatch) return -1;
            if (bRoomMatch && !aRoomMatch) return 1;
          }
          return 0;
        });
      }
      setAssets(assetList) ? console.log("asset success") : console.log("asset Error");

    } catch (err) {
      console.error("Error fetching assets:", err);
    }
  }, [user]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data) ? console.log("cat success") : console.log("cat Error");
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await api.get("/locations");
      setLocations(res.data) ? console.log("loc success") : console.log("loc Error");
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  }, []);
  
  const fetchRooms = useCallback(async () => {
    try {
      if (!user?.loc_id) {
        setRooms([]);
        return;
      }
      const res = await api.get(`/locations/${user?.loc_id}/rooms`);
      setRooms(res.data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  }, [user?.loc_id]);

  const fetchLocationName = useCallback(async () => {
    try {
      if (!user?.loc_id) {
        setLocationName("");
        return;
      }
      const res = await api.get(`/locations/${user?.loc_id}`);
      setLocationName(res.data.name);
    } catch (err) {
      console.error("Error fetching location name:", err);
    }
  }, [user?.loc_id]); 

  const fetchRoomName = useCallback(async () => {
    try {
      if (!user?.room_id) {
        if(user?.role === "Supervisor") {
          setRoomName("");
        }
        return;
      }
      const res = await api.get(`/locations/rooms/${user?.room_id}`);
      setRoomName(res.data.name);
    } catch (err) {
      console.error("Error fetching room name:", err);
    }
  }, [user?.room_id, user?.role]);

  const fetchTeamMembers = useCallback(async () => {
    try {
      if (user?.role !== "Supervisor") return;
      const res = await api.get("/users");
      setTeamMembers(res.data);
    } catch (err) {
      console.error("Error fetching team members:", err);
    }
  }, [user]);

  const fetchRequests = useCallback(async () => {
    try {
      if (user?.role !== "Supervisor") return;
      const res = await api.get("/requests");
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  }, [user]);

  const fetchInitial = useCallback(async () => {
    try {
      setLoading(true);
      const promises = [fetchAssets(), fetchCategories(), fetchLocations(), fetchLocationName(), fetchRoomName(), fetchRooms()];
      if (user?.role === "Supervisor") {
        promises.push(fetchTeamMembers());
        promises.push(fetchRequests());
      }
      await Promise.all(promises);
    } finally {
      setLoading(false);
    }
  }, [fetchAssets, fetchCategories, fetchLocations, fetchLocationName, fetchRoomName, fetchRooms, fetchTeamMembers, fetchRequests, user?.role]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const resetForm = () => {
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
    setRooms([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "location_id") {
      setFormData(prev => ({ ...prev, room_id: "" }));
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

  const handleViewItems = async (assetName, assetType) => {
    try {
      setItemsLoading(true);
      setSelectedItemName(assetName);
      setSelectedItemType(assetType);
      setShowItemsModal(true);
      const res = await api.get(`/assets?location_id=${user.loc_id}&room_id=${user.room_id}&detailed=true&name=${encodeURIComponent(assetName)}`);
      setItemsList(res.data);
    } catch (err) {
      console.error("Error fetching individual items:", err);
      showError("Error fetching individual items");
    } finally {
      setItemsLoading(false);
    }
  };

  const handleUnassign = async (assetId) => {
    if (!window.confirm("Are you sure you want to unassign this asset?")) return;
    try {
      setAssigningLoading(true);
      await api.post("/users/unassign-asset", { asset_id: assetId });
      showSuccess("Asset unassigned successfully");
      // Refresh items list
      handleViewItems(selectedItemName, selectedItemType);
      fetchAssets();
    } catch (err) {
      console.error("Error unassigning asset:", err);
      showError("Error unassigning asset");
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleAssignClick = (item) => {
    setItemToAssign(item);
    setShowAssignModal(true);
  };

  const confirmAssign = async () => {
    if (!selectedAssignee) {
      showError("Please select a user");
      return;
    }
    try {
      setAssigningLoading(true);
      await api.post("/users/assign-asset", { 
        user_id: selectedAssignee, 
        asset_id: itemToAssign.id,
        notes: "Assigned via Assets page"
      });
      showSuccess("Asset assigned successfully");
      setShowAssignModal(false);
      setItemToAssign(null);
      setSelectedAssignee("");
      // Refresh items list
      handleViewItems(selectedItemName, selectedItemType);
      fetchAssets();
    } catch (err) {
      console.error("Error assigning asset:", err);
      showError("Error assigning asset");
    } finally {
      setAssigningLoading(false);
    }
  };
  const dataFetch = () => {
    fetchCategories();
    fetchLocations();

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
        <div>
          <h2 className="page-title">
            {user?.role === "Super Admin"
              ? "List of Assets Not Working"
              : user?.role === "Supervisor"
                ? viewType === "requests"
                  ? `Requested Assets for ${locationName} - ${roomName}`
                  : `Manage Assets for ${locationName} - ${roomName}`
                : user?.role === "Employee"
                  ? "My Assigned Assets"
                  : "Assets Management"}
          </h2>
        </div>
        <div className="action-bar-right">
          {user?.role === "Super Admin" && (
            <button onClick={() => dataFetch()} className="btn btn-primary">
              Add Asset
            </button>
          )}
          {user?.role === "Supervisor" && (
            <button
              onClick={() => setViewType(viewType === "assets" ? "requests" : "assets")}
              className="btn btn-primary"
            >
              {viewType === "assets" ? "Requested Assets" : "Assets"}
            </button>
          )}
        </div>
      </div>
      {user?.role === "Supervisor" && viewType === "requests" && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setRequestFilter("my")}
              className={`btn ${requestFilter === "my" ? "btn-primary" : "btn-secondary"}`}
            >
              My Request
            </button>
            <button
              onClick={() => setRequestFilter("other")}
              className={`btn ${requestFilter === "other" ? "btn-primary" : "btn-secondary"}`}
            >
              Another Request
            </button>
          </div>
          {requestFilter === "my" && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="btn btn-primary"
            >
              Add Request
            </button>
          )}
        </div>
      )}
      {(user?.role === "Super Admin" || user?.role === "Supervisor" || user?.role === "Employee") && (
      <>
      {user?.role === "Supervisor" && viewType === "requests" ? (
        // Requested Assets View for Supervisors
        <>
        {(() => {
          const filteredRequests = requestFilter === "my" 
            ? requests.filter(req => req.requested_by === user?.id)
            : requests.filter(req => req.requested_by !== user?.id);
          
          return filteredRequests.length === 0 ? (
            <div className="empty-state">
              <p>No {requestFilter === "my" ? "personal" : "other"} requested assets found</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ASSET NAME</th>
                    <th>REQUEST TYPE</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>REQUESTED BY</th>
                    <th>REASON</th>
                    <th>DESCRIPTION</th>
                    <th>DATE REQUESTED</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.asset_name || "N/A"}</td>
                    <td>{request.request_type}</td>
                    <td>
                      <span className={`badge ${
                        request.priority === "High" ? "badge-danger" :
                        request.priority === "Medium" ? "badge-warning" :
                        "badge-success"
                      }`}>
                        {request.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        request.status === "Approved" ? "badge-success" :
                        request.status === "Rejected" ? "badge-danger" :
                        "badge-primary"
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td>{request.requester_name || "N/A"}</td>
                    <td>{request.reason || "N/A"}</td>
                    <td>{request.description || "N/A"}</td>
                    <td>{formatDate(request.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
        </>
      ) : (
        // Assets View
        <>
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
                ) : user?.role === "Supervisor" ? (
                  <>
                    <th>NAME</th>
                    <th>QUANTITY</th>
                    <th>ASSIGNED</th>
                    <th>ACTIVE</th>
                    <th>NOT ACTIVE</th>
                    <th>CATEGORY</th>
                    <th>ACTIONS</th>
                  </>
                ) : (
                  <>
                    <th>SERIAL NUMBER</th>
                    <th>ASSET NAME</th>
                    <th>CATEGORY</th>
                    <th>ACTIONS</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <tr key={asset.id || index} id={asset.id ? `asset-${asset.id}` : `asset-row-${index}`}>
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
                  ) : user?.role === "Supervisor" ? (
                    <>
                      <td>{asset.aname}</td>
                      <td>{asset.quantity}</td>
                      <td>{asset.assigned_total || 0}</td>
                      <td>{asset.active}</td>
                      <td>{asset.not_active}</td>
                      <td>{asset.cat_name || "N/A"}</td>
                      <td>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '13px' }}
                          onClick={() => handleViewItems(asset.aname, asset.asset_type)}
                        >
                          View Items
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{asset.serial_number || asset.sn || "N/A"}</td>
                      <td>
                        <div className="fw-bold">{asset.name || asset.aname}</div>
                      </td>
                      <td>{asset.category_name || asset.cat_name || "N/A"}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '13px' }}
                          onClick={() => {
                            setRequestFormData({
                              asset_id: asset.id,
                              request_type: "Repair",
                              reason: "",
                              description: "",
                              priority: "Medium",
                              location_id: user?.loc_id,
                              room_id: user?.room_id,
                              asset_name: `${asset.name || asset.aname}${asset.serial_number || asset.sn ? ` - ${asset.serial_number || asset.sn}` : ""}`
                            });
                            setShowRequestModal(true);
                          }}
                        >
                          Request
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>
      )}
      </>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingAsset ? "Edit Asset" : "Add Asset"}</h2>
              <button className="close-modal" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

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
                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <input type="text" className="form-input" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="e.g. Apple" />
                    </div>
                  </>
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
                      <input type="number" className="form-input" name="quantity" min="1" value={formData.quantity} onChange={handleChange} placeholder="e.g. 1 or 5" />
                    </div>
                  </>
                )}

                {/* Step 6: Cost, Warranty Expiry, Description */}
                {formData.name && formData.purchase_date && formData.quantity && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Purchase Cost for single unit</label>
                      <input type="number" className="form-input" name="purchase_cost" min="0" value={formData.purchase_cost} onChange={handleChange} placeholder="e.g. 1200" />
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
                  <button type="submit" onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1 }}>{editingAsset ? "Update" : "Add"} Asset</button>
                )}
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showItemsModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '90vw', maxWidth: '1000px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '2rem', background: 'linear-gradient(135deg, #1a1d3a 0%, #2a2e5d 100%)', borderBottom: '1px solid #3d447a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#fff' }}>{selectedItemName}</h2>
                <span style={{ fontSize: '0.9rem', color: '#a3b1c6', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>{selectedItemType}</span>
              </div>
              <button className="close-modal" onClick={() => setShowItemsModal(false)} style={{ fontSize: '32px', color: '#fff', opacity: '0.8', transition: 'opacity 0.2s', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '0 2rem 2rem 2rem', background: '#13152a' }}>
              {itemsLoading ? (
                <div className="text-center p-12"><div className="spinner-inline"></div><p style={{ marginTop: '1rem', color: '#a3b1c6' }}>Loading items...</p></div>
              ) : itemsList.length === 0 ? (
                <div className="text-center p-12"><p style={{ color: '#a3b1c6', fontSize: '1.1rem' }}>No individual items found.</p></div>
              ) : (
                  <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px', width: '100%' }}>
                    <thead style={{ position: 'sticky', top: -25, zIndex: 10 }}>
                      <tr>
                        <th style={{ backgroundColor: '#13152a', color: '#7e8db4', padding: '20px 15px 10px 15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', borderBottom: '1px solid #3d447a' }}>Serial Number</th>
                        <th style={{ backgroundColor: '#13152a', color: '#7e8db4', padding: '20px 15px 10px 15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', borderBottom: '1px solid #3d447a' }}>Status</th>
                        <th style={{ backgroundColor: '#13152a', color: '#7e8db4', padding: '20px 15px 10px 15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', borderBottom: '1px solid #3d447a' }}>Assigned To</th>
                        <th style={{ backgroundColor: '#13152a', color: '#7e8db4', padding: '20px 15px 10px 15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', borderBottom: '1px solid #3d447a' }}>Warranty</th>
                        <th style={{ backgroundColor: '#13152a', color: '#7e8db4', padding: '20px 15px 10px 15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', borderBottom: '1px solid #3d447a' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsList.map((item) => (
                        <tr key={item.id} className="premium-row" style={{ backgroundColor: '#1a1d3a', transition: 'transform 0.2s, background-color 0.2s' }}>
                          <td style={{ padding: '15px', fontSize: '14px', fontWeight: '500', color: '#fff', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>{item.sn}</td>
                          <td style={{ padding: '15px' }}>
                            <span className={`badge ${
                              item.status === 'Available' ? 'badge-success' : 
                              item.status === 'Assigned' ? 'badge-primary' : 'badge-warning'
                            }`} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                              {item.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '15px', fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>{item.assign_to || "-"}</td>
                          <td style={{ padding: '15px', fontSize: '14px', color: '#a3b1c6' }}>{formatDate(item.warranty_expiry)}</td>
                          <td style={{ padding: '15px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              {item.status === 'Available' ? (
                                <button 
                                  onClick={() => handleAssignClick(item)}
                                  className="btn-polish-primary"
                                  style={{ 
                                    padding: '0.5rem 0', 
                                    fontSize: '12px', 
                                    fontWeight: '600',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: '#4e54c8',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 6px rgba(78, 84, 200, 0.3)',
                                    width: '85px',
                                    textAlign: 'center'
                                  }}
                                >
                                  Assign
                                </button>
                              ) : (
                                item.status === 'Assigned' && item.assignee_ownpk === null && item.assignee_unpk === user?.ownpk && (
                                  <button 
                                    onClick={() => handleUnassign(item.id)}
                                    className="btn-polish-danger"
                                    style={{ 
                                      padding: '0.5rem 0', 
                                      fontSize: '12px', 
                                      fontWeight: '600',
                                      borderRadius: '6px',
                                      border: 'none',
                                      backgroundColor: '#ff4b2b',
                                      color: '#fff',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      boxShadow: '0 4px 6px rgba(255, 75, 43, 0.3)',
                                      width: '85px',
                                      textAlign: 'center'
                                    }}
                                  >
                                    Unassign
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Assign {itemToAssign?.sn}</h2>
              <button className="close-modal" onClick={() => setShowAssignModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group mb-4">
                <label className="form-label">Select Team Member</label>
                <select 
                  className="form-input"
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                >
                  <option value="">Select User</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={confirmAssign}
                disabled={assigningLoading || !selectedAssignee}
              >
                {assigningLoading ? "Assigning..." : "Confirm Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>Add Request</h2>
              <button 
                className="close-modal" 
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestFormData({
                    asset_id: "",
                    request_type: "Repair",
                    reason: "",
                    description: "",
                    priority: "Medium",
                    location_id: "",
                    room_id: "",
                    asset_name: "",
                  });
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Asset</label>
                  <input
                    type="text"
                    className="form-input"
                    value={requestFormData.asset_name}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Request Type</label>
                  <select 
                    className="form-input"
                    value={requestFormData.request_type}
                    onChange={(e) => setRequestFormData(prev => ({ ...prev, request_type: e.target.value }))}
                  >
                    <option value="Repair">Repair</option>
                    <option value="Replacement">Replacement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select 
                    className="form-input"
                    value={requestFormData.priority}
                    onChange={(e) => setRequestFormData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter reason"
                    value={requestFormData.reason}
                    onChange={(e) => setRequestFormData(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input" 
                    rows="4"
                    placeholder="Enter description"
                    value={requestFormData.description}
                    onChange={(e) => setRequestFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestFormData({
                    asset_id: "",
                    request_type: "Repair",
                    reason: "",
                    description: "",
                    priority: "Medium",
                    location_id: "",
                    room_id: "",
                    asset_name: "",
                  });
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    await api.post("/requests", requestFormData);
                    showSuccess("Request created successfully");
                    setShowRequestModal(false);
                    setRequestFormData({
                      asset_id: "",
                      request_type: "Repair",
                      reason: "",
                      description: "",
                      priority: "Medium",
                    });
                    fetchRequests();
                  } catch (err) {
                    console.error("Error creating request:", err);
                    showError(err.response?.data?.message || "Error creating request");
                  }
                }}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
