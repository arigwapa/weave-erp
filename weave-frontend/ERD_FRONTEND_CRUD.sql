/*
  ERP Frontend-Derived Physical DDL
  Target dialect: SQL Server (2019+)
*/

SET XACT_ABORT ON;
GO

/* =========================================================
   1) Organization and Access
   ========================================================= */

CREATE TABLE dbo.Region (
    RegionID        INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_Region_RegionID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_Region_RegionID_5Digits CHECK (RegionID BETWEEN 10000 AND 99999),
    RegionName      NVARCHAR(120) NOT NULL,
    IsActive        BIT NOT NULL CONSTRAINT DF_Region_IsActive DEFAULT (1),
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Region_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT UQ_Region_RegionName UNIQUE (RegionName)
);
GO

CREATE TABLE dbo.Branch (
    BranchID         INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_Branch_BranchID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_Branch_BranchID_5Digits CHECK (BranchID BETWEEN 10000 AND 99999),
    BranchName       NVARCHAR(100) NOT NULL,
    RegionID         INT NOT NULL,
    Location         NVARCHAR(160) NULL,
    Address          NVARCHAR(255) NULL,
    IsActive         BIT NOT NULL CONSTRAINT DF_Branch_IsActive DEFAULT (1),
    CreatedAt        DATETIME2(0) NOT NULL CONSTRAINT DF_Branch_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_Branch_Region FOREIGN KEY (RegionID) REFERENCES dbo.Region(RegionID)
);
GO

CREATE TABLE dbo.Role (
    RoleID          INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_Role_RoleID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_Role_RoleID_5Digits CHECK (RoleID BETWEEN 10000 AND 99999),
    DisplayName     NVARCHAR(120) NOT NULL,
    Scope           NVARCHAR(80) NOT NULL,
    Description     NVARCHAR(MAX) NULL,
    IsActive        BIT NOT NULL CONSTRAINT DF_Role_IsActive DEFAULT (1),
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Role_CreatedAt DEFAULT (SYSUTCDATETIME())
);
GO

CREATE TABLE dbo.[User] (
    UserID             INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_User_UserID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_User_UserID_5Digits CHECK (UserID BETWEEN 10000 AND 99999),
    BranchID           INT NOT NULL,
    RoleID             INT NOT NULL,
    Username           NVARCHAR(120) NOT NULL,
    Fullname           NVARCHAR(160) NOT NULL,
    PasswordHash       NVARCHAR(255) NOT NULL,
    IsActive           BIT NOT NULL CONSTRAINT DF_User_IsActive DEFAULT (1),
    CreatedByUserID    INT NULL,
    CreatedAt          DATETIME2(0) NOT NULL CONSTRAINT DF_User_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT UQ_User_Username UNIQUE (Username),
    CONSTRAINT FK_User_Branch FOREIGN KEY (BranchID) REFERENCES dbo.Branch(BranchID),
    CONSTRAINT FK_User_Role FOREIGN KEY (RoleID) REFERENCES dbo.Role(RoleID),
    CONSTRAINT FK_User_CreatedBy FOREIGN KEY (CreatedByUserID) REFERENCES dbo.[User](UserID)
);
GO

CREATE TABLE dbo.RolePermissionChangeRequest (
    RequestID           INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_RPCR_RequestID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_RPCR_RequestID_5Digits CHECK (RequestID BETWEEN 10000 AND 99999),
    RoleID              INT NOT NULL,
    BranchID            INT NULL,
    RequestedByUserID   INT NOT NULL,
    RequestedAt         DATETIME2(0) NOT NULL CONSTRAINT DF_RPCR_RequestedAt DEFAULT (SYSUTCDATETIME()),
    Status              NVARCHAR(40) NOT NULL,
    ReviewedByUserID    INT NULL,
    ReviewedAt          DATETIME2(0) NULL,
    Notes               NVARCHAR(MAX) NULL,
    PayloadJSON         NVARCHAR(MAX) NOT NULL,
    CONSTRAINT FK_RPCR_Role FOREIGN KEY (RoleID) REFERENCES dbo.Role(RoleID),
    CONSTRAINT FK_RPCR_Branch FOREIGN KEY (BranchID) REFERENCES dbo.Branch(BranchID),
    CONSTRAINT FK_RPCR_RequestedBy FOREIGN KEY (RequestedByUserID) REFERENCES dbo.[User](UserID),
    CONSTRAINT FK_RPCR_ReviewedBy FOREIGN KEY (ReviewedByUserID) REFERENCES dbo.[User](UserID)
);
GO

/* =========================================================
   2) PLM and Product Data
   ========================================================= */

CREATE TABLE dbo.Material (
    MaterialID      INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_Material_MaterialID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_Material_MaterialID_5Digits CHECK (MaterialID BETWEEN 10000 AND 99999),
    Name            NVARCHAR(180) NOT NULL,
    [Type]          NVARCHAR(80) NOT NULL,
    Unit            NVARCHAR(20) NOT NULL,
    UnitCost        DECIMAL(10,2) NOT NULL,
    [Status]        NVARCHAR(40) NOT NULL
);
GO

CREATE TABLE dbo.Product (
    ProductID        INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_Product_ProductID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_Product_ProductID_5Digits CHECK (ProductID BETWEEN 10000 AND 99999),
    SKU              NVARCHAR(80) NOT NULL,
    Name             NVARCHAR(180) NOT NULL,
    Category         NVARCHAR(80) NOT NULL,
    [Description]    NVARCHAR(MAX) NOT NULL,
    Season           NVARCHAR(80) NOT NULL,
    [Status]         NVARCHAR(40) NOT NULL,
    ApprovalStatus   NVARCHAR(40) NULL,
    BranchID         INT NULL,
    CONSTRAINT UQ_Product_SKU UNIQUE (SKU),
    CONSTRAINT FK_Product_Branch FOREIGN KEY (BranchID) REFERENCES dbo.Branch(BranchID)
);
GO

CREATE TABLE dbo.Budget (
    BudgetID               INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_Budget_BudgetID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_Budget_BudgetID_5Digits CHECK (BudgetID BETWEEN 10000 AND 99999),
    BudgetCode             NVARCHAR(80) NOT NULL,
    Name                   NVARCHAR(180) NOT NULL,
    RegionID               INT NULL,
    AppliesToAll           BIT NOT NULL CONSTRAINT DF_Budget_AppliesToAll DEFAULT (0),
    PeriodStart            DATE NOT NULL,
    PeriodEnd              DATE NOT NULL,
    MaterialsBudget        DECIMAL(10,2) NOT NULL,
    LaborBudget            DECIMAL(10,2) NOT NULL,
    OverheadBudget         DECIMAL(10,2) NOT NULL,
    WasteAllowanceBudget   DECIMAL(10,2) NOT NULL,
    TotalBudget            DECIMAL(10,2) NOT NULL,
    ReservedAmount         DECIMAL(10,2) NOT NULL CONSTRAINT DF_Budget_ReservedAmount DEFAULT (0),
    SpentAmount            DECIMAL(10,2) NOT NULL CONSTRAINT DF_Budget_SpentAmount DEFAULT (0),
    RemainingAmount        DECIMAL(10,2) NOT NULL,
    [Status]               NVARCHAR(40) NOT NULL,
    Notes                  NVARCHAR(MAX) NOT NULL CONSTRAINT DF_Budget_Notes DEFAULT (N''),
    RejectionReason        NVARCHAR(MAX) NULL,
    CreatedByUserID        INT NOT NULL,
    SubmittedByUserID      INT NULL,
    SubmittedAt            DATETIME2(0) NULL,
    ApprovedByUserID       INT NULL,
    ApprovedAt             DATETIME2(0) NULL,
    CreatedAt              DATETIME2(0) NOT NULL CONSTRAINT DF_Budget_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt              DATETIME2(0) NOT NULL CONSTRAINT DF_Budget_UpdatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT UQ_Budget_BudgetCode UNIQUE (BudgetCode),
    CONSTRAINT CK_Budget_Period CHECK (PeriodEnd >= PeriodStart),
    CONSTRAINT FK_Budget_Region FOREIGN KEY (RegionID) REFERENCES dbo.Region(RegionID),
    CONSTRAINT FK_Budget_CreatedBy FOREIGN KEY (CreatedByUserID) REFERENCES dbo.[User](UserID),
    CONSTRAINT FK_Budget_SubmittedBy FOREIGN KEY (SubmittedByUserID) REFERENCES dbo.[User](UserID),
    CONSTRAINT FK_Budget_ApprovedBy FOREIGN KEY (ApprovedByUserID) REFERENCES dbo.[User](UserID)
);
GO

CREATE TABLE dbo.ProductVersion (
    VersionID               INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_ProductVersion_VersionID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_ProductVersion_VersionID_5Digits CHECK (VersionID BETWEEN 10000 AND 99999),
    ProductID               INT NOT NULL,
    VersionNumber           NVARCHAR(50) NOT NULL,
    ApprovalStatus          NVARCHAR(40) NOT NULL,
    BOMComplete             BIT NOT NULL CONSTRAINT DF_ProductVersion_BOMComplete DEFAULT (0),
    StandardLaborCost       DECIMAL(10,2) NULL,
    StandardOverheadCost    DECIMAL(10,2) NULL,
    ReleasedBudgetID        INT NULL,
    ReleasedAt              DATETIME2(0) NULL,
    CONSTRAINT UQ_ProductVersion_Product_Version UNIQUE (ProductID, VersionNumber),
    CONSTRAINT FK_ProductVersion_Product FOREIGN KEY (ProductID) REFERENCES dbo.Product(ProductID),
    CONSTRAINT FK_ProductVersion_ReleasedBudget FOREIGN KEY (ReleasedBudgetID) REFERENCES dbo.Budget(BudgetID)
);
GO

CREATE TABLE dbo.BillOfMaterials (
    BOMID           INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_BOM_BOMID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_BOM_BOMID_5Digits CHECK (BOMID BETWEEN 10000 AND 99999),
    VersionID       INT NOT NULL,
    MaterialID      INT NOT NULL,
    QtyRequired     DECIMAL(10,2) NOT NULL,
    Unit            NVARCHAR(20) NOT NULL,
    UnitCost        DECIMAL(10,2) NOT NULL,
    CONSTRAINT UQ_BOM_Version_Material UNIQUE (VersionID, MaterialID),
    CONSTRAINT FK_BOM_Version FOREIGN KEY (VersionID) REFERENCES dbo.ProductVersion(VersionID),
    CONSTRAINT FK_BOM_Material FOREIGN KEY (MaterialID) REFERENCES dbo.Material(MaterialID)
);
GO

CREATE TABLE dbo.BudgetReservation (
    BudgetReservationID   INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_BudgetReservation_BudgetReservationID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_BudgetReservation_BudgetReservationID_5Digits CHECK (BudgetReservationID BETWEEN 10000 AND 99999),
    BudgetID              INT NOT NULL,
    VersionID             INT NOT NULL,
    MaterialAmount        DECIMAL(10,2) NOT NULL,
    LaborAmount           DECIMAL(10,2) NOT NULL,
    OverheadAmount        DECIMAL(10,2) NOT NULL,
    TotalAmount           DECIMAL(10,2) NOT NULL,
    RemainingAmount       DECIMAL(10,2) NOT NULL,
    [Status]              NVARCHAR(40) NOT NULL,
    CONSTRAINT UQ_BudgetReservation_Budget_Version UNIQUE (BudgetID, VersionID),
    CONSTRAINT FK_BudgetReservation_Budget FOREIGN KEY (BudgetID) REFERENCES dbo.Budget(BudgetID),
    CONSTRAINT FK_BudgetReservation_Version FOREIGN KEY (VersionID) REFERENCES dbo.ProductVersion(VersionID)
);
GO

/* =========================================================
   3) Warehouse, Inventory, Production, QA
   ========================================================= */

CREATE TABLE dbo.BinLocation (
    BinID          INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_BinLocation_BinID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_BinLocation_BinID_5Digits CHECK (BinID BETWEEN 10000 AND 99999),
    BranchID       INT NOT NULL,
    BinCode        NVARCHAR(80) NOT NULL,
    Capacity       DECIMAL(10,2) NOT NULL,
    [Type]         NVARCHAR(40) NOT NULL,
    CONSTRAINT UQ_BinLocation_BinCode UNIQUE (BinCode),
    CONSTRAINT FK_BinLocation_Branch FOREIGN KEY (BranchID) REFERENCES dbo.Branch(BranchID)
);
GO

CREATE TABLE dbo.MaterialInventory (
    MatInvID           INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_MaterialInventory_MatInvID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_MaterialInventory_MatInvID_5Digits CHECK (MatInvID BETWEEN 10000 AND 99999),
    BinID              INT NOT NULL,
    MaterialID         INT NOT NULL,
    QuantityOnHand     DECIMAL(10,2) NOT NULL CONSTRAINT DF_MaterialInventory_QOH DEFAULT (0),
    CONSTRAINT UQ_MaterialInventory_Bin_Material UNIQUE (BinID, MaterialID),
    CONSTRAINT FK_MaterialInventory_Bin FOREIGN KEY (BinID) REFERENCES dbo.BinLocation(BinID),
    CONSTRAINT FK_MaterialInventory_Material FOREIGN KEY (MaterialID) REFERENCES dbo.Material(MaterialID)
);
GO

CREATE TABLE dbo.MaterialTransaction (
    MatTransID         INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_MaterialTransaction_MatTransID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_MaterialTransaction_MatTransID_5Digits CHECK (MatTransID BETWEEN 10000 AND 99999),
    MatInvID           INT NOT NULL,
    UserID             INT NOT NULL,
    QtyChanged         DECIMAL(10,2) NOT NULL,
    TransactionType    NVARCHAR(40) NOT NULL,
    TransactionDate    DATETIME2(0) NOT NULL CONSTRAINT DF_MaterialTransaction_Date DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_MaterialTransaction_Inventory FOREIGN KEY (MatInvID) REFERENCES dbo.MaterialInventory(MatInvID),
    CONSTRAINT FK_MaterialTransaction_User FOREIGN KEY (UserID) REFERENCES dbo.[User](UserID)
);
GO

CREATE TABLE dbo.ProductionInventory (
    ProdInvID          INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_ProductionInventory_ProdInvID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_ProductionInventory_ProdInvID_5Digits CHECK (ProdInvID BETWEEN 10000 AND 99999),
    BinID              INT NOT NULL,
    VersionID          INT NOT NULL,
    QuantityOnHand     DECIMAL(10,2) NOT NULL CONSTRAINT DF_ProductionInventory_QOH DEFAULT (0),
    [Status]           NVARCHAR(40) NOT NULL,
    CONSTRAINT UQ_ProductionInventory_Bin_Version UNIQUE (BinID, VersionID),
    CONSTRAINT FK_ProductionInventory_Bin FOREIGN KEY (BinID) REFERENCES dbo.BinLocation(BinID),
    CONSTRAINT FK_ProductionInventory_Version FOREIGN KEY (VersionID) REFERENCES dbo.ProductVersion(VersionID)
);
GO

CREATE TABLE dbo.ProductTransaction (
    ProdTransID        INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_ProductTransaction_ProdTransID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_ProductTransaction_ProdTransID_5Digits CHECK (ProdTransID BETWEEN 10000 AND 99999),
    ProdInvID          INT NOT NULL,
    UserID             INT NOT NULL,
    QtyChanged         DECIMAL(10,2) NOT NULL,
    TransactionType    NVARCHAR(40) NOT NULL,
    TransactionDate    DATETIME2(0) NOT NULL CONSTRAINT DF_ProductTransaction_Date DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_ProductTransaction_Inventory FOREIGN KEY (ProdInvID) REFERENCES dbo.ProductionInventory(ProdInvID),
    CONSTRAINT FK_ProductTransaction_User FOREIGN KEY (UserID) REFERENCES dbo.[User](UserID)
);
GO

CREATE TABLE dbo.ProductionOrder (
    OrderID         INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_ProductionOrder_OrderID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_ProductionOrder_OrderID_5Digits CHECK (OrderID BETWEEN 10000 AND 99999),
    BranchID        INT NOT NULL,
    VersionID       INT NOT NULL,
    PlannedQty      INT NOT NULL,
    StartDate       DATE NOT NULL,
    [Status]        NVARCHAR(40) NOT NULL,
    CONSTRAINT FK_ProductionOrder_Branch FOREIGN KEY (BranchID) REFERENCES dbo.Branch(BranchID),
    CONSTRAINT FK_ProductionOrder_Version FOREIGN KEY (VersionID) REFERENCES dbo.ProductVersion(VersionID)
);
GO

CREATE TABLE dbo.ProductionBatch (
    BatchID         INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_ProductionBatch_BatchID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_ProductionBatch_BatchID_5Digits CHECK (BatchID BETWEEN 10000 AND 99999),
    OrderID         INT NOT NULL,
    BatchNumber     NVARCHAR(80) NOT NULL,
    BatchQty        INT NOT NULL,
    ProducedDate    DATE NULL,
    [Status]        NVARCHAR(40) NOT NULL,
    CONSTRAINT UQ_ProductionBatch_BatchNumber UNIQUE (BatchNumber),
    CONSTRAINT FK_ProductionBatch_Order FOREIGN KEY (OrderID) REFERENCES dbo.ProductionOrder(OrderID)
);
GO

CREATE TABLE dbo.Inspection (
    InspectionID        INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_Inspection_InspectionID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_Inspection_InspectionID_5Digits CHECK (InspectionID BETWEEN 10000 AND 99999),
    BatchID             INT NOT NULL,
    UserID              INT NOT NULL,
    AQLLevel            NVARCHAR(40) NOT NULL,
    InspectionLevel     NVARCHAR(40) NOT NULL,
    SampleSize          INT NOT NULL,
    DefectsFound        INT NOT NULL,
    AcceptThreshold     INT NOT NULL,
    RejectThreshold     INT NOT NULL,
    Result              NVARCHAR(40) NOT NULL,
    Notes               NVARCHAR(MAX) NULL,
    InspectionDate      DATETIME2(0) NOT NULL CONSTRAINT DF_Inspection_Date DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_Inspection_Batch FOREIGN KEY (BatchID) REFERENCES dbo.ProductionBatch(BatchID),
    CONSTRAINT FK_Inspection_User FOREIGN KEY (UserID) REFERENCES dbo.[User](UserID)
);
GO

/* =========================================================
   4) Branch Requests, Transfers, Receiving
   ========================================================= */

CREATE TABLE dbo.BranchRequest (
    RequestID            INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_BranchRequest_RequestID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_BranchRequest_RequestID_5Digits CHECK (RequestID BETWEEN 10000 AND 99999),
    BranchID             INT NOT NULL,
    RegionID             INT NOT NULL,
    RequestedByUserID    INT NOT NULL,
    [Status]             NVARCHAR(40) NOT NULL,
    RequestedAt          DATETIME2(0) NOT NULL CONSTRAINT DF_BranchRequest_RequestedAt DEFAULT (SYSUTCDATETIME()),
    Notes                NVARCHAR(MAX) NULL,
    CONSTRAINT FK_BranchRequest_Branch FOREIGN KEY (BranchID) REFERENCES dbo.Branch(BranchID),
    CONSTRAINT FK_BranchRequest_Region FOREIGN KEY (RegionID) REFERENCES dbo.Region(RegionID),
    CONSTRAINT FK_BranchRequest_User FOREIGN KEY (RequestedByUserID) REFERENCES dbo.[User](UserID)
);
GO

CREATE TABLE dbo.BranchRequestItem (
    RequestItemID     INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_BranchRequestItem_RequestItemID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_BranchRequestItem_RequestItemID_5Digits CHECK (RequestItemID BETWEEN 10000 AND 99999),
    RequestID         INT NOT NULL,
    VersionID         INT NOT NULL,
    QtyRequested      INT NOT NULL,
    CONSTRAINT FK_BranchRequestItem_Request FOREIGN KEY (RequestID) REFERENCES dbo.BranchRequest(RequestID),
    CONSTRAINT FK_BranchRequestItem_Version FOREIGN KEY (VersionID) REFERENCES dbo.ProductVersion(VersionID)
);
GO

CREATE TABLE dbo.Transfer (
    TransferID        INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_Transfer_TransferID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_Transfer_TransferID_5Digits CHECK (TransferID BETWEEN 10000 AND 99999),
    RequestID         INT NOT NULL,
    FromBinID         INT NOT NULL,
    ScheduledDate     DATE NOT NULL,
    [Status]          NVARCHAR(40) NOT NULL,
    DeliveredAt       DATETIME2(0) NULL,
    CONSTRAINT FK_Transfer_Request FOREIGN KEY (RequestID) REFERENCES dbo.BranchRequest(RequestID),
    CONSTRAINT FK_Transfer_FromBin FOREIGN KEY (FromBinID) REFERENCES dbo.BinLocation(BinID)
);
GO

CREATE TABLE dbo.TransferItem (
    TransferItemID    INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_TransferItem_TransferItemID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_TransferItem_TransferItemID_5Digits CHECK (TransferItemID BETWEEN 10000 AND 99999),
    TransferID        INT NOT NULL,
    VersionID         INT NOT NULL,
    QtyShipped        INT NOT NULL,
    CONSTRAINT FK_TransferItem_Transfer FOREIGN KEY (TransferID) REFERENCES dbo.Transfer(TransferID),
    CONSTRAINT FK_TransferItem_Version FOREIGN KEY (VersionID) REFERENCES dbo.ProductVersion(VersionID)
);
GO

/* Frontend-only local demo table equivalents */
CREATE TABLE dbo.RestockRequest (
    RestockRequestID   INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_RestockRequest_RestockRequestID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_RestockRequest_RestockRequestID_5Digits CHECK (RestockRequestID BETWEEN 10000 AND 99999),
    SKU                NVARCHAR(80) NOT NULL,
    Category           NVARCHAR(80) NOT NULL,
    Size               NVARCHAR(40) NOT NULL,
    RequestedQty       INT NOT NULL,
    Priority           NVARCHAR(20) NOT NULL,
    Note               NVARCHAR(MAX) NOT NULL,
    RequestedAt        DATETIME2(0) NOT NULL,
    RequestedBy        NVARCHAR(120) NOT NULL,
    BranchName         NVARCHAR(160) NOT NULL,
    OnHand             INT NOT NULL,
    ReorderLevel       INT NOT NULL,
    [Status]           NVARCHAR(40) NOT NULL,
    TargetRole         NVARCHAR(40) NOT NULL
);
GO

CREATE TABLE dbo.ReceivingRecord (
    ReceivingID        INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_ReceivingRecord_ReceivingID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_ReceivingRecord_ReceivingID_5Digits CHECK (ReceivingID BETWEEN 10000 AND 99999),
    TransferRef        NVARCHAR(80) NOT NULL,
    SKU                NVARCHAR(80) NOT NULL,
    QtyDispatched      INT NOT NULL,
    ETA                DATE NOT NULL,
    SourceWarehouse    NVARCHAR(160) NOT NULL,
    [Status]           NVARCHAR(40) NOT NULL,
    Priority           NVARCHAR(20) NOT NULL,
    DamagedUnits       INT NOT NULL CONSTRAINT DF_ReceivingRecord_DamagedUnits DEFAULT (0),
    MissingUnits       INT NOT NULL CONSTRAINT DF_ReceivingRecord_MissingUnits DEFAULT (0),
    Note               NVARCHAR(MAX) NOT NULL CONSTRAINT DF_ReceivingRecord_Note DEFAULT (N'')
);
GO

/* =========================================================
   5) Notifications
   ========================================================= */

CREATE TABLE dbo.Notification (
    NotificationID    INT NOT NULL PRIMARY KEY
        CONSTRAINT DF_Notification_NotificationID DEFAULT ((ABS(CHECKSUM(NEWID())) % 90000) + 10000)
        CONSTRAINT CK_Notification_NotificationID_5Digits CHECK (NotificationID BETWEEN 10000 AND 99999),
    UserID            INT NULL,
    RegionID          INT NULL,
    [Type]            NVARCHAR(40) NOT NULL,
    [Message]         NVARCHAR(MAX) NOT NULL,
    IsRead            BIT NOT NULL CONSTRAINT DF_Notification_IsRead DEFAULT (0),
    CreatedAt         DATETIME2(0) NOT NULL CONSTRAINT DF_Notification_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_Notification_User FOREIGN KEY (UserID) REFERENCES dbo.[User](UserID),
    CONSTRAINT FK_Notification_Region FOREIGN KEY (RegionID) REFERENCES dbo.Region(RegionID),
    CONSTRAINT CK_Notification_Target CHECK (UserID IS NOT NULL OR RegionID IS NOT NULL)
);
GO

/* =========================================================
   6) Helpful Indexes
   ========================================================= */

CREATE INDEX IX_Branch_RegionID ON dbo.Branch(RegionID);
CREATE INDEX IX_User_BranchID ON dbo.[User](BranchID);
CREATE INDEX IX_User_RoleID ON dbo.[User](RoleID);
CREATE INDEX IX_ProductVersion_ProductID ON dbo.ProductVersion(ProductID);
CREATE INDEX IX_BOM_VersionID ON dbo.BillOfMaterials(VersionID);
CREATE INDEX IX_Budget_RegionID ON dbo.Budget(RegionID);
CREATE INDEX IX_BinLocation_BranchID ON dbo.BinLocation(BranchID);
CREATE INDEX IX_MaterialInventory_BinID ON dbo.MaterialInventory(BinID);
CREATE INDEX IX_MaterialTransaction_MatInvID ON dbo.MaterialTransaction(MatInvID);
CREATE INDEX IX_ProductionInventory_BinID ON dbo.ProductionInventory(BinID);
CREATE INDEX IX_ProductTransaction_ProdInvID ON dbo.ProductTransaction(ProdInvID);
CREATE INDEX IX_ProductionOrder_BranchID ON dbo.ProductionOrder(BranchID);
CREATE INDEX IX_ProductionBatch_OrderID ON dbo.ProductionBatch(OrderID);
CREATE INDEX IX_Inspection_BatchID ON dbo.Inspection(BatchID);
CREATE INDEX IX_BranchRequest_BranchID ON dbo.BranchRequest(BranchID);
CREATE INDEX IX_BranchRequestItem_RequestID ON dbo.BranchRequestItem(RequestID);
CREATE INDEX IX_Transfer_RequestID ON dbo.Transfer(RequestID);
CREATE INDEX IX_TransferItem_TransferID ON dbo.TransferItem(TransferID);
CREATE INDEX IX_Notification_UserID ON dbo.Notification(UserID);
CREATE INDEX IX_Notification_RegionID ON dbo.Notification(RegionID);
CREATE INDEX IX_Notification_IsRead_CreatedAt ON dbo.Notification(IsRead, CreatedAt DESC);
GO
