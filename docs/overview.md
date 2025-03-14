# Restaurant Management System Overview

## Project Overview

This restaurant management system is a comprehensive platform designed to streamline restaurant operations across multiple branches with a focus on order management, delivery tracking, and consolidated reporting. The system supports both mobile app ordering for clients and in-restaurant POS functionality for staff.

The platform uses a modern tech stack:
- **Backend**: NestJS with TypeScript
- **Database**: MongoDB with Prisma ORM
- **Mobile App**: React Native for client-facing applications
- **Integration**: External payment gateways, location services, and email delivery systems

## System Architecture

```mermaid
graph TD
    A[Client Mobile App] --> |API Requests| B[NestJS Backend]
    C[Admin Dashboard] --> |API Requests| B
    D[POS System] --> |API Requests| B
    B --> |Database Operations| E[MongoDB/Prisma]
    B --> |Authentication| F[JWT Auth Service]
    B --> |Payments| G[Payment Gateways]
    B --> |Notifications| H[Push/Email Services]
    B --> |Invoices| I[PDF Generation Service]
```

## Key Actors & Roles

### 1. Super Admin
The restaurant chain owner with complete system access:
- Manages all branches
- Creates branch admins
- Accesses company-wide analytics and reports
- Configures global settings

### 2. Branch Admin
Manages operations for a specific restaurant location:
- Creates and manages menu products for their branch
- Manages branch staff (cashiers and delivery personnel)
- Views branch-specific analytics
- Handles branch-level operational settings

### 3. Cashier
Handles in-restaurant operations:
- Processes on-site orders at POS
- Handles pickup orders
- Manages payments (cash, card, etc.)
- Assigns orders to delivery staff
- Generates and prints invoices

### 4. Delivery Staff
Handles order delivery:
- Views assigned delivery orders
- Updates delivery status
- Marks orders as delivered
- Tracks delivery performance

### 5. Client
End users who place orders:
- Browses restaurant menu
- Places delivery/pickup orders
- Tracks order status
- Makes online payments
- Views order history and invoices

## Core Use Cases & Workflows

### User Registration & Authentication

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth System
    participant U as User Management
    
    C->>A: Register Account
    A->>U: Create User (CLIENT role)
    U-->>A: User Created
    A-->>C: Account Created + JWT Token
    
    Note over C,A: For Admin Creation
    A->>A: Validate Super Admin/Branch Admin Token
    A->>U: Create Admin User (specific role)
    U-->>A: Admin Created
    A-->>A: Notify Creation
```

**Actor**: Client or Admin (for staff creation)
- Clients self-register through the mobile app
- Admin users are created by higher-level admins
- System validates credentials and generates JWT tokens
- Tokens include role-based permissions
- Protected routes verify permissions for each request

### Branch Management

```mermaid
sequenceDiagram
    participant SA as Super Admin
    participant BS as Branch System
    participant PS as Product System
    participant US as User System
    
    SA->>BS: Create Branch
    BS-->>SA: Branch Created
    
    SA->>US: Assign Branch Admin
    US-->>SA: Admin Assigned
    
    Note over SA,PS: Branch Setup
    SA->>BS: Configure Branch Settings
    BS-->>SA: Settings Saved
```

**Actor**: Super Admin
- Creates restaurant branches with location info
- Assigns branch admins to manage operations
- Configures branch-specific settings
- Views analytics across all branches
- The branch serves as an organizational unit connecting products, staff, and orders

### Product Management

```mermaid
sequenceDiagram
    participant BA as Branch Admin
    participant PS as Product System
    
    BA->>PS: Create Product
    PS-->>BA: Product Created
    
    BA->>PS: Add Specifications
    PS-->>BA: Specifications Added
    
    BA->>PS: Update Product
    PS-->>BA: Product Updated
```

**Actor**: Branch Admin
- Creates menu items for their specific branch
- Configures product specifications (e.g., size, toppings)
- Sets pricing for products and specifications
- Organizes products by categories
- These products become available in the branch menu for ordering

### Order Placement - Mobile Client

```mermaid
sequenceDiagram
    participant C as Client
    participant OS as Order System
    participant BS as Branch System
    participant PS as Product System
    participant P as Payment System
    participant I as Invoice System
    
    C->>BS: Select Branch
    BS-->>C: Branch Selected
    
    C->>PS: Browse Products
    PS-->>C: Product List
    
    C->>OS: Create Order (products, specifications)
    OS->>OS: Calculate Total
    OS-->>C: Order Created
    
    C->>P: Process Payment
    P-->>C: Payment Confirmed
    
    P->>OS: Update Order Status
    OS-->>C: Order Confirmed
    
    P->>I: Generate Invoice
    I-->>C: Invoice Available
```

**Actor**: Client
- Selects a restaurant branch
- Browses branch-specific menu
- Adds products with specifications to cart
- Provides delivery address or selects pickup
- Makes payment through the integrated payment gateway
- Receives order confirmation and tracking
- Gets PDF invoice via email and in-app

### Order Placement - In-Restaurant POS

```mermaid
sequenceDiagram
    participant CA as Cashier
    participant OS as Order System
    participant PS as Product System
    participant P as Payment System
    participant I as Invoice System
    
    CA->>PS: Browse Branch Products
    PS-->>CA: Product List
    
    CA->>OS: Create Order (table number, products)
    OS->>OS: Calculate Total
    OS-->>CA: Order Created
    
    CA->>P: Process Payment (cash/card)
    P-->>CA: Payment Confirmed
    
    P->>OS: Update Order Status
    OS-->>CA: Order Confirmed
    
    P->>I: Generate Invoice
    I-->>CA: Print Invoice
```

**Actor**: Cashier
- Takes customer orders at the restaurant
- Assigns table numbers for dine-in
- Processes payments (cash, card terminal)
- Prints physical receipts/invoices
- Manages on-site order flow
- This creates unified order records in the system alongside mobile orders

### Order Processing & Delivery

```mermaid
sequenceDiagram
    participant CA as Cashier/Branch Admin
    participant OS as Order System
    participant D as Delivery Staff
    participant C as Client
    participant N as Notification System
    
    OS->>CA: New Order Notification
    CA->>OS: Update Status (PREPARING)
    OS->>N: Send Status Update
    N-->>C: Order Status Changed
    
    CA->>OS: Assign Delivery Staff
    OS->>D: Delivery Assignment
    
    D->>OS: Update Status (OUT_FOR_DELIVERY)
    OS->>N: Send Status Update
    N-->>C: Order Out For Delivery
    
    D->>OS: Update Status (DELIVERED)
    OS->>N: Send Final Update
    N-->>C: Order Delivered
```

**Actor**: Cashier, Branch Admin, Delivery Staff
- Branch staff receives orders and updates status
- For delivery orders, staff assigns delivery personnel
- Delivery staff updates status during delivery process
- Client receives real-time status updates via notifications
- System maintains a complete order lifecycle record

### Payment Processing

```mermaid
sequenceDiagram
    participant A as Actor (Client/Cashier)
    participant OS as Order System
    participant PS as Payment System
    participant PG as Payment Gateway
    participant IS as Invoice System
    
    A->>OS: Finalize Order
    OS-->>A: Total Amount
    
    A->>PS: Initiate Payment
    
    alt Online Payment
        PS->>PG: Process Payment
        PG-->>PS: Payment Result
    else Cash/POS Payment
        PS->>PS: Record Direct Payment
    end
    
    PS->>OS: Update Order Status
    PS->>IS: Generate Invoice
    IS-->>A: Invoice Available
```

**Actor**: Client (for online) or Cashier (for POS)
- System handles multiple payment methods
- Online payments go through payment gateways
- POS payments are recorded directly
- All payments are tracked uniformly regardless of method
- Successful payments trigger order confirmation and invoice generation

### Reporting & Analytics

```mermaid
sequenceDiagram
    participant SA as Super Admin
    participant BA as Branch Admin
    participant RS as Reporting System
    participant OS as Order System
    participant PS as Payment System
    
    SA->>RS: Request Global Reports
    RS->>OS: Fetch Orders Data
    RS->>PS: Fetch Payment Data
    OS-->>RS: Orders Data
    PS-->>RS: Payments Data
    RS-->>SA: Consolidated Reports
    
    BA->>RS: Request Branch Reports
    RS->>OS: Fetch Branch Orders
    RS->>PS: Fetch Branch Payments
    OS-->>RS: Branch Orders
    PS-->>RS: Branch Payments
    RS-->>BA: Branch-Specific Reports
```

**Actor**: Super Admin, Branch Admin
- Super admin accesses company-wide analytics
- Branch admins view branch-specific performance
- System generates reports based on orders and payments
- Analytics include sales trends, popular products, delivery metrics
- Data can be filtered by date ranges, product categories, order types

## System Integration Points

### Authentication → All Features
- JWT tokens secure all API endpoints
- Role-based permissions control access to features
- User context is maintained across all operations

### Branches → Products & Staff
- Branches contain branch-specific products
- Staff members are assigned to specific branches
- Branch structure provides organizational hierarchy

### Products → Orders
- Products with specifications are added to orders
- Product availability and pricing affect order creation
- Product performance metrics feed into analytics

### Orders → Payments → Invoices
- Orders trigger payment processing
- Successful payments update order status
- Completed transactions generate invoices
- The order lifecycle connects all operational components

### Notifications System
- Order status changes trigger customer notifications
- Delivery assignments alert delivery staff
- System notifications inform admins of important events
- Notifications keep all parties informed throughout workflows

## Technology Implementation

The system uses a modular architecture with the following key components:

1. **NestJS Backend**
   - RESTful API endpoints for all features
   - JWT authentication and role-based guards
   - Service-oriented architecture for business logic
   - Integration with external services

2. **Prisma ORM with MongoDB**
   - Structured data models with relationships
   - Efficient querying and data manipulation
   - Type-safe database operations

3. **Mobile Client Application**
   - React Native for cross-platform support
   - Real-time order tracking
   - Integrated payment processing
   - Push notification support

4. **Admin Dashboard**
   - Branch management interface
   - Staff administration tools
   - Product catalog management
   - Analytics and reporting interfaces

## Conclusion

This restaurant management system provides a comprehensive solution for multi-branch restaurant operations, connecting clients, staff, orders, and analytics in a unified platform. The system's modular design allows for scalability and future feature additions while maintaining a consistent user experience across all touchpoints.

The role-based permissions ensure that each user type has access to exactly the features they need, while the integrated workflows ensure smooth operations from order placement to delivery and reporting. 