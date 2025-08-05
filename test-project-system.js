const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_TOKEN = 'your-jwt-token-here'; // Replace with actual JWT token

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

class ProjectSystemTester {
  constructor() {
    this.testResults = [];
    this.projectIds = [];
  }

  async log(message, data = null) {
    console.log(`[${new Date().toISOString()}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    console.log('---');
  }

  async testEndpoint(endpoint, method = 'GET', data = null, description = '') {
    try {
      this.log(`Testing: ${description || endpoint}`);
      
      let response;
      if (method === 'GET') {
        response = await api.get(endpoint);
      } else if (method === 'POST') {
        response = await api.post(endpoint, data);
      } else if (method === 'PATCH') {
        response = await api.patch(endpoint, data);
      } else if (method === 'DELETE') {
        response = await api.delete(endpoint);
      }

      this.log(`✅ SUCCESS: ${description || endpoint}`, response.data);
      this.testResults.push({ endpoint, status: 'SUCCESS', data: response.data });
      return response.data;
    } catch (error) {
      this.log(`❌ FAILED: ${description || endpoint}`, {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      this.testResults.push({ endpoint, status: 'FAILED', error: error.response?.data });
      return null;
    }
  }

  async runComprehensiveTests() {
    this.log('🚀 Starting Comprehensive Project System Tests');
    this.log('================================================');

    // 1. Test Project Creation
    await this.testProjectCreation();

    // 2. Test Project Management
    await this.testProjectManagement();

    // 3. Test Service and Product Management
    await this.testServiceProductManagement();

    // 4. Test Time Tracking
    await this.testTimeTracking();

    // 5. Test Milestone Management
    await this.testMilestoneManagement();

    // 6. Test Financial Management
    await this.testFinancialManagement();

    // 7. Test Invoice and Proforma
    await this.testInvoiceProforma();

    // 8. Test Budget and Expense
    await this.testBudgetExpense();

    // 9. Test Alert and Notification Systems
    await this.testAlertNotificationSystems();

    // 10. Run Comprehensive Test
    await this.testComprehensiveSystem();

    // 11. Generate Test Report
    this.generateTestReport();
  }

  async testProjectCreation() {
    this.log('📋 Testing Project Creation');
    
    // Create project with invoice
    const projectWithInvoice = await this.testEndpoint(
      '/projects/with-invoice',
      'POST',
      {
        title: 'Test Project with Invoice',
        clientName: 'Test Client',
        clientId: 1,
        status: 'PENDING',
        priority: 'HIGH',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        services: [
          {
            serviceId: 1,
            quantity: 2,
            unitPrice: 100,
            notes: 'Test service for project',
          },
        ],
        products: [
          {
            productId: 1,
            quantity: 1,
            unitPrice: 50,
            notes: 'Test product for project',
          },
        ],
      },
      'Create project with automatic invoice'
    );

    if (projectWithInvoice?.project?.id) {
      this.projectIds.push(projectWithInvoice.project.id);
    }

    // Create project without invoice
    const projectWithoutInvoice = await this.testEndpoint(
      '/projects/without-invoice',
      'POST',
      {
        title: 'Test Project without Invoice',
        clientName: 'Test Client 2',
        clientId: 1,
        status: 'PENDING',
        priority: 'MEDIUM',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      'Create project without automatic invoice'
    );

    if (projectWithoutInvoice?.project?.id) {
      this.projectIds.push(projectWithoutInvoice.project.id);
    }
  }

  async testProjectManagement() {
    this.log('📊 Testing Project Management');
    
    if (this.projectIds.length === 0) {
      this.log('⚠️ No projects available for testing');
      return;
    }

    const projectId = this.projectIds[0];

    // Get project details
    await this.testEndpoint(
      `/projects/${projectId}`,
      'GET',
      null,
      'Get project details'
    );

    // Update project progress
    await this.testEndpoint(
      `/projects/${projectId}/progress`,
      'PATCH',
      {
        progress: 25,
        notes: 'Project progress updated to 25%',
      },
      'Update project progress'
    );

    // Start project
    await this.testEndpoint(
      `/projects/${projectId}/start`,
      'PATCH',
      {
        notes: 'Project started successfully',
      },
      'Start project'
    );

    // Get project tracking
    await this.testEndpoint(
      `/projects/${projectId}/tracking`,
      'GET',
      null,
      'Get project tracking information'
    );
  }

  async testServiceProductManagement() {
    this.log('🛠️ Testing Service and Product Management');
    
    if (this.projectIds.length === 0) {
      this.log('⚠️ No projects available for testing');
      return;
    }

    const projectId = this.projectIds[0];

    // Add service to project
    await this.testEndpoint(
      `/projects/${projectId}/services`,
      'POST',
      {
        serviceId: 1,
        quantity: 1,
        unitPrice: 75,
        notes: 'Additional service added',
      },
      'Add service to project'
    );

    // Add product to project
    await this.testEndpoint(
      `/projects/${projectId}/products`,
      'POST',
      {
        productId: 1,
        quantity: 2,
        unitPrice: 25,
        notes: 'Additional product added',
      },
      'Add product to project'
    );
  }

  async testTimeTracking() {
    this.log('⏰ Testing Time Tracking');
    
    if (this.projectIds.length === 0) {
      this.log('⚠️ No projects available for testing');
      return;
    }

    const projectId = this.projectIds[0];

    // Start time entry
    await this.testEndpoint(
      `/projects/${projectId}/time/start`,
      'POST',
      {
        description: 'Testing time tracking functionality',
      },
      'Start time entry'
    );

    // Stop time entry
    await this.testEndpoint(
      `/projects/${projectId}/time/stop`,
      'POST',
      {
        endTime: new Date().toISOString(),
        notes: 'Time entry completed for testing',
      },
      'Stop time entry'
    );

    // Create manual time entry
    await this.testEndpoint(
      `/projects/${projectId}/time`,
      'POST',
      {
        description: 'Manual time entry for testing',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        notes: 'Manual time entry test',
      },
      'Create manual time entry'
    );
  }

  async testMilestoneManagement() {
    this.log('🎯 Testing Milestone Management');
    
    if (this.projectIds.length === 0) {
      this.log('⚠️ No projects available for testing');
      return;
    }

    const projectId = this.projectIds[0];

    // Create milestone
    const milestone = await this.testEndpoint(
      `/projects/${projectId}/milestones`,
      'POST',
      {
        title: 'Test Milestone',
        description: 'This is a test milestone for the project',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        order: 1,
      },
      'Create milestone'
    );

    if (milestone?.milestone?.id) {
      // Update milestone
      await this.testEndpoint(
        `/projects/milestones/${milestone.milestone.id}`,
        'PATCH',
        {
          title: 'Updated Test Milestone',
          description: 'This milestone has been updated',
          progress: 50,
          isCompleted: false,
        },
        'Update milestone'
      );
    }
  }

  async testFinancialManagement() {
    this.log('💰 Testing Financial Management');
    
    if (this.projectIds.length === 0) {
      this.log('⚠️ No projects available for testing');
      return;
    }

    const projectId = this.projectIds[0];

    // Get financial summary
    await this.testEndpoint(
      `/projects/${projectId}/financial-summary`,
      'GET',
      null,
      'Get project financial summary'
    );

    // Calculate project profit
    await this.testEndpoint(
      `/projects/${projectId}/calculate-profit`,
      'POST',
      null,
      'Calculate project profit'
    );

    // Create revenue from service
    await this.testEndpoint(
      '/projects/revenue/service',
      'POST',
      {
        serviceId: 1,
        quantity: 1,
        sellingPrice: 100,
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '+1234567890',
        notes: 'Test service revenue',
      },
      'Create revenue from sold service'
    );

    // Create revenue from product
    await this.testEndpoint(
      '/projects/revenue/product',
      'POST',
      {
        productId: 1,
        quantity: 2,
        sellingPrice: 25,
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '+1234567890',
        notes: 'Test product revenue',
      },
      'Create revenue from sold product'
    );
  }

  async testInvoiceProforma() {
    this.log('📄 Testing Invoice and Proforma');
    
    if (this.projectIds.length === 0) {
      this.log('⚠️ No projects available for testing');
      return;
    }

    const projectId = this.projectIds[0];

    // Create project invoice
    await this.testEndpoint(
      `/projects/${projectId}/invoice`,
      'POST',
      {
        notes: 'Test invoice creation',
      },
      'Create project invoice'
    );

    // Get project invoices
    await this.testEndpoint(
      `/projects/${projectId}/invoices`,
      'GET',
      null,
      'Get project invoices'
    );
  }

  async testBudgetExpense() {
    this.log('💸 Testing Budget and Expense Management');
    
    if (this.projectIds.length === 0) {
      this.log('⚠️ No projects available for testing');
      return;
    }

    const projectId = this.projectIds[0];

    // Create project expense
    await this.testEndpoint(
      `/projects/${projectId}/expenses`,
      'POST',
      {
        amount: 150,
        note: 'Test expense for budget tracking',
        fundingSource: 'BUDGET',
      },
      'Create project expense'
    );
  }

  async testAlertNotificationSystems() {
    this.log('🔔 Testing Alert and Notification Systems');
    
    // Get project alerts
    if (this.projectIds.length > 0) {
      await this.testEndpoint(
        `/projects/${this.projectIds[0]}/alerts`,
        'GET',
        null,
        'Get project alerts'
      );
    }

    // Run all alerts
    await this.testEndpoint(
      '/projects/alerts/run-all',
      'POST',
      null,
      'Run all alert systems'
    );

    // Run deadline alerts
    await this.testEndpoint(
      '/projects/alerts/deadlines',
      'POST',
      null,
      'Run deadline alerts'
    );

    // Run budget alerts
    await this.testEndpoint(
      '/projects/alerts/budgets',
      'POST',
      null,
      'Run budget alerts'
    );

    // Run overdue alerts
    await this.testEndpoint(
      '/projects/alerts/overdue',
      'POST',
      null,
      'Run overdue project alerts'
    );
  }

  async testComprehensiveSystem() {
    this.log('🧪 Testing Comprehensive System');
    
    // Test notification system
    await this.testEndpoint(
      '/projects/test/notification-system',
      'POST',
      null,
      'Test notification system'
    );

    // Test alert system
    await this.testEndpoint(
      '/projects/test/alert-system',
      'POST',
      null,
      'Test alert system'
    );

    // Test financial system
    await this.testEndpoint(
      '/projects/test/financial-system',
      'POST',
      null,
      'Test financial system'
    );

    // Test invoice/proforma system
    await this.testEndpoint(
      '/projects/test/invoice-proforma-system',
      'POST',
      null,
      'Test invoice/proforma system'
    );

    // Test budget/expense system
    await this.testEndpoint(
      '/projects/test/budget-expense-system',
      'POST',
      null,
      'Test budget/expense system'
    );

    // Test time tracking system
    await this.testEndpoint(
      '/projects/test/time-tracking-system',
      'POST',
      null,
      'Test time tracking system'
    );

    // Test milestone system
    await this.testEndpoint(
      '/projects/test/milestone-system',
      'POST',
      null,
      'Test milestone system'
    );

    // Run comprehensive test
    await this.testEndpoint(
      '/projects/test/comprehensive',
      'POST',
      null,
      'Run comprehensive test'
    );
  }

  generateTestReport() {
    this.log('📊 Test Report');
    this.log('==============');

    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(r => r.status === 'SUCCESS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAILED').length;
    const successRate = ((successfulTests / totalTests) * 100).toFixed(2);

    this.log(`Total Tests: ${totalTests}`);
    this.log(`Successful: ${successfulTests}`);
    this.log(`Failed: ${failedTests}`);
    this.log(`Success Rate: ${successRate}%`);

    if (failedTests > 0) {
      this.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(result => {
          this.log(`- ${result.endpoint}: ${result.error?.message || 'Unknown error'}`);
        });
    }

    this.log('\n✅ Successful Tests:');
    this.testResults
      .filter(r => r.status === 'SUCCESS')
      .forEach(result => {
        this.log(`- ${result.endpoint}`);
      });

    this.log('\n🎉 Test Summary:');
    if (successRate >= 90) {
      this.log('🌟 EXCELLENT: System is working perfectly!');
    } else if (successRate >= 70) {
      this.log('👍 GOOD: System is working well with minor issues');
    } else if (successRate >= 50) {
      this.log('⚠️ FAIR: System has some issues that need attention');
    } else {
      this.log('❌ POOR: System has significant issues that need immediate attention');
    }
  }
}

// Run the tests
async function main() {
  const tester = new ProjectSystemTester();
  await tester.runComprehensiveTests();
}

// Check if running directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ProjectSystemTester; 