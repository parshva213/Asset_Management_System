import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api";
import { formatDate } from "../utils/dateUtils";

const LocationAssets = () => {
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get("loc-id");
  const [assets, setAssets] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        // Fetch location details first to get the name
        if (locationId) {
             try {
                const locRes = await api.get(`/locations/${locationId}`);
                setLocationName(locRes.data.name);
             } catch (e) {
                 console.error("Error fetching location details", e);
                 setLocationName("Unknown Location");
             }

            const res = await api.get(`/assets?location_id=${locationId}`);
            setAssets(res.data);
        }
      } catch (err) {
        console.error("Error fetching location assets:", err);
      } finally {
        setLoading(false);
      }
    };

    if (locationId) {
      fetchAssets();
    }
  }, [locationId]);

  if (loading) return <div className="loading">Loading assets...</div>;

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>Assets at {locationName}</h2>
        <Link to="/locations" className="btn btn-secondary">
          Back to Locations
        </Link>
      </div>

      {assets.length === 0 ? (
        <div className="empty-state">
          <p>No assets found in this location.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Serial Number</th>
              <th>Category</th>
              <th>Status</th>
              <th>Purchase Date</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} id={`asset-${asset.id}`}>
                <td>{asset.name}</td>
                <td>{asset.asset_type}</td>
                <td>{asset.serial_number || "N/A"}</td>
                <td>{asset.category_name || "N/A"}</td>
                <td>
                    <span className={`status-badge status-${asset.status.toLowerCase().replace(" ", "-")}`}>
                        {asset.status}
                    </span>
                </td>
                <td>{formatDate(asset.purchase_date) || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LocationAssets;
