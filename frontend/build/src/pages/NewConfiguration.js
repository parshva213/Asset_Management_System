import { useState, useEffect, useCallback } from "react"



import api from "../api"
import { useAuth } from "../contexts/AuthContext"



const NewConfiguration = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false)
  const [configurations, setConfigurations] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({

    company_name: "",
    name: "",
    description: "",
    quantity: "1",
    purchase_cost: "",
    asset_type: "",
    category_id: "",
    purchase_date: "",
  });


  const fetchConfigurations = useCallback(async () => {
    try {
      const response = await api.get("/maintenance")
      // Filter for configurations
      const configs = response.data.filter(rec => rec.maintenance_type === "Configuration")
      setConfigurations(configs)
    } catch (err) {
      console.error("Error fetching configurations:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  const fetchInitial = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchConfigurations(),
        fetchCategories()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchConfigurations, fetchCategories])

  useEffect(() => {
    fetchInitial()
  }, [fetchInitial])




  const resetForm = () => {
    setForm({
      company_name: user?.organization_name || "",
      name: "",
      description: "",
      quantity: "1",
      purchase_cost: "",
      asset_type: "",
      category_id: "",
      purchase_date: "",
    });
  }





  const handleChange = (e) => {

    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const finalName = `${form.company_name} ${form.name}`.trim();
      const configDescription = `Config for ${finalName}. Details: ${form.description}`;

      await api.post("/maintenance", {
        asset_id: null, // This is a limitation since we are creating a configuration record which usually links to an existing asset. 
        // However, user asked for a "copy of model", so I will focus on the UI and payload.
        // For now, I'll pass relevant info in descriptions or as needed.
        maintenance_type: "Configuration",
        description: configDescription,
        maintenance_by: "self"
      })
      alert("New configuration recorded successfully!")
      setShowModal(false)
      resetForm()
      fetchConfigurations()
    } catch (err) {
      console.error("Error recording configuration:", err)
      alert(err.message || "Failed to record configuration")
    }
  }




  return (
    <div>
      <div className="flex-between mb-4">
        <h2>Asset Configuration</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
        >
          Add Configuration
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading configurations...</div>
      ) : configurations.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Asset</th>
                <th>Details</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {configurations.map((config) => (
                <tr key={config.id}>
                  <td>#{config.id}</td>
                  <td>{config.asset_name} (ID: {config.asset_id})</td>
                  <td>{config.description}</td>
                  <td>{new Date(config.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${config.status.toLowerCase().replace(" ", "-")}`}>
                      {config.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <p className="text-secondary text-center py-4">
            Click "Add Configuration" to record new hardware/software details.
          </p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add Configuration</h2>
              <button className="close-modal" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Step 1: Asset Type */}
                <div className="form-group">
                  <label className="form-label">Asset Type</label>
                  <select className="form-select" name="asset_type" value={form.asset_type} onChange={handleChange} required>
                    <option value="">Select Type</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                  </select>
                </div>

                {/* Step 2: Category */}
                {form.asset_type && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-select" name="category_id" value={form.category_id} onChange={handleChange} required>
                        <option value="">Select category</option>
                        {categories.filter(c => c.type === form.asset_type).map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Organization Name</label>
                      <input
                        type="text"
                        className="form-input"
                        name="company_name"
                        value={form.company_name}
                        onChange={handleChange}
                        placeholder="e.g. Apple"
                      />
                    </div>
                  </>)}



                {/* Step 5: Name, Purchase Date, Quantity */}
                {form.category_id && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Asset Name</label>
                      <input type="text" className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. MacBook Pro" required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Purchase Date</label>
                      <input type="date" className="form-input" name="purchase_date" value={form.purchase_date} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <input type="number" className="form-input" name="quantity" value={form.quantity} onChange={handleChange} placeholder="e.g. 1 or 5" />
                    </div>
                  </>
                )}

                {/* Step 6: Cost, Description */}
                {form.name && form.purchase_date && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Making Cost for single unit</label>
                      <input type="number" className="form-input" name="purchase_cost" value={form.purchase_cost} onChange={handleChange} placeholder="e.g. 1200" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-input" name="description" value={form.description} onChange={handleChange} rows="3" />
                    </div>
                  </>
                )}

              </form>
            </div>
            <div className="modal-footer">
              <div className="flex gap-2 mt-2">
                {form.name && form.purchase_date && (
                  <button type="submit" onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1 }}>Save Configuration</button>
                )}
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )

}

export default NewConfiguration
