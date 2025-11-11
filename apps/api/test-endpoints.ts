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
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 Backend API Endpoint Tests');
  console.log(`📍 Base URL: ${API_BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test 1: GET /stats
  console.log('📊 Test 1: Dashboard Stats Endpoint');
  console.log('───────────────────────────────────────────────────────────');
  await testEndpoint('GET', '/stats');

  // Test 2: GET /invoice-trends
  console.log('📈 Test 2: Invoice Trends Endpoint');
  console.log('───────────────────────────────────────────────────────────');
  await testEndpoint('GET', '/invoice-trends');

  // Test 3: GET /vendors/top10
  console.log('🏢 Test 3: Top 10 Vendors Endpoint');
  console.log('───────────────────────────────────────────────────────────');
  await testEndpoint('GET', '/vendors/top10');

  // Test 4: GET /category-spend
  console.log('🏷️  Test 4: Category Spend Endpoint');
  console.log('───────────────────────────────────────────────────────────');
  await testEndpoint('GET', '/category-spend');

  // Test 5: GET /cash-outflow
  console.log('💸 Test 5: Cash Outflow Endpoint');
  console.log('───────────────────────────────────────────────────────────');
  await testEndpoint('GET', '/cash-outflow');

  // Test 6a: GET /invoices (without filters)
  console.log('📄 Test 6a: Invoices Endpoint (No Filters)');
  console.log('───────────────────────────────────────────────────────────');
  await testEndpoint('GET', '/invoices');

  // Test 6b: GET /invoices (with search)
  console.log('🔍 Test 6b: Invoices Endpoint (With Search)');
  console.log('───────────────────────────────────────────────────────────');
  await testEndpoint('GET', '/invoices?search=invoice');

  // Test 6c: GET /invoices (with sorting)
  console.log('🔢 Test 6c: Invoices Endpoint (With Sorting)');
  console.log('───────────────────────────────────────────────────────────');
  await testEndpoint('GET', '/invoices?sortBy=invoiceTotal&sortOrder=desc');

  // Test 7: GET /history
  console.log('📜 Test 7: Chat History Endpoint');
  console.log('───────────────────────────────────────────────────────────');
  await testEndpoint('GET', '/history');

  // Test 8: POST /chat-with-data (if Vanna is configured)
  console.log('🤖 Test 8: Chat with Data Endpoint (Vanna AI Integration)');
  console.log('───────────────────────────────────────────────────────────');
  if (process.env.VANNA_API_BASE_URL) {
    await testEndpoint('POST', '/chat-with-data', {
      query: 'What is the total number of invoices?'
    });
  } else {
    console.log('⚠️  Skipped: VANNA_API_BASE_URL not configured\n');
  }

  // Test 9: POST /export/csv (with sample SQL)
  console.log('📥 Test 9: Export to CSV Endpoint');
  console.log('───────────────────────────────────────────────────────────');
  await testEndpoint('POST', '/export/csv', {
    sql: 'SELECT * FROM "Invoice" LIMIT 10'
  });

  // Test 10: POST /export/excel (with sample SQL)
  console.log('📊 Test 10: Export to Excel Endpoint');
  console.log('───────────────────────────────────────────────────────────');
  await testEndpoint('POST', '/export/excel', {
    sql: 'SELECT * FROM "Invoice" LIMIT 10'
  });

  // Print Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 Test Summary');
  console.log('═══════════════════════════════════════════════════════════');

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

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`⏰ Completed: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Unexpected error during testing:', error);
  process.exit(1);
});