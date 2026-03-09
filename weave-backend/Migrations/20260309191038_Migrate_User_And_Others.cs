using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class Migrate_User_And_Others : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BinLocation",
                columns: table => new
                {
                    BinID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BinLocationName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BinLocation", x => x.BinID);
                });

            migrationBuilder.CreateTable(
                name: "RunSchedule",
                columns: table => new
                {
                    RunScheduleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ScheduleKey = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CollectionID = table.Column<int>(type: "int", nullable: false),
                    ProductID = table.Column<int>(type: "int", nullable: false),
                    RunCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LineTeam = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    OwnerAssignment = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    StartDate = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    EndDate = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PlannedQty = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Source = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CollectionCode = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CollectionName = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    ProductSKU = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    LinkedVersion = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    SizePlanJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RunSchedule", x => x.RunScheduleID);
                });

            migrationBuilder.CreateTable(
                name: "BillOfMaterials",
                columns: table => new
                {
                    BOMID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductID = table.Column<int>(type: "int", nullable: false),
                    MaterialName = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
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
                name: "Branch",
                columns: table => new
                {
                    BranchID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BranchName = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    WarehouseManagerUserID = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Branch", x => x.BranchID);
                });

            migrationBuilder.CreateTable(
                name: "Budget",
                columns: table => new
                {
                    BudgetID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BudgetCode = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CollectionID = table.Column<int>(type: "int", nullable: true),
                    AppliesToAll = table.Column<bool>(type: "bit", nullable: false),
                    PeriodStart = table.Column<DateOnly>(type: "date", nullable: false),
                    PeriodEnd = table.Column<DateOnly>(type: "date", nullable: false),
                    MaterialsBudget = table.Column<decimal>(type: "decimal(16,2)", precision: 16, scale: 2, nullable: false),
                    WasteAllowanceBudget = table.Column<decimal>(type: "decimal(16,2)", precision: 16, scale: 2, nullable: false),
                    TotalBudget = table.Column<decimal>(type: "decimal(16,2)", precision: 16, scale: 2, nullable: false),
                    ReservedAmount = table.Column<decimal>(type: "decimal(16,2)", precision: 16, scale: 2, nullable: false),
                    SpentAmount = table.Column<decimal>(type: "decimal(16,2)", precision: 16, scale: 2, nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "decimal(16,2)", precision: 16, scale: 2, nullable: false),
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
                    table.PrimaryKey("PK_Budget", x => x.BudgetID);
                });

            migrationBuilder.CreateTable(
                name: "CAPA",
                columns: table => new
                {
                    CAPAID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InspectionID = table.Column<int>(type: "int", nullable: false),
                    IssueTitle = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    RootCause = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CorrectiveAction = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PreventiveAction = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ResponsibleDepartment = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ResponsibleUserID = table.Column<int>(type: "int", nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CAPA", x => x.CAPAID);
                });

            migrationBuilder.CreateTable(
                name: "Collection",
                columns: table => new
                {
                    CollectionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CollectionCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CollectionName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Season = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    TargetLaunchDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Collection", x => x.CollectionID);
                });

            migrationBuilder.CreateTable(
                name: "CollectionBudgetPlan",
                columns: table => new
                {
                    CollectionBudgetPlanID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CollectionID = table.Column<int>(type: "int", nullable: false),
                    BudgetCap = table.Column<decimal>(type: "decimal(16,2)", precision: 16, scale: 2, nullable: false),
                    ContingencyPercent = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    AdminDecision = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    AdminDecisionReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    AdminDecisionAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SentToProductManager = table.Column<bool>(type: "bit", nullable: false),
                    SentToProductionManager = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CollectionBudgetPlan", x => x.CollectionBudgetPlanID);
                    table.ForeignKey(
                        name: "FK_CollectionBudgetPlan_Collection_CollectionID",
                        column: x => x.CollectionID,
                        principalTable: "Collection",
                        principalColumn: "CollectionID");
                });

            migrationBuilder.CreateTable(
                name: "Inspection",
                columns: table => new
                {
                    InspectionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BatchBoardID = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_Inspection", x => x.InspectionID);
                });

            migrationBuilder.CreateTable(
                name: "InspectionChecklistResult",
                columns: table => new
                {
                    ChecklistResultID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InspectionID = table.Column<int>(type: "int", nullable: false),
                    ChecklistTemplateID = table.Column<int>(type: "int", nullable: false),
                    ChecklistStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InspectionChecklistResult", x => x.ChecklistResultID);
                    table.ForeignKey(
                        name: "FK_InspectionChecklistResult_Inspection_InspectionID",
                        column: x => x.InspectionID,
                        principalTable: "Inspection",
                        principalColumn: "InspectionID");
                });

            migrationBuilder.CreateTable(
                name: "InspectionChecklistTemplate",
                columns: table => new
                {
                    ChecklistTemplateID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChecklistCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ChecklistName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SequenceNo = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InspectionChecklistTemplate", x => x.ChecklistTemplateID);
                });

            migrationBuilder.CreateTable(
                name: "InspectionDefect",
                columns: table => new
                {
                    InspectionDefectID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InspectionID = table.Column<int>(type: "int", nullable: false),
                    DefectType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DefectCategory = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DefectDescription = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    AffectedQuantity = table.Column<int>(type: "int", nullable: false),
                    SeverityScore = table.Column<int>(type: "int", nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InspectionDefect", x => x.InspectionDefectID);
                    table.ForeignKey(
                        name: "FK_InspectionDefect_Inspection_InspectionID",
                        column: x => x.InspectionID,
                        principalTable: "Inspection",
                        principalColumn: "InspectionID");
                });

            migrationBuilder.CreateTable(
                name: "Material",
                columns: table => new
                {
                    MaterialID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    UnitCost = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    SupplierName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Material", x => x.MaterialID);
                });

            migrationBuilder.CreateTable(
                name: "Notification",
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
                    table.PrimaryKey("PK_Notification", x => x.NotificationID);
                });

            migrationBuilder.CreateTable(
                name: "Product",
                columns: table => new
                {
                    ProductID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SKU = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DesignNotes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ManufacturingInstructions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SizeProfile = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Season = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ApprovalStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product", x => x.ProductID);
                });

            migrationBuilder.CreateTable(
                name: "ProductionBatchBoardItem",
                columns: table => new
                {
                    BatchBoardID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    OrderID = table.Column<int>(type: "int", nullable: false),
                    VersionNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProductID = table.Column<int>(type: "int", nullable: false),
                    CollectionID = table.Column<int>(type: "int", nullable: false),
                    CollectionCode = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CollectionName = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    ProductSKU = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    RunCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ScheduleKey = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    SourceStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Product = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Version = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Size = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Qty = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    QAStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    QAStartedByUserID = table.Column<int>(type: "int", nullable: true),
                    QAStartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HandoffNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionBatchBoardItem", x => x.BatchBoardID);
                });

            migrationBuilder.CreateTable(
                name: "ProductionInventory",
                columns: table => new
                {
                    ProdInvID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BinID = table.Column<int>(type: "int", nullable: false),
                    VersionID = table.Column<int>(type: "int", nullable: false),
                    CollectionName = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    QuantityOnHand = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ReleaseTag = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    SourceInspectionID = table.Column<int>(type: "int", nullable: true),
                    BatchBoardID = table.Column<int>(type: "int", nullable: true),
                    ProductID = table.Column<int>(type: "int", nullable: true),
                    ReceivedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionInventory", x => x.ProdInvID);
                    table.ForeignKey(
                        name: "FK_ProductionInventory_BinLocation_BinID",
                        column: x => x.BinID,
                        principalTable: "BinLocation",
                        principalColumn: "BinID");
                    table.ForeignKey(
                        name: "FK_ProductionInventory_Inspection_SourceInspectionID",
                        column: x => x.SourceInspectionID,
                        principalTable: "Inspection",
                        principalColumn: "InspectionID");
                    table.ForeignKey(
                        name: "FK_ProductionInventory_Product_ProductID",
                        column: x => x.ProductID,
                        principalTable: "Product",
                        principalColumn: "ProductID");
                    table.ForeignKey(
                        name: "FK_ProductionInventory_ProductionBatchBoardItem_BatchBoardID",
                        column: x => x.BatchBoardID,
                        principalTable: "ProductionBatchBoardItem",
                        principalColumn: "BatchBoardID");
                });

            migrationBuilder.CreateTable(
                name: "ProductionOrder",
                columns: table => new
                {
                    OrderID = table.Column<int>(type: "int", nullable: false),
                    CollectionName = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    VersionNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Products = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionOrder", x => x.OrderID);
                });

            migrationBuilder.CreateTable(
                name: "ProductionVersion",
                columns: table => new
                {
                    VersionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VersionNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProductID = table.Column<int>(type: "int", nullable: false),
                    OrderID = table.Column<int>(type: "int", nullable: false),
                    CollectionID = table.Column<int>(type: "int", nullable: false),
                    CollectionCode = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CollectionName = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionVersion", x => x.VersionID);
                    table.UniqueConstraint("AK_ProductionVersion_OrderID_VersionNumber", x => new { x.OrderID, x.VersionNumber });
                    table.ForeignKey(
                        name: "FK_ProductionVersion_Collection_CollectionID",
                        column: x => x.CollectionID,
                        principalTable: "Collection",
                        principalColumn: "CollectionID");
                    table.ForeignKey(
                        name: "FK_ProductionVersion_Product_ProductID",
                        column: x => x.ProductID,
                        principalTable: "Product",
                        principalColumn: "ProductID");
                    table.ForeignKey(
                        name: "FK_ProductionVersion_ProductionOrder_OrderID",
                        column: x => x.OrderID,
                        principalTable: "ProductionOrder",
                        principalColumn: "OrderID");
                });

            migrationBuilder.CreateTable(
                name: "Role",
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
                    table.PrimaryKey("PK_Role", x => x.RoleID);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BranchID = table.Column<int>(type: "int", nullable: false),
                    RoleID = table.Column<int>(type: "int", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Fullname = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    ContactNumber = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.UserID);
                    table.ForeignKey(
                        name: "FK_User_Branch_BranchID",
                        column: x => x.BranchID,
                        principalTable: "Branch",
                        principalColumn: "BranchID");
                    table.ForeignKey(
                        name: "FK_User_Role_RoleID",
                        column: x => x.RoleID,
                        principalTable: "Role",
                        principalColumn: "RoleID");
                    table.ForeignKey(
                        name: "FK_User_User_CreatedByUserID",
                        column: x => x.CreatedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_User_User_UpdatedByUserID",
                        column: x => x.UpdatedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                });

            migrationBuilder.InsertData(
                table: "InspectionChecklistTemplate",
                columns: new[] { "ChecklistTemplateID", "Category", "ChecklistCode", "ChecklistName", "CreatedAt", "CreatedByUserID", "IsActive", "IsRequired", "SequenceNo", "UpdatedAt", "UpdatedByUserID" },
                values: new object[,]
                {
                    { 1, "Construction", "CHK-STITCH", "Stitching quality", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 1, null, null },
                    { 2, "Material", "CHK-FABRIC", "Fabric quality", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 2, null, null },
                    { 3, "Visual", "CHK-COLOR", "Color consistency", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 3, null, null },
                    { 4, "Specification", "CHK-MEASURE", "Measurement accuracy", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 4, null, null },
                    { 5, "Trims", "CHK-LABEL", "Label and tag placement", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 5, null, null },
                    { 6, "Trims", "CHK-BUTTON", "Button quality", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 6, null, null },
                    { 7, "Trims", "CHK-ZIPPER", "Zipper functionality", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 7, null, null },
                    { 8, "Decoration", "CHK-PRINT", "Print/embroidery quality", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 8, null, null },
                    { 9, "Finishing", "CHK-CLEAN", "Cleanliness of garment", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 9, null, null },
                    { 10, "Finishing", "CHK-THREAD", "Thread trimming", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 10, null, null },
                    { 11, "Final", "CHK-OVERALL", "Overall appearance", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 11, null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_BillOfMaterials_CreatedByUserID",
                table: "BillOfMaterials",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_BillOfMaterials_ProductID",
                table: "BillOfMaterials",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "IX_BillOfMaterials_UpdatedByUserID",
                table: "BillOfMaterials",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_BinLocation_BinLocationName",
                table: "BinLocation",
                column: "BinLocationName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Branch_CreatedByUserID",
                table: "Branch",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Branch_UpdatedByUserID",
                table: "Branch",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Branch_WarehouseManagerUserID",
                table: "Branch",
                column: "WarehouseManagerUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Budget_ApprovedByUserID",
                table: "Budget",
                column: "ApprovedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Budget_BudgetCode",
                table: "Budget",
                column: "BudgetCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Budget_CollectionID",
                table: "Budget",
                column: "CollectionID");

            migrationBuilder.CreateIndex(
                name: "IX_Budget_CreatedByUserID",
                table: "Budget",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Budget_SubmittedByUserID",
                table: "Budget",
                column: "SubmittedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Budget_UpdatedByUserID",
                table: "Budget",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_CAPA_CreatedByUserID",
                table: "CAPA",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_CAPA_InspectionID",
                table: "CAPA",
                column: "InspectionID");

            migrationBuilder.CreateIndex(
                name: "IX_CAPA_ResponsibleUserID",
                table: "CAPA",
                column: "ResponsibleUserID");

            migrationBuilder.CreateIndex(
                name: "IX_CAPA_UpdatedByUserID",
                table: "CAPA",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Collection_CollectionCode",
                table: "Collection",
                column: "CollectionCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Collection_CreatedByUserID",
                table: "Collection",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Collection_UpdatedByUserID",
                table: "Collection",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_CollectionBudgetPlan_CollectionID",
                table: "CollectionBudgetPlan",
                column: "CollectionID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CollectionBudgetPlan_CreatedByUserID",
                table: "CollectionBudgetPlan",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_CollectionBudgetPlan_UpdatedByUserID",
                table: "CollectionBudgetPlan",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Inspection_BatchBoardID",
                table: "Inspection",
                column: "BatchBoardID");

            migrationBuilder.CreateIndex(
                name: "IX_Inspection_CreatedByUserID",
                table: "Inspection",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Inspection_UpdatedByUserID",
                table: "Inspection",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Inspection_UserID",
                table: "Inspection",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionChecklistResult_ChecklistTemplateID",
                table: "InspectionChecklistResult",
                column: "ChecklistTemplateID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionChecklistResult_CreatedByUserID",
                table: "InspectionChecklistResult",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionChecklistResult_InspectionID",
                table: "InspectionChecklistResult",
                column: "InspectionID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionChecklistResult_UpdatedByUserID",
                table: "InspectionChecklistResult",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionChecklistTemplate_ChecklistCode",
                table: "InspectionChecklistTemplate",
                column: "ChecklistCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InspectionChecklistTemplate_CreatedByUserID",
                table: "InspectionChecklistTemplate",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionChecklistTemplate_UpdatedByUserID",
                table: "InspectionChecklistTemplate",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionDefect_CreatedByUserID",
                table: "InspectionDefect",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionDefect_InspectionID",
                table: "InspectionDefect",
                column: "InspectionID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionDefect_UpdatedByUserID",
                table: "InspectionDefect",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Material_CreatedByUserID",
                table: "Material",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Material_UpdatedByUserID",
                table: "Material",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_CreatedByUserID",
                table: "Notification",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_UpdatedByUserID",
                table: "Notification",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_UserID",
                table: "Notification",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Product_CreatedByUserID",
                table: "Product",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Product_SKU",
                table: "Product",
                column: "SKU",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Product_UpdatedByUserID",
                table: "Product",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatchBoardItem_Code",
                table: "ProductionBatchBoardItem",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatchBoardItem_QAStartedByUserID",
                table: "ProductionBatchBoardItem",
                column: "QAStartedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionInventory_BatchBoardID",
                table: "ProductionInventory",
                column: "BatchBoardID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionInventory_BinID",
                table: "ProductionInventory",
                column: "BinID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionInventory_CreatedByUserID",
                table: "ProductionInventory",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionInventory_ProductID",
                table: "ProductionInventory",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionInventory_SourceInspectionID",
                table: "ProductionInventory",
                column: "SourceInspectionID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionInventory_UpdatedByUserID",
                table: "ProductionInventory",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionInventory_VersionID",
                table: "ProductionInventory",
                column: "VersionID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionOrder_OrderID_VersionNumber",
                table: "ProductionOrder",
                columns: new[] { "OrderID", "VersionNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductionVersion_CollectionID",
                table: "ProductionVersion",
                column: "CollectionID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionVersion_OrderID_VersionNumber",
                table: "ProductionVersion",
                columns: new[] { "OrderID", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductionVersion_ProductID_VersionNumber",
                table: "ProductionVersion",
                columns: new[] { "ProductID", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Role_CreatedByUserID",
                table: "Role",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Role_UpdatedByUserID",
                table: "Role",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_RunSchedule_ScheduleKey",
                table: "RunSchedule",
                column: "ScheduleKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_BranchID",
                table: "User",
                column: "BranchID");

            migrationBuilder.CreateIndex(
                name: "IX_User_CreatedByUserID",
                table: "User",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_User_RoleID",
                table: "User",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_User_UpdatedByUserID",
                table: "User",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_User_Username",
                table: "User",
                column: "Username",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_Product_ProductID",
                table: "BillOfMaterials",
                column: "ProductID",
                principalTable: "Product",
                principalColumn: "ProductID");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_User_CreatedByUserID",
                table: "BillOfMaterials",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_User_UpdatedByUserID",
                table: "BillOfMaterials",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branch_User_CreatedByUserID",
                table: "Branch",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branch_User_UpdatedByUserID",
                table: "Branch",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branch_User_WarehouseManagerUserID",
                table: "Branch",
                column: "WarehouseManagerUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budget_Collection_CollectionID",
                table: "Budget",
                column: "CollectionID",
                principalTable: "Collection",
                principalColumn: "CollectionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budget_User_ApprovedByUserID",
                table: "Budget",
                column: "ApprovedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budget_User_CreatedByUserID",
                table: "Budget",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budget_User_SubmittedByUserID",
                table: "Budget",
                column: "SubmittedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budget_User_UpdatedByUserID",
                table: "Budget",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_CAPA_Inspection_InspectionID",
                table: "CAPA",
                column: "InspectionID",
                principalTable: "Inspection",
                principalColumn: "InspectionID");

            migrationBuilder.AddForeignKey(
                name: "FK_CAPA_User_CreatedByUserID",
                table: "CAPA",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_CAPA_User_ResponsibleUserID",
                table: "CAPA",
                column: "ResponsibleUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_CAPA_User_UpdatedByUserID",
                table: "CAPA",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Collection_User_CreatedByUserID",
                table: "Collection",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Collection_User_UpdatedByUserID",
                table: "Collection",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_CollectionBudgetPlan_User_CreatedByUserID",
                table: "CollectionBudgetPlan",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_CollectionBudgetPlan_User_UpdatedByUserID",
                table: "CollectionBudgetPlan",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspection_ProductionBatchBoardItem_BatchBoardID",
                table: "Inspection",
                column: "BatchBoardID",
                principalTable: "ProductionBatchBoardItem",
                principalColumn: "BatchBoardID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspection_User_CreatedByUserID",
                table: "Inspection",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspection_User_UpdatedByUserID",
                table: "Inspection",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspection_User_UserID",
                table: "Inspection",
                column: "UserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_InspectionChecklistResult_InspectionChecklistTemplate_ChecklistTemplateID",
                table: "InspectionChecklistResult",
                column: "ChecklistTemplateID",
                principalTable: "InspectionChecklistTemplate",
                principalColumn: "ChecklistTemplateID");

            migrationBuilder.AddForeignKey(
                name: "FK_InspectionChecklistResult_User_CreatedByUserID",
                table: "InspectionChecklistResult",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_InspectionChecklistResult_User_UpdatedByUserID",
                table: "InspectionChecklistResult",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_InspectionChecklistTemplate_User_CreatedByUserID",
                table: "InspectionChecklistTemplate",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_InspectionChecklistTemplate_User_UpdatedByUserID",
                table: "InspectionChecklistTemplate",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_InspectionDefect_User_CreatedByUserID",
                table: "InspectionDefect",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_InspectionDefect_User_UpdatedByUserID",
                table: "InspectionDefect",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Material_User_CreatedByUserID",
                table: "Material",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Material_User_UpdatedByUserID",
                table: "Material",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_User_CreatedByUserID",
                table: "Notification",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_User_UpdatedByUserID",
                table: "Notification",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_User_UserID",
                table: "Notification",
                column: "UserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_User_CreatedByUserID",
                table: "Product",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_User_UpdatedByUserID",
                table: "Product",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionBatchBoardItem_User_QAStartedByUserID",
                table: "ProductionBatchBoardItem",
                column: "QAStartedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventory_ProductionVersion_VersionID",
                table: "ProductionInventory",
                column: "VersionID",
                principalTable: "ProductionVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventory_User_CreatedByUserID",
                table: "ProductionInventory",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventory_User_UpdatedByUserID",
                table: "ProductionInventory",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrder_ProductionVersion_OrderID_VersionNumber",
                table: "ProductionOrder",
                columns: new[] { "OrderID", "VersionNumber" },
                principalTable: "ProductionVersion",
                principalColumns: new[] { "OrderID", "VersionNumber" });

            migrationBuilder.AddForeignKey(
                name: "FK_Role_User_CreatedByUserID",
                table: "Role",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Role_User_UpdatedByUserID",
                table: "Role",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductionVersion_Product_ProductID",
                table: "ProductionVersion");

            migrationBuilder.DropForeignKey(
                name: "FK_Branch_User_CreatedByUserID",
                table: "Branch");

            migrationBuilder.DropForeignKey(
                name: "FK_Branch_User_UpdatedByUserID",
                table: "Branch");

            migrationBuilder.DropForeignKey(
                name: "FK_Branch_User_WarehouseManagerUserID",
                table: "Branch");

            migrationBuilder.DropForeignKey(
                name: "FK_Collection_User_CreatedByUserID",
                table: "Collection");

            migrationBuilder.DropForeignKey(
                name: "FK_Collection_User_UpdatedByUserID",
                table: "Collection");

            migrationBuilder.DropForeignKey(
                name: "FK_Role_User_CreatedByUserID",
                table: "Role");

            migrationBuilder.DropForeignKey(
                name: "FK_Role_User_UpdatedByUserID",
                table: "Role");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionVersion_Collection_CollectionID",
                table: "ProductionVersion");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionOrder_ProductionVersion_OrderID_VersionNumber",
                table: "ProductionOrder");

            migrationBuilder.DropTable(
                name: "BillOfMaterials");

            migrationBuilder.DropTable(
                name: "Budget");

            migrationBuilder.DropTable(
                name: "CAPA");

            migrationBuilder.DropTable(
                name: "CollectionBudgetPlan");

            migrationBuilder.DropTable(
                name: "InspectionChecklistResult");

            migrationBuilder.DropTable(
                name: "InspectionDefect");

            migrationBuilder.DropTable(
                name: "Material");

            migrationBuilder.DropTable(
                name: "Notification");

            migrationBuilder.DropTable(
                name: "ProductionInventory");

            migrationBuilder.DropTable(
                name: "RunSchedule");

            migrationBuilder.DropTable(
                name: "InspectionChecklistTemplate");

            migrationBuilder.DropTable(
                name: "BinLocation");

            migrationBuilder.DropTable(
                name: "Inspection");

            migrationBuilder.DropTable(
                name: "ProductionBatchBoardItem");

            migrationBuilder.DropTable(
                name: "Product");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "Branch");

            migrationBuilder.DropTable(
                name: "Role");

            migrationBuilder.DropTable(
                name: "Collection");

            migrationBuilder.DropTable(
                name: "ProductionVersion");

            migrationBuilder.DropTable(
                name: "ProductionOrder");
        }
    }
}
