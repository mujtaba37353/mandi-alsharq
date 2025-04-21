# Payment System Documentation

## Overview
The payment system handles all financial transactions, including online payments, POS transactions, and refunds.

## Workflow

1. **Payment Flow**
   ```mermaid
   graph TD
       A[Order Created] --> B{Payment Type}
       B -->|Online| C[Payment Gateway]
       B -->|Cash| D[Cash Handler]
       B -->|POS| E[Card Terminal]
       C --> F[Payment Processing]
       D --> F
       E --> F
       F --> G[Payment Verification]
       G -->|Success| H[Order Confirmation]
       G -->|Failure| I[Payment Retry]
       H --> J[Invoice Generation]
   ```

2. **Refund Flow**
   ```mermaid
   graph TD
       A[Refund Request] --> B[Validation]
       B --> C[Process Refund]
       C --> D[Update Order]
       D --> E[Notify Client]
   ```

## Features

### Payment Methods
1. **Online Payments**
   - Credit/Debit Cards
   - Digital Wallets
   - Payment Gateway Integration

2. **POS Payments**
   - Card Terminal Integration
   - Cash Handling
   - Split Payments

3. **Payment Management**
   - Transaction History
   - Refund Processing
   - Payment Reconciliation

## Technical Implementation

### Database Schema (Prisma)
```
model Payment {
  id            String        @id @default(auto()) @map("_id") @db.ObjectId
  orderId       String        @db.ObjectId
  order         Order         @relation(fields: [orderId], references: [id])
  amount        Float
  method        PaymentMethod
  status        PaymentStatus
  transactionId String?       // External payment reference
  refunded      Boolean       @default(false)
  refundAmount  Float?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

enum PaymentMethod {
  CREDIT_CARD
  CASH
  DIGITAL_WALLET
  POS
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}
```

## Integration Points
```
graph LR
    A[Payments] --> B[Orders]
    A --> C[Invoices]
    A --> D[Notifications]
    A --> E[External Payment Gateway]
```

## Testing Strategy

### Unit Tests
1. Payment Processing
   - Payment validation
   - Amount calculations
   - Status management

2. Refund Processing
   - Refund validation
   - Amount calculations
   - Status updates

### E2E Tests
1. Payment Flows
   - Online payment process
   - POS payment process
   - Refund process

2. Integration Tests
   - Payment gateway integration
   - Invoice generation
   - Notification system
``` 