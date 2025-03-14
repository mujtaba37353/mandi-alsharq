# Invoice Management Documentation

## Overview
The invoice management system handles the generation, delivery, and storage of digital receipts for all transactions.

## Workflow

1. **Invoice Generation Flow**
   ```mermaid
   graph TD
       A[Payment Completed] --> B[Generate Invoice]
       B --> C[Store Invoice]
       C --> D[Send to Client]
       D --> E{Delivery Method}
       E -->|Email| F[Send Email]
       E -->|In-App| G[Push Notification]
       E -->|Print| H[Print PDF]
   ```

2. **Invoice Management Flow**
   - Invoice storage
   - Access control
   - Historical retrieval
   - Reporting functions

## Features

### Invoice Generation
- PDF Generation
- Digital signatures
- Tax calculations
- Branding customization

### Invoice Delivery
- Email delivery
- In-app access
- Print functionality
- Download options

### Invoice Management
- Historical access
- Search functionality
- Batch operations
- Reporting tools

## Technical Implementation

### Database Schema (Prisma)
```
model Invoice {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  invoiceNumber String    @unique
  orderId       String    @db.ObjectId
  order         Order     @relation(fields: [orderId], references: [id])
  paymentId     String    @db.ObjectId
  payment       Payment   @relation(fields: [paymentId], references: [id])
  pdfUrl        String    // URL to stored PDF
  emailSent     Boolean   @default(false)
  emailSentAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## Integration Points
```
graph LR
    A[Invoices] --> B[Orders]
    A --> C[Payments]
    A --> D[Users] 