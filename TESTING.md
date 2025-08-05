# 🧪 NileTech Project System Testing Guide

## Overview

This guide provides comprehensive testing instructions for the NileTech Project Management System, including all features like notifications, alerts, financial management, invoice/proforma creation, and more.

## 🚀 Quick Start

### 1. Start the Server
```bash
npm run start:dev
```

### 2. Run Comprehensive Tests
```bash
./run-tests.sh
```

### 3. Manual Testing
Use the individual test endpoints or test manually via API calls.

## 📋 Test Categories

### 1. Project Creation & Management
- ✅ Create project with automatic invoice
- ✅ Create project without invoice
- ✅ Update project progress
- ✅ Start/Complete/Cancel projects
- ✅ Get project tracking information

### 2. Service & Product Management
- ✅ Add services to projects
- ✅ Add products to projects
- ✅ Automatic pricing calculations
- ✅ Inventory tracking for products

### 3. Time Tracking System
- ✅ Start time entries
- ✅ Stop time entries
- ✅ Create manual time entries
- ✅ Time tracking notifications

### 4. Milestone Management
- ✅ Create project milestones
- ✅ Update milestone progress
- ✅ Milestone completion notifications

### 5. Financial Management
- ✅ Revenue creation from services
- ✅ Revenue creation from products
- ✅ Project financial summaries
- ✅ Profit calculations

### 6. Invoice & Proforma System
- ✅ Automatic invoice creation from project items
- ✅ Manual invoice creation
- ✅ Invoice item management
- ✅ Proforma support (schema ready)

### 7. Budget & Expense Management
- ✅ Project expense creation
- ✅ Budget tracking
- ✅ Budget alerts
- ✅ Funding source management

### 8. Alert & Notification System
- ✅ Deadline alerts
- ✅ Budget alerts
- ✅ Progress notifications
- ✅ Status change notifications
- ✅ Milestone completion notifications

## 🔗 API Endpoints for Testing

### Project Management
```bash
# Create project with invoice
POST /projects/with-invoice

# Create project without invoice
POST /projects/without-invoice

# Get project details
GET /projects/{id}

# Update project progress
PATCH /projects/{id}/progress

# Start project
PATCH /projects/{id}/start

# Complete project
PATCH /projects/{id}/complete

# Cancel project
PATCH /projects/{id}/cancel
```

### Service & Product Management
```bash
# Add service to project
POST /projects/{id}/services

# Add product to project
POST /projects/{id}/products
```

### Time Tracking
```bash
# Start time entry
POST /projects/{id}/time/start

# Stop time entry
POST /projects/{id}/time/stop

# Create manual time entry
POST /projects/{id}/time
```

### Milestone Management
```bash
# Create milestone
POST /projects/{id}/milestones

# Update milestone
PATCH /projects/milestones/{milestoneId}
```

### Financial Management
```bash
# Get financial summary
GET /projects/{id}/financial-summary

# Calculate profit
POST /projects/{id}/calculate-profit

# Create revenue from service
POST /projects/revenue/service

# Create revenue from product
POST /projects/revenue/product
```

### Invoice & Proforma
```bash
# Create project invoice
POST /projects/{id}/invoice

# Get project invoices
GET /projects/{id}/invoices
```

### Budget & Expense
```bash
# Create project expense
POST /projects/{id}/expenses
```

### Alert & Notification System
```bash
# Get project alerts
GET /projects/{id}/alerts

# Run all alerts
POST /projects/alerts/run-all

# Run deadline alerts
POST /projects/alerts/deadlines

# Run budget alerts
POST /projects/alerts/budgets

# Run overdue alerts
POST /projects/alerts/overdue
```

## 🧪 Test Endpoints

### Individual System Tests
```bash
# Test notification system
POST /projects/test/notification-system

# Test alert system
POST /projects/test/alert-system

# Test financial system
POST /projects/test/financial-system

# Test invoice/proforma system
POST /projects/test/invoice-proforma-system

# Test budget/expense system
POST /projects/test/budget-expense-system

# Test time tracking system
POST /projects/test/time-tracking-system

# Test milestone system
POST /projects/test/milestone-system
```

### Comprehensive Test
```bash
# Run all tests at once
POST /projects/test/comprehensive
```

## 📊 Test Data Examples

### Create Project with Invoice
```json
{
  "title": "Website Development Project",
  "clientName": "Acme Corporation",
  "clientId": 1,
  "status": "PENDING",
  "priority": "HIGH",
  "deadline": "2025-09-01T00:00:00.000Z",
  "services": [
    {
      "serviceId": 1,
      "quantity": 2,
      "unitPrice": 100,
      "notes": "Web development service"
    }
  ],
  "products": [
    {
      "productId": 1,
      "quantity": 1,
      "unitPrice": 50,
      "notes": "Domain registration"
    }
  ]
}
```

### Add Service to Project
```json
{
  "serviceId": 1,
  "quantity": 1,
  "unitPrice": 75,
  "notes": "Additional consultation service"
}
```

### Create Time Entry
```json
{
  "description": "Working on project requirements",
  "startTime": "2025-08-04T09:00:00.000Z",
  "endTime": "2025-08-04T17:00:00.000Z",
  "duration": 480,
  "notes": "Full day of development work"
}
```

### Create Project Expense
```json
{
  "amount": 150,
  "note": "Software license purchase",
  "fundingSource": "BUDGET",
  "budgetId": 1
}
```

## 🔍 Manual Testing Steps

### 1. Test Project Creation
1. Create a project with services and products
2. Verify invoice is automatically created
3. Check notifications are sent
4. Verify project tracking is updated

### 2. Test Time Tracking
1. Start a time entry
2. Work for some time
3. Stop the time entry
4. Verify time is logged correctly
5. Check notifications are sent

### 3. Test Financial Management
1. Add services and products to project
2. Create revenue records
3. Add expenses
4. Calculate project profit
5. Verify financial summary

### 4. Test Alert System
1. Create project with deadline
2. Run deadline alerts
3. Check notifications are sent
4. Verify alert data is correct

### 5. Test Notification System
1. Perform various project actions
2. Check notifications are created
3. Verify notification content
4. Test different notification types

## 🐛 Troubleshooting

### Common Issues

1. **Server not running**
   ```bash
   npm run start:dev
   ```

2. **Database connection issues**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

3. **JWT token issues**
   - Make sure you're logged in
   - Check token expiration
   - Verify token in request headers

4. **Test data not found**
   - Ensure services and products exist in database
   - Check user IDs are valid
   - Verify project IDs are correct

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run start:dev
```

### Database Reset

If you need to reset the database:
```bash
npx prisma migrate reset
npx prisma db seed
```

## 📈 Performance Testing

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Run load test
artillery run load-test.yml
```

### Memory Testing
```bash
# Monitor memory usage
node --inspect npm run start:dev
```

## 🎯 Success Criteria

A successful test run should show:
- ✅ All project creation tests pass
- ✅ All notification tests pass
- ✅ All alert tests pass
- ✅ All financial calculations are correct
- ✅ All time tracking works properly
- ✅ All milestone management works
- ✅ All invoice/proforma creation works
- ✅ All budget/expense tracking works

## 📝 Test Report

After running tests, you should see a report like:
```
📊 Test Report
==============
Total Tests: 25
Successful: 24
Failed: 1
Success Rate: 96.00%

🎉 Test Summary:
🌟 EXCELLENT: System is working perfectly!
```

## 🔄 Continuous Testing

For continuous integration, you can:
1. Set up automated tests
2. Run tests on every commit
3. Generate test reports
4. Monitor test coverage

## 📞 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify database connectivity
3. Ensure all dependencies are installed
4. Check API documentation
5. Contact the development team

---

**Happy Testing! 🎉** 