import axios from 'axios';

async function testApi() {
    try {
        console.log('--- Testing Maintenance Role ---');
        const loginRes1 = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'm1@gmail.com',
            password: 'qwerty'
        });
        const token1 = loginRes1.data.token;
        const maintRes = await axios.get('http://localhost:5000/api/maintenance/dashboard', {
            headers: { Authorization: `Bearer ${token1}` }
        });
        console.log('Maintenance Stats (counts should be valid 0s):', {
            pendingCount: maintRes.data.pendingCount,
            completedCount: maintRes.data.completedCount,
            totalAssets: maintRes.data.totalAssets,
            configCount: maintRes.data.configCount
        });

        console.log('\n--- Testing Supervisor Role ---');
        const loginRes2 = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'hemang123@gmail.com',
            password: 'qwerty'
        });
        const token2 = loginRes2.data.token;
        const supRes = await axios.get('http://localhost:5000/api/supervisor/dashboard', {
            headers: { Authorization: `Bearer ${token2}` }
        });
        console.log('Supervisor Stats (counts should be returned despite null room_id):');
        console.log(JSON.stringify(supRes.data, null, 2));

    } catch (err) {
        console.error('API Error:', err.response?.data || err.message);
    }
}

testApi();
