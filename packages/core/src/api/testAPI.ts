import { FOURSQUARE_API_KEY, API_URL } from '../utils/env';

/**
 * Simple function to test if the Foursquare API key is working
 */
export const testFoursquareAPI = async () => {
  console.log('🧪 Testing Foursquare API...');
  console.log('🔑 API Key:', FOURSQUARE_API_KEY ? 'Present' : 'Missing');
  console.log('🌐 API URL:', API_URL);
  
  try {
    const testUrl = `${API_URL}/places/search?ll=30.2672,-97.7431&limit=1`;
    console.log('📡 Making test request to:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': FOURSQUARE_API_KEY,
      },
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', JSON.stringify([...response.headers.entries()]));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Test Failed:', response.status, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
    
    const data = await response.json();
    console.log('✅ API Test Successful!');
    console.log('📍 Found', data.results?.length || 0, 'venues');
    return { success: true, data };
    
  } catch (error) {
    console.error('💥 API Test Error:', error);
    return { success: false, error: error.message };
  }
};

export default testFoursquareAPI;