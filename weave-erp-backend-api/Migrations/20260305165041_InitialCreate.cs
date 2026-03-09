using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BillOfMaterials",
                columns: table => new
                {
                    BOMID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VersionID = table.Column<int>(type: "int", nullable: false),
                    MaterialID = table.Column<int>(type: "int", nullable: false),
                    QtyRequired = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    UnitCost = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillOfMaterials", x => x.BOMID);
                });

            migrationBuilder.CreateTable(
                name: "BinLocations",
                columns: table => new
                {
                    BinID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BranchID = table.Column<int>(type: "int", nullable: false),
                    BinCode = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Capacity = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BinLocations", x => x.BinID);
                });

            migrationBuilder.CreateTable(
                name: "Branches",
                columns: table => new
                {
                    BranchID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BranchName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RegionID = table.Column<int>(type: "int", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Branches", x => x.BranchID);
                });

            migrationBuilder.CreateTable(
                name: "BranchRequestItems",
                columns: table => new
                {
                    RequestItemID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RequestID = table.Column<int>(type: "int", nullable: false),
                    VersionID = table.Column<int>(type: "int", nullable: false),
                    QtyRequested = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BranchRequestItems", x => x.RequestItemID);
                });

            migrationBuilder.CreateTable(
                name: "BranchRequests",
                columns: table => new
                {
                    RequestID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BranchID = table.Column<int>(type: "int", nullable: false),
                    RegionID = table.Column<int>(type: "int", nullable: false),
                    RequestedByUserID = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BranchRequests", x => x.RequestID);
                    table.ForeignKey(
                        name: "FK_BranchRequests_Branches_BranchID",
                        column: x => x.BranchID,
                        principalTable: "Branches",
                        principalColumn: "BranchID");
                });

            migrationBuilder.CreateTable(
                name: "BudgetReservations",
                columns: table => new
                {
                    BudgetReservationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BudgetID = table.Column<int>(type: "int", nullable: false),
                    VersionID = table.Column<int>(type: "int", nullable: false),
                    MaterialAmount = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    LaborAmount = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    OverheadAmount = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetReservations", x => x.BudgetReservationID);
                });

            migrationBuilder.CreateTable(
                name: "Budgets",
                columns: table => new
                {
                    BudgetID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BudgetCode = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    RegionID = table.Column<int>(type: "int", nullable: true),
                    AppliesToAll = table.Column<bool>(type: "bit", nullable: false),
                    PeriodStart = table.Column<DateOnly>(type: "date", nullable: false),
                    PeriodEnd = table.Column<DateOnly>(type: "date", nullable: false),
                    MaterialsBudget = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    LaborBudget = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    OverheadBudget = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    WasteAllowanceBudget = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    TotalBudget = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    ReservedAmount = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    SpentAmount = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    SubmittedByUserID = table.Column<int>(type: "int", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedByUserID = table.Column<int>(type: "int", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Budgets", x => x.BudgetID);
                });

            migrationBuilder.CreateTable(
                name: "Inspections",
                columns: table => new
                {
                    InspectionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BatchID = table.Column<int>(type: "int", nullable: false),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    AQLLevel = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    InspectionLevel = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    SampleSize = table.Column<int>(type: "int", nullable: false),
                    DefectsFound = table.Column<int>(type: "int", nullable: false),
                    AcceptThreshold = table.Column<int>(type: "int", nullable: false),
                    RejectThreshold = table.Column<int>(type: "int", nullable: false),
                    Result = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InspectionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inspections", x => x.InspectionID);
                });

            migrationBuilder.CreateTable(
                name: "MaterialInventories",
                columns: table => new
                {
                    MatInvID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BinID = table.Column<int>(type: "int", nullable: false),
                    MaterialID = table.Column<int>(type: "int", nullable: false),
                    QuantityOnHand = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaterialInventories", x => x.MatInvID);
                    table.ForeignKey(
                        name: "FK_MaterialInventories_BinLocations_BinID",
                        column: x => x.BinID,
                        principalTable: "BinLocations",
                        principalColumn: "BinID");
                });

            migrationBuilder.CreateTable(
                name: "Materials",
                columns: table => new
                {
                    MaterialID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    UnitCost = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Materials", x => x.MaterialID);
                });

            migrationBuilder.CreateTable(
                name: "MaterialTransactions",
                columns: table => new
                {
                    MatTransID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MatInvID = table.Column<int>(type: "int", nullable: false),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    QtyChanged = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    TransactionType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaterialTransactions", x => x.MatTransID);
                    table.ForeignKey(
                        name: "FK_MaterialTransactions_MaterialInventories_MatInvID",
                        column: x => x.MatInvID,
                        principalTable: "MaterialInventories",
                        principalColumn: "MatInvID");
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: true),
                    RegionID = table.Column<int>(type: "int", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotificationID);
                });

            migrationBuilder.CreateTable(
                name: "ProductionBatches",
                columns: table => new
                {
                    BatchID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderID = table.Column<int>(type: "int", nullable: false),
                    BatchNumber = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    BatchQty = table.Column<int>(type: "int", nullable: false),
                    ProducedDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionBatches", x => x.BatchID);
                });

            migrationBuilder.CreateTable(
                name: "ProductionInventories",
                columns: table => new
                {
                    ProdInvID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BinID = table.Column<int>(type: "int", nullable: false),
                    VersionID = table.Column<int>(type: "int", nullable: false),
                    QuantityOnHand = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionInventories", x => x.ProdInvID);
                    table.ForeignKey(
                        name: "FK_ProductionInventories_BinLocations_BinID",
                        column: x => x.BinID,
                        principalTable: "BinLocations",
                        principalColumn: "BinID");
                });

            migrationBuilder.CreateTable(
                name: "ProductionOrders",
                columns: table => new
                {
                    OrderID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BranchID = table.Column<int>(type: "int", nullable: false),
                    VersionID = table.Column<int>(type: "int", nullable: false),
                    PlannedQty = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionOrders", x => x.OrderID);
                    table.ForeignKey(
                        name: "FK_ProductionOrders_Branches_BranchID",
                        column: x => x.BranchID,
                        principalTable: "Branches",
                        principalColumn: "BranchID");
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    ProductID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SKU = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Season = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ApprovalStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    BranchID = table.Column<int>(type: "int", nullable: true),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.ProductID);
                    table.ForeignKey(
                        name: "FK_Products_Branches_BranchID",
                        column: x => x.BranchID,
                        principalTable: "Branches",
                        principalColumn: "BranchID");
                });

            migrationBuilder.CreateTable(
                name: "ProductTransactions",
                columns: table => new
                {
                    ProdTransID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProdInvID = table.Column<int>(type: "int", nullable: false),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    QtyChanged = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    TransactionType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductTransactions", x => x.ProdTransID);
                    table.ForeignKey(
                        name: "FK_ProductTransactions_ProductionInventories_ProdInvID",
                        column: x => x.ProdInvID,
                        principalTable: "ProductionInventories",
                        principalColumn: "ProdInvID");
                });

            migrationBuilder.CreateTable(
                name: "ProductVersions",
                columns: table => new
                {
                    VersionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductID = table.Column<int>(type: "int", nullable: false),
                    VersionNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ApprovalStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    BOMComplete = table.Column<bool>(type: "bit", nullable: false),
                    StandardLaborCost = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    StandardOverheadCost = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    ReleasedBudgetID = table.Column<int>(type: "int", nullable: true),
                    ReleasedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductVersions", x => x.VersionID);
                    table.ForeignKey(
                        name: "FK_ProductVersions_Budgets_ReleasedBudgetID",
                        column: x => x.ReleasedBudgetID,
                        principalTable: "Budgets",
                        principalColumn: "BudgetID");
                    table.ForeignKey(
                        name: "FK_ProductVersions_Products_ProductID",
                        column: x => x.ProductID,
                        principalTable: "Products",
                        principalColumn: "ProductID");
                });

            migrationBuilder.CreateTable(
                name: "Regions",
                columns: table => new
                {
                    RegionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RegionName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Regions", x => x.RegionID);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissionChangeRequests",
                columns: table => new
                {
                    RequestID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleID = table.Column<int>(type: "int", nullable: false),
                    BranchID = table.Column<int>(type: "int", nullable: true),
                    RequestedByUserID = table.Column<int>(type: "int", nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ReviewedByUserID = table.Column<int>(type: "int", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PayloadJSON = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissionChangeRequests", x => x.RequestID);
                    table.ForeignKey(
                        name: "FK_RolePermissionChangeRequests_Branches_BranchID",
                        column: x => x.BranchID,
                        principalTable: "Branches",
                        principalColumn: "BranchID");
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    RoleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DisplayName = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Scope = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.RoleID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BranchID = table.Column<int>(type: "int", nullable: false),
                    RoleID = table.Column<int>(type: "int", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Firstname = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Middlename = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Lastname = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
                    table.ForeignKey(
                        name: "FK_Users_Branches_BranchID",
                        column: x => x.BranchID,
                        principalTable: "Branches",
                        principalColumn: "BranchID");
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleID",
                        column: x => x.RoleID,
                        principalTable: "Roles",
                        principalColumn: "RoleID");
                    table.ForeignKey(
                        name: "FK_Users_Users_CreatedByUserID",
                        column: x => x.CreatedByUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_Users_Users_UpdatedByUserID",
                        column: x => x.UpdatedByUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "Transfers",
                columns: table => new
                {
                    TransferID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RequestID = table.Column<int>(type: "int", nullable: false),
                    FromBinID = table.Column<int>(type: "int", nullable: false),
                    ScheduledDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    DeliveredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transfers", x => x.TransferID);
                    table.ForeignKey(
                        name: "FK_Transfers_BinLocations_FromBinID",
                        column: x => x.FromBinID,
                        principalTable: "BinLocations",
                        principalColumn: "BinID");
                    table.ForeignKey(
                        name: "FK_Transfers_BranchRequests_RequestID",
                        column: x => x.RequestID,
                        principalTable: "BranchRequests",
                        principalColumn: "RequestID");
                    table.ForeignKey(
                        name: "FK_Transfers_Users_CreatedByUserID",
                        column: x => x.CreatedByUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_Transfers_Users_UpdatedByUserID",
                        column: x => x.UpdatedByUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "TransferItems",
                columns: table => new
                {
                    TransferItemID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TransferID = table.Column<int>(type: "int", nullable: false),
                    VersionID = table.Column<int>(type: "int", nullable: false),
                    QtyShipped = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransferItems", x => x.TransferItemID);
                    table.ForeignKey(
                        name: "FK_TransferItems_ProductVersions_VersionID",
                        column: x => x.VersionID,
                        principalTable: "ProductVersions",
                        principalColumn: "VersionID");
                    table.ForeignKey(
                        name: "FK_TransferItems_Transfers_TransferID",
                        column: x => x.TransferID,
                        principalTable: "Transfers",
                        principalColumn: "TransferID");
                    table.ForeignKey(
                        name: "FK_TransferItems_Users_CreatedByUserID",
                        column: x => x.CreatedByUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_TransferItems_Users_UpdatedByUserID",
                        column: x => x.UpdatedByUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_BillOfMaterials_CreatedByUserID",
                table: "BillOfMaterials",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_BillOfMaterials_MaterialID",
                table: "BillOfMaterials",
                column: "MaterialID");

            migrationBuilder.CreateIndex(
                name: "IX_BillOfMaterials_UpdatedByUserID",
                table: "BillOfMaterials",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_BillOfMaterials_VersionID",
                table: "BillOfMaterials",
                column: "VersionID");

            migrationBuilder.CreateIndex(
                name: "IX_BinLocations_BinCode",
                table: "BinLocations",
                column: "BinCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BinLocations_BranchID",
                table: "BinLocations",
                column: "BranchID");

            migrationBuilder.CreateIndex(
                name: "IX_BinLocations_CreatedByUserID",
                table: "BinLocations",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_BinLocations_UpdatedByUserID",
                table: "BinLocations",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_CreatedByUserID",
                table: "Branches",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_RegionID",
                table: "Branches",
                column: "RegionID");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_UpdatedByUserID",
                table: "Branches",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_BranchRequestItems_CreatedByUserID",
                table: "BranchRequestItems",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_BranchRequestItems_RequestID",
                table: "BranchRequestItems",
                column: "RequestID");

            migrationBuilder.CreateIndex(
                name: "IX_BranchRequestItems_UpdatedByUserID",
                table: "BranchRequestItems",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_BranchRequestItems_VersionID",
                table: "BranchRequestItems",
                column: "VersionID");

            migrationBuilder.CreateIndex(
                name: "IX_BranchRequests_BranchID",
                table: "BranchRequests",
                column: "BranchID");

            migrationBuilder.CreateIndex(
                name: "IX_BranchRequests_CreatedByUserID",
                table: "BranchRequests",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_BranchRequests_RegionID",
                table: "BranchRequests",
                column: "RegionID");

            migrationBuilder.CreateIndex(
                name: "IX_BranchRequests_RequestedByUserID",
                table: "BranchRequests",
                column: "RequestedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_BranchRequests_UpdatedByUserID",
                table: "BranchRequests",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetReservations_BudgetID",
                table: "BudgetReservations",
                column: "BudgetID");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetReservations_CreatedByUserID",
                table: "BudgetReservations",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetReservations_UpdatedByUserID",
                table: "BudgetReservations",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetReservations_VersionID",
                table: "BudgetReservations",
                column: "VersionID");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_ApprovedByUserID",
                table: "Budgets",
                column: "ApprovedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_BudgetCode",
                table: "Budgets",
                column: "BudgetCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_CreatedByUserID",
                table: "Budgets",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_RegionID",
                table: "Budgets",
                column: "RegionID");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_SubmittedByUserID",
                table: "Budgets",
                column: "SubmittedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_UpdatedByUserID",
                table: "Budgets",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Inspections_BatchID",
                table: "Inspections",
                column: "BatchID");

            migrationBuilder.CreateIndex(
                name: "IX_Inspections_CreatedByUserID",
                table: "Inspections",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Inspections_UpdatedByUserID",
                table: "Inspections",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Inspections_UserID",
                table: "Inspections",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialInventories_BinID",
                table: "MaterialInventories",
                column: "BinID");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialInventories_CreatedByUserID",
                table: "MaterialInventories",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialInventories_MaterialID",
                table: "MaterialInventories",
                column: "MaterialID");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialInventories_UpdatedByUserID",
                table: "MaterialInventories",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Materials_CreatedByUserID",
                table: "Materials",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Materials_UpdatedByUserID",
                table: "Materials",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialTransactions_CreatedByUserID",
                table: "MaterialTransactions",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialTransactions_MatInvID",
                table: "MaterialTransactions",
                column: "MatInvID");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialTransactions_UpdatedByUserID",
                table: "MaterialTransactions",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialTransactions_UserID",
                table: "MaterialTransactions",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CreatedByUserID",
                table: "Notifications",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RegionID",
                table: "Notifications",
                column: "RegionID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UpdatedByUserID",
                table: "Notifications",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserID",
                table: "Notifications",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_BatchNumber",
                table: "ProductionBatches",
                column: "BatchNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_CreatedByUserID",
                table: "ProductionBatches",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_OrderID",
                table: "ProductionBatches",
                column: "OrderID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_UpdatedByUserID",
                table: "ProductionBatches",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionInventories_BinID",
                table: "ProductionInventories",
                column: "BinID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionInventories_CreatedByUserID",
                table: "ProductionInventories",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionInventories_UpdatedByUserID",
                table: "ProductionInventories",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionInventories_VersionID",
                table: "ProductionInventories",
                column: "VersionID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionOrders_BranchID",
                table: "ProductionOrders",
                column: "BranchID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionOrders_CreatedByUserID",
                table: "ProductionOrders",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionOrders_UpdatedByUserID",
                table: "ProductionOrders",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionOrders_VersionID",
                table: "ProductionOrders",
                column: "VersionID");

            migrationBuilder.CreateIndex(
                name: "IX_Products_BranchID",
                table: "Products",
                column: "BranchID");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CreatedByUserID",
                table: "Products",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Products_SKU",
                table: "Products",
                column: "SKU",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_UpdatedByUserID",
                table: "Products",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductTransactions_CreatedByUserID",
                table: "ProductTransactions",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductTransactions_ProdInvID",
                table: "ProductTransactions",
                column: "ProdInvID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductTransactions_UpdatedByUserID",
                table: "ProductTransactions",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductTransactions_UserID",
                table: "ProductTransactions",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVersions_CreatedByUserID",
                table: "ProductVersions",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVersions_ProductID",
                table: "ProductVersions",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVersions_ReleasedBudgetID",
                table: "ProductVersions",
                column: "ReleasedBudgetID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVersions_UpdatedByUserID",
                table: "ProductVersions",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Regions_CreatedByUserID",
                table: "Regions",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Regions_RegionName",
                table: "Regions",
                column: "RegionName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Regions_UpdatedByUserID",
                table: "Regions",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissionChangeRequests_BranchID",
                table: "RolePermissionChangeRequests",
                column: "BranchID");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissionChangeRequests_CreatedByUserID",
                table: "RolePermissionChangeRequests",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissionChangeRequests_RequestedByUserID",
                table: "RolePermissionChangeRequests",
                column: "RequestedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissionChangeRequests_ReviewedByUserID",
                table: "RolePermissionChangeRequests",
                column: "ReviewedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissionChangeRequests_RoleID",
                table: "RolePermissionChangeRequests",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissionChangeRequests_UpdatedByUserID",
                table: "RolePermissionChangeRequests",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_CreatedByUserID",
                table: "Roles",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_UpdatedByUserID",
                table: "Roles",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_TransferItems_CreatedByUserID",
                table: "TransferItems",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_TransferItems_TransferID",
                table: "TransferItems",
                column: "TransferID");

            migrationBuilder.CreateIndex(
                name: "IX_TransferItems_UpdatedByUserID",
                table: "TransferItems",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_TransferItems_VersionID",
                table: "TransferItems",
                column: "VersionID");

            migrationBuilder.CreateIndex(
                name: "IX_Transfers_CreatedByUserID",
                table: "Transfers",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Transfers_FromBinID",
                table: "Transfers",
                column: "FromBinID");

            migrationBuilder.CreateIndex(
                name: "IX_Transfers_RequestID",
                table: "Transfers",
                column: "RequestID");

            migrationBuilder.CreateIndex(
                name: "IX_Transfers_UpdatedByUserID",
                table: "Transfers",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Users_BranchID",
                table: "Users",
                column: "BranchID");

            migrationBuilder.CreateIndex(
                name: "IX_Users_CreatedByUserID",
                table: "Users",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleID",
                table: "Users",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_Users_UpdatedByUserID",
                table: "Users",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_Materials_MaterialID",
                table: "BillOfMaterials",
                column: "MaterialID",
                principalTable: "Materials",
                principalColumn: "MaterialID");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_ProductVersions_VersionID",
                table: "BillOfMaterials",
                column: "VersionID",
                principalTable: "ProductVersions",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_Users_CreatedByUserID",
                table: "BillOfMaterials",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_Users_UpdatedByUserID",
                table: "BillOfMaterials",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BinLocations_Branches_BranchID",
                table: "BinLocations",
                column: "BranchID",
                principalTable: "Branches",
                principalColumn: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_BinLocations_Users_CreatedByUserID",
                table: "BinLocations",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BinLocations_Users_UpdatedByUserID",
                table: "BinLocations",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branches_Regions_RegionID",
                table: "Branches",
                column: "RegionID",
                principalTable: "Regions",
                principalColumn: "RegionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branches_Users_CreatedByUserID",
                table: "Branches",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branches_Users_UpdatedByUserID",
                table: "Branches",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequestItems_BranchRequests_RequestID",
                table: "BranchRequestItems",
                column: "RequestID",
                principalTable: "BranchRequests",
                principalColumn: "RequestID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequestItems_ProductVersions_VersionID",
                table: "BranchRequestItems",
                column: "VersionID",
                principalTable: "ProductVersions",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequestItems_Users_CreatedByUserID",
                table: "BranchRequestItems",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequestItems_Users_UpdatedByUserID",
                table: "BranchRequestItems",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequests_Regions_RegionID",
                table: "BranchRequests",
                column: "RegionID",
                principalTable: "Regions",
                principalColumn: "RegionID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequests_Users_CreatedByUserID",
                table: "BranchRequests",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequests_Users_RequestedByUserID",
                table: "BranchRequests",
                column: "RequestedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequests_Users_UpdatedByUserID",
                table: "BranchRequests",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetReservations_Budgets_BudgetID",
                table: "BudgetReservations",
                column: "BudgetID",
                principalTable: "Budgets",
                principalColumn: "BudgetID");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetReservations_ProductVersions_VersionID",
                table: "BudgetReservations",
                column: "VersionID",
                principalTable: "ProductVersions",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetReservations_Users_CreatedByUserID",
                table: "BudgetReservations",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetReservations_Users_UpdatedByUserID",
                table: "BudgetReservations",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budgets_Regions_RegionID",
                table: "Budgets",
                column: "RegionID",
                principalTable: "Regions",
                principalColumn: "RegionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budgets_Users_ApprovedByUserID",
                table: "Budgets",
                column: "ApprovedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budgets_Users_CreatedByUserID",
                table: "Budgets",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budgets_Users_SubmittedByUserID",
                table: "Budgets",
                column: "SubmittedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budgets_Users_UpdatedByUserID",
                table: "Budgets",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspections_ProductionBatches_BatchID",
                table: "Inspections",
                column: "BatchID",
                principalTable: "ProductionBatches",
                principalColumn: "BatchID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspections_Users_CreatedByUserID",
                table: "Inspections",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspections_Users_UpdatedByUserID",
                table: "Inspections",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspections_Users_UserID",
                table: "Inspections",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialInventories_Materials_MaterialID",
                table: "MaterialInventories",
                column: "MaterialID",
                principalTable: "Materials",
                principalColumn: "MaterialID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialInventories_Users_CreatedByUserID",
                table: "MaterialInventories",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialInventories_Users_UpdatedByUserID",
                table: "MaterialInventories",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Materials_Users_CreatedByUserID",
                table: "Materials",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Materials_Users_UpdatedByUserID",
                table: "Materials",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialTransactions_Users_CreatedByUserID",
                table: "MaterialTransactions",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialTransactions_Users_UpdatedByUserID",
                table: "MaterialTransactions",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialTransactions_Users_UserID",
                table: "MaterialTransactions",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Regions_RegionID",
                table: "Notifications",
                column: "RegionID",
                principalTable: "Regions",
                principalColumn: "RegionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_CreatedByUserID",
                table: "Notifications",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_UpdatedByUserID",
                table: "Notifications",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_UserID",
                table: "Notifications",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionBatches_ProductionOrders_OrderID",
                table: "ProductionBatches",
                column: "OrderID",
                principalTable: "ProductionOrders",
                principalColumn: "OrderID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionBatches_Users_CreatedByUserID",
                table: "ProductionBatches",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionBatches_Users_UpdatedByUserID",
                table: "ProductionBatches",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventories_ProductVersions_VersionID",
                table: "ProductionInventories",
                column: "VersionID",
                principalTable: "ProductVersions",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventories_Users_CreatedByUserID",
                table: "ProductionInventories",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventories_Users_UpdatedByUserID",
                table: "ProductionInventories",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrders_ProductVersions_VersionID",
                table: "ProductionOrders",
                column: "VersionID",
                principalTable: "ProductVersions",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrders_Users_CreatedByUserID",
                table: "ProductionOrders",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrders_Users_UpdatedByUserID",
                table: "ProductionOrders",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Users_CreatedByUserID",
                table: "Products",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Users_UpdatedByUserID",
                table: "Products",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductTransactions_Users_CreatedByUserID",
                table: "ProductTransactions",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductTransactions_Users_UpdatedByUserID",
                table: "ProductTransactions",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductTransactions_Users_UserID",
                table: "ProductTransactions",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVersions_Users_CreatedByUserID",
                table: "ProductVersions",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVersions_Users_UpdatedByUserID",
                table: "ProductVersions",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Regions_Users_CreatedByUserID",
                table: "Regions",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Regions_Users_UpdatedByUserID",
                table: "Regions",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequests_Roles_RoleID",
                table: "RolePermissionChangeRequests",
                column: "RoleID",
                principalTable: "Roles",
                principalColumn: "RoleID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequests_Users_CreatedByUserID",
                table: "RolePermissionChangeRequests",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequests_Users_RequestedByUserID",
                table: "RolePermissionChangeRequests",
                column: "RequestedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequests_Users_ReviewedByUserID",
                table: "RolePermissionChangeRequests",
                column: "ReviewedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequests_Users_UpdatedByUserID",
                table: "RolePermissionChangeRequests",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Roles_Users_CreatedByUserID",
                table: "Roles",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Roles_Users_UpdatedByUserID",
                table: "Roles",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Branches_Users_CreatedByUserID",
                table: "Branches");

            migrationBuilder.DropForeignKey(
                name: "FK_Branches_Users_UpdatedByUserID",
                table: "Branches");

            migrationBuilder.DropForeignKey(
                name: "FK_Regions_Users_CreatedByUserID",
                table: "Regions");

            migrationBuilder.DropForeignKey(
                name: "FK_Regions_Users_UpdatedByUserID",
                table: "Regions");

            migrationBuilder.DropForeignKey(
                name: "FK_Roles_Users_CreatedByUserID",
                table: "Roles");

            migrationBuilder.DropForeignKey(
                name: "FK_Roles_Users_UpdatedByUserID",
                table: "Roles");

            migrationBuilder.DropTable(
                name: "BillOfMaterials");

            migrationBuilder.DropTable(
                name: "BranchRequestItems");

            migrationBuilder.DropTable(
                name: "BudgetReservations");

            migrationBuilder.DropTable(
                name: "Inspections");

            migrationBuilder.DropTable(
                name: "MaterialTransactions");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "ProductTransactions");

            migrationBuilder.DropTable(
                name: "RolePermissionChangeRequests");

            migrationBuilder.DropTable(
                name: "TransferItems");

            migrationBuilder.DropTable(
                name: "ProductionBatches");

            migrationBuilder.DropTable(
                name: "MaterialInventories");

            migrationBuilder.DropTable(
                name: "ProductionInventories");

            migrationBuilder.DropTable(
                name: "Transfers");

            migrationBuilder.DropTable(
                name: "ProductionOrders");

            migrationBuilder.DropTable(
                name: "Materials");

            migrationBuilder.DropTable(
                name: "BinLocations");

            migrationBuilder.DropTable(
                name: "BranchRequests");

            migrationBuilder.DropTable(
                name: "ProductVersions");

            migrationBuilder.DropTable(
                name: "Budgets");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Branches");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Regions");
        }
    }
}
