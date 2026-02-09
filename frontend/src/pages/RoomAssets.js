import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";
import { formatDate } from "../utils/dateUtils";

const RoomAssets = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room-id");
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        // Fetch room details to get the name
        // We might need to implement this endpoint if it doesn't exist, 
        // or we could possibly pass it via navigate state, but linking requires fetch.
        // Trying a hypothetical endpoint or falling back.
        if (roomId) {
             try {
                // Assuming we add this endpoint or it exists.
                // Since we don't have a direct "get room by id" in the location routes visible yet (closest was /rooms/:id which is for location),
                // We will implement a specific route for this, or rely on a new one.
                // Let's assume we will add GET /locations/room-details/:id
                const roomRes = await api.get(`/locations/room-details/${roomId}`);
                setRoomName(roomRes.data.name);
             } catch (e) {
                 console.error("Error fetching room details", e);
                 setRoomName("Room #" + roomId);
             }

            const res = await api.get(`/assets?room_id=${roomId}`);
            setAssets(res.data);
        }
      } catch (err) {
        console.error("Error fetching room assets:", err);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchAssets();
    }
  }, [roomId]);

  if (loading) return <div className="loading">Loading assets...</div>;

  return (
    <div>
      <div className="flex-between mb-4">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
                &larr; Back
            </button>
            <h2>Assets in {roomName}</h2>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="empty-state">
          <p>No assets found in this room.</p>
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

export default RoomAssets;
