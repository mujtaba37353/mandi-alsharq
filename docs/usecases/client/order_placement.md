# Order Placement - Client

## Overview
This document outlines the use cases for clients placing and managing orders through the application.

## Use Cases

### 1. Place New Order

#### Workflow Description
1. Client opens the application
2. Selects preferred branch
3. Browses menu categories
4. Adds items to cart
5. Reviews cart and applies modifications
6. Selects order type (delivery/pickup)
7. Provides delivery details (if applicable)
8. Selects payment method
9. Confirms order
10. Receives order confirmation

#### Sequence Diagram
```mermaid
sequenceDiagram
    participant C as Client
    participant UI as User Interface
    participant OS as Order Service
    participant PS as Payment Service
    participant DB as Database
    
    C->>UI: Open Application
    UI->>OS: Fetch Branch List
    OS-->>UI: Return Branches
    UI-->>C: Display Branches
    C->>UI: Select Branch
    UI->>OS: Fetch Menu
    OS-->>UI: Return Menu
    UI-->>C: Display Menu
    C->>UI: Add Items to Cart
    C->>UI: Review Cart
    C->>UI: Select Order Type
    C->>UI: Enter Delivery Details
    C->>UI: Select Payment Method
    UI->>OS: Create Order
    OS->>PS: Process Payment
    PS-->>OS: Payment Confirmation
    OS->>DB: Save Order
    DB-->>OS: Order Confirmation
    OS-->>UI: Order Details
    UI-->>C: Display Confirmation
```

### 2. Track Order Status

#### Workflow Description
1. Client opens order history
2. Selects active order
3. Views current order status
4. Receives real-time updates
5. Can contact support if needed

#### Sequence Diagram
```mermaid
sequenceDiagram
    participant C as Client
    participant UI as User Interface
    participant OS as Order Service
    participant NS as Notification Service
    participant DB as Database
    
    C->>UI: Open Order History
    UI->>OS: Fetch Orders
    OS->>DB: Get Orders
    DB-->>OS: Return Orders
    OS-->>UI: Display Orders
    C->>UI: Select Order
    UI->>OS: Get Order Status
    OS->>DB: Fetch Status
    DB-->>OS: Return Status
    OS-->>UI: Display Status
    NS->>UI: Push Status Update
    UI-->>C: Show Update
```

### 3. Cancel Order

#### Workflow Description
1. Client opens order details
2. Checks order status
3. Initiates cancellation
4. System validates cancellation eligibility
5. System processes cancellation
6. Client receives confirmation
7. Refund processed if applicable

#### Sequence Diagram
```mermaid
sequenceDiagram
    participant C as Client
    participant UI as User Interface
    participant OS as Order Service
    participant PS as Payment Service
    participant DB as Database
    
    C->>UI: Open Order Details
    UI->>OS: Get Order Status
    OS->>DB: Fetch Order
    DB-->>OS: Return Order
    OS-->>UI: Display Status
    C->>UI: Request Cancellation
    UI->>OS: Validate Cancellation
    OS->>DB: Check Status
    DB-->>OS: Status Valid
    OS->>PS: Process Refund
    PS-->>OS: Refund Confirmation
    OS->>DB: Update Order Status
    DB-->>OS: Update Confirmation
    OS-->>UI: Cancellation Complete
    UI-->>C: Show Confirmation
```

## Integration Points
- Order Service
- Payment Service
- Notification Service
- Branch Service
- Menu Service

## Business Rules
1. Orders can only be cancelled within 5 minutes of placement
2. Payment must be confirmed before order processing
3. Delivery orders require valid address
4. Pickup orders require estimated pickup time
5. Order modifications only allowed before preparation starts

## Error Handling
1. Invalid payment method
2. Out of stock items
3. Branch closed
4. Invalid delivery address
5. System errors during order placement

## Testing Strategy
1. Unit tests for order creation
2. Integration tests for payment processing
3. End-to-end tests for order flow
4. Performance tests for real-time updates
5. Security tests for payment processing 