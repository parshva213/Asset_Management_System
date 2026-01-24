import axios from "axios";
import jwt from "jsonwebtoken";

// Create a valid test token
const token = jwt.sign(
  {
    id: 2,
    email: "admin@gmail.com",
    role: "Super Admin",
    org_id: 2,
  },
  "your-secret-key", // This should match your JWT secret in the backend
  { expiresIn: "1h" }
);

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

async function testEndpoint() {
  try {
    console.log("Testing GET /locations/4/rooms...\n");

    const response = await api.get("/locations/4/rooms");
    console.log("✅ SUCCESS! Response:");
    console.log("Rooms found:", response.data.length);
    response.data.forEach((room) => {
      console.log(`  - ${room.name} (ID: ${room.id}, Floor: ${room.floor})`);
    });
  } catch (error) {
    console.error("❌ Error:", error.response?.status, error.response?.data || error.message);
  }
}

testEndpoint();
