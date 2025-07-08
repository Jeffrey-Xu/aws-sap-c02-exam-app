#!/usr/bin/env node

import https from 'https';

const BASE_URL = 'https://aws-sap-c02-exam-app.vercel.app';

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(result);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testProfileAPI() {
  console.log('🧪 Testing Profile API...\n');
  
  // Test 1: Profile API without token (should return 401)
  console.log('Test 1: Profile API without token');
  try {
    const result = await makeRequest({
      hostname: 'aws-sap-c02-exam-app.vercel.app',
      path: '/api/auth/profile',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { firstName: 'Test', lastName: 'User' });
    
    console.log(`Status: ${result.statusCode}`);
    console.log(`Response:`, result.body);
    console.log(result.statusCode === 401 ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Profile API with invalid token (should return 401)
  console.log('Test 2: Profile API with invalid token');
  try {
    const result = await makeRequest({
      hostname: 'aws-sap-c02-exam-app.vercel.app',
      path: '/api/auth/profile',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      }
    }, { firstName: 'Test', lastName: 'User' });
    
    console.log(`Status: ${result.statusCode}`);
    console.log(`Response:`, result.body);
    console.log(result.statusCode === 401 ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: OPTIONS request (CORS preflight)
  console.log('Test 3: CORS preflight (OPTIONS)');
  try {
    const result = await makeRequest({
      hostname: 'aws-sap-c02-exam-app.vercel.app',
      path: '/api/auth/profile',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://aws-sap-c02-exam-app.vercel.app',
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log(`Status: ${result.statusCode}`);
    console.log(`CORS Headers:`, {
      'Access-Control-Allow-Origin': result.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': result.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': result.headers['access-control-allow-headers']
    });
    console.log(result.statusCode === 200 ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
}

async function testQuestionsData() {
  console.log('\n🧪 Testing Questions Data...\n');
  
  try {
    const result = await makeRequest({
      hostname: 'aws-sap-c02-exam-app.vercel.app',
      path: '/data/questions.json',
      method: 'GET'
    });
    
    console.log(`Status: ${result.statusCode}`);
    if (result.statusCode === 200 && Array.isArray(result.body)) {
      console.log(`Questions loaded: ${result.body.length}`);
      console.log(`First question ID: ${result.body[0]?.id}`);
      console.log(`First question has options: ${Array.isArray(result.body[0]?.options)}`);
      console.log('✅ PASS');
    } else {
      console.log('❌ FAIL - Invalid response');
      console.log('Response:', result.body);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  await testProfileAPI();
  await testQuestionsData();
  
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error);
