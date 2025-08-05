const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testBasicEndpoints() {
  console.log('🧪 Testing Basic Project Endpoints');
  console.log('==================================');

  try {
    // Test if server is running
    console.log('1. Testing server connection...');
    const response = await api.get('/');
    console.log('✅ Server is running');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Server is running (404 is expected for root endpoint)');
    } else {
      console.log('❌ Server connection failed:', error.message);
      return;
    }
  }

  try {
    // Test project endpoints without auth
    console.log('\n2. Testing project endpoints...');
    
    // Test GET /projects (should return 401 due to auth guard)
    try {
      const projectsResponse = await api.get('/projects');
      console.log('❌ Unexpected: GET /projects should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ GET /projects requires authentication (expected)');
      } else {
        console.log('❌ Unexpected error for GET /projects:', error.response?.status);
      }
    }

    // Test POST /projects (should return 401 due to auth guard)
    try {
      const createResponse = await api.post('/projects', {
        title: 'Test Project',
        clientName: 'Test Client',
        clientId: 1,
      });
      console.log('❌ Unexpected: POST /projects should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ POST /projects requires authentication (expected)');
      } else {
        console.log('❌ Unexpected error for POST /projects:', error.response?.status);
      }
    }

    console.log('\n✅ Basic endpoint tests completed!');
    console.log('📝 The endpoints are working but require authentication.');
    console.log('🔐 To test with authentication, you need to:');
    console.log('   1. Login to get a JWT token');
    console.log('   2. Include the token in the Authorization header');
    console.log('   3. Run the full test suite');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run the test
testBasicEndpoints().catch(console.error); 