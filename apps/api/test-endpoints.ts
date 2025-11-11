import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000/api';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  statusCode?: number;
  error?: string;
  responseTime?: number;
  data?: any;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
  const emoji = result.status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} ${result.method} ${result.endpoint} - ${result.status}`);
  if (result.responseTime) {
    console.log(`   Response Time: ${result.responseTime}ms`);
  }
  if (result.statusCode) {
    console.log(`   Status Code: ${result.statusCode}`);
  }
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
  if (result.data && result.status === 'PASS') {
    console.log(`   Sample Data:`, JSON.stringify(result.data).substring(0, 200) + '...');
  }
  console.log('');
}

async function testEndpoint(
    method: 'GET' | 'POST',
    endpoint: string,
    body?: any
): Promise<TestResult> {
  const startTime = Date.now();
  const result: TestResult = {
    endpoint,
    method,
    status: 'FAIL'
  };

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    let response;

    if (method === 'GET') {
      response = await axios.get(url);
    } else {
      response = await axios.post(url, body);
    }

    result.statusCode = response.status;
    result.responseTime = Date.now() - startTime;
    result.data = response.data;

    if (response.status === 200 || response.status === 201) {
      result.status = 'PASS';
    }
  } catch (error: any) {
    result.responseTime = Date.now() - startTime;
    result.error = error.message;
    result.statusCode = error.response?.status;
  }

  results.push(result);
  logResult(result);
  return result;
}

async function runAllTests() {
  console.log('🚀 Backend API Endpoint Tests');
  console.log(`📍 Base URL: ${API_BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);

  await testEndpoint('GET', '/stats');
  await testEndpoint('GET', '/invoice-trends');
  await testEndpoint('GET', '/vendors/top10');
  await testEndpoint('GET', '/category-spend');
  await testEndpoint('GET', '/cash-outflow');
  await testEndpoint('GET', '/invoices');
  await testEndpoint('GET', '/invoices?search=invoice');
  await testEndpoint('GET', '/invoices?sortBy=invoiceTotal&sortOrder=desc');
  await testEndpoint('GET', '/history');

  if (process.env.VANNA_API_BASE_URL) {
    await testEndpoint('POST', '/chat-with-data', {
      query: 'What is the total number of invoices?'
    });
  } else {
    console.log('⚠️  Skipped: VANNA_API_BASE_URL not configured\n');
  }

  await testEndpoint('POST', '/export/csv', {
    sql: 'SELECT * FROM "Invoice" LIMIT 10'
  });

  await testEndpoint('POST', '/export/excel', {
    sql: 'SELECT * FROM "Invoice" LIMIT 10'
  });

  console.log('📋 Test Summary');

  const passedTests = results.filter(r => r.status === 'PASS').length;
  const failedTests = results.filter(r => r.status === 'FAIL').length;
  const totalTests = results.length;
  const avgResponseTime = results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length;

  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%\n`);

  if (failedTests > 0) {
    console.log('❌ Failed Tests Details:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.method} ${r.endpoint}`);
      console.log(`    Status: ${r.statusCode || 'N/A'}`);
      console.log(`    Error: ${r.error || 'Unknown error'}`);
    });
  }

  console.log(`⏰ Completed: ${new Date().toISOString()}`);

  process.exit(failedTests > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('❌ Unexpected error during testing:', error);
  process.exit(1);
});