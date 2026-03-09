using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class RefactorProductionWorkflowToProductBased : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop foreign keys if they exist (using raw SQL for conditional drops)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_BranchRequestItem_ProductVersion_VersionID')
                    ALTER TABLE [BranchRequestItem] DROP CONSTRAINT [FK_BranchRequestItem_ProductVersion_VersionID];
            ");
            
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_BudgetReservation_ProductVersion_VersionID')
                    ALTER TABLE [BudgetReservation] DROP CONSTRAINT [FK_BudgetReservation_ProductVersion_VersionID];
            ");
            
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProductionInventory_ProductVersion_VersionID')
                    ALTER TABLE [ProductionInventory] DROP CONSTRAINT [FK_ProductionInventory_ProductVersion_VersionID];
            ");
            
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProductionOrder_Branch_BranchID')
                    ALTER TABLE [ProductionOrder] DROP CONSTRAINT [FK_ProductionOrder_Branch_BranchID];
            ");
            
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProductionOrder_ProductVersion_VersionID')
                    ALTER TABLE [ProductionOrder] DROP CONSTRAINT [FK_ProductionOrder_ProductVersion_VersionID];
            ");
            
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProductionOrder_User_CreatedByUserID')
                    ALTER TABLE [ProductionOrder] DROP CONSTRAINT [FK_ProductionOrder_User_CreatedByUserID];
            ");
            
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProductionOrder_User_UpdatedByUserID')
                    ALTER TABLE [ProductionOrder] DROP CONSTRAINT [FK_ProductionOrder_User_UpdatedByUserID];
            ");
            
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_TransferItem_ProductVersion_VersionID')
                    ALTER TABLE [TransferItem] DROP CONSTRAINT [FK_TransferItem_ProductVersion_VersionID];
            ");

            // Drop all remaining FK constraints referencing ProductVersion
            migrationBuilder.Sql(@"
                DECLARE @SQL NVARCHAR(MAX) = N'';
                SELECT @SQL = @SQL + 'ALTER TABLE [' + OBJECT_SCHEMA_NAME(parent_object_id) + '].[' + OBJECT_NAME(parent_object_id) + '] DROP CONSTRAINT [' + name + '];' + CHAR(13)
                FROM sys.foreign_keys
                WHERE referenced_object_id = OBJECT_ID('ProductVersion');
                EXEC sp_executesql @SQL;
            ");
            
            // Drop ProductVersion table if it exists
            migrationBuilder.Sql(@"
                IF OBJECT_ID(N'[ProductVersion]', N'U') IS NOT NULL
                    DROP TABLE [ProductVersion];
            ");

            // Drop indexes if they exist
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ProductionOrder_BranchID' AND object_id = OBJECT_ID('ProductionOrder'))
                    DROP INDEX [IX_ProductionOrder_BranchID] ON [ProductionOrder];
            ");
            
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ProductionOrder_CreatedByUserID' AND object_id = OBJECT_ID('ProductionOrder'))
                    DROP INDEX [IX_ProductionOrder_CreatedByUserID] ON [ProductionOrder];
            ");
            
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ProductionOrder_UpdatedByUserID' AND object_id = OBJECT_ID('ProductionOrder'))
                    DROP INDEX [IX_ProductionOrder_UpdatedByUserID] ON [ProductionOrder];
            ");

            // Drop remaining FK on BranchID if it exists
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProductionOrder_Branch')
                    ALTER TABLE [ProductionOrder] DROP CONSTRAINT [FK_ProductionOrder_Branch];
            ");
            
            migrationBuilder.DropColumn(
                name: "BranchID",
                table: "ProductionOrder");

            // Drop remaining FKs on CreatedByUserID and UpdatedByUserID if they exist
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProductionOrder_CreatedByUser')
                    ALTER TABLE [ProductionOrder] DROP CONSTRAINT [FK_ProductionOrder_CreatedByUser];
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProductionOrder_UpdatedByUser')
                    ALTER TABLE [ProductionOrder] DROP CONSTRAINT [FK_ProductionOrder_UpdatedByUser];
            ");

            migrationBuilder.DropColumn(
                name: "CreatedByUserID",
                table: "ProductionOrder");

            migrationBuilder.DropColumn(
                name: "PlannedQty",
                table: "ProductionOrder");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "ProductionOrder");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserID",
                table: "ProductionOrder");

            migrationBuilder.AlterColumn<int>(
                name: "VersionID",
                table: "ProductionOrder",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "CollectionName",
                table: "ProductionOrder",
                type: "nvarchar(180)",
                maxLength: 180,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateOnly>(
                name: "DueDate",
                table: "ProductionOrder",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Products",
                table: "ProductionOrder",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ProductionVersion",
                columns: table => new
                {
                    VersionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VersionNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
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
                    table.ForeignKey(
                        name: "FK_ProductionVersion_Collection_CollectionID",
                        column: x => x.CollectionID,
                        principalTable: "Collection",
                        principalColumn: "CollectionID");
                    table.ForeignKey(
                        name: "FK_ProductionVersion_ProductionOrder_OrderID",
                        column: x => x.OrderID,
                        principalTable: "ProductionOrder",
                        principalColumn: "OrderID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductionVersion_CollectionID",
                table: "ProductionVersion",
                column: "CollectionID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionVersion_OrderID",
                table: "ProductionVersion",
                column: "OrderID");

            // Clean up orphaned data referencing old ProductVersion records
            migrationBuilder.Sql(@"
                DELETE FROM [BranchRequestItem] WHERE VersionID IS NOT NULL;
                DELETE FROM [BudgetReservation] WHERE VersionID IS NOT NULL;
                DELETE FROM [ProductionInventory] WHERE VersionID IS NOT NULL;
                DELETE FROM [TransferItem] WHERE VersionID IS NOT NULL;
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequestItem_ProductionVersion_VersionID",
                table: "BranchRequestItem",
                column: "VersionID",
                principalTable: "ProductionVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetReservation_ProductionVersion_VersionID",
                table: "BudgetReservation",
                column: "VersionID",
                principalTable: "ProductionVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventory_ProductionVersion_VersionID",
                table: "ProductionInventory",
                column: "VersionID",
                principalTable: "ProductionVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrder_ProductionVersion_VersionID",
                table: "ProductionOrder",
                column: "VersionID",
                principalTable: "ProductionVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_TransferItem_ProductionVersion_VersionID",
                table: "TransferItem",
                column: "VersionID",
                principalTable: "ProductionVersion",
                principalColumn: "VersionID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequestItem_ProductionVersion_VersionID",
                table: "BranchRequestItem");

            migrationBuilder.DropForeignKey(
                name: "FK_BudgetReservation_ProductionVersion_VersionID",
                table: "BudgetReservation");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionInventory_ProductionVersion_VersionID",
                table: "ProductionInventory");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionOrder_ProductionVersion_VersionID",
                table: "ProductionOrder");

            migrationBuilder.DropForeignKey(
                name: "FK_TransferItem_ProductionVersion_VersionID",
                table: "TransferItem");

            migrationBuilder.DropTable(
                name: "ProductionVersion");

            migrationBuilder.DropColumn(
                name: "CollectionName",
                table: "ProductionOrder");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "ProductionOrder");

            migrationBuilder.DropColumn(
                name: "Products",
                table: "ProductionOrder");

            migrationBuilder.AlterColumn<int>(
                name: "VersionID",
                table: "ProductionOrder",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BranchID",
                table: "ProductionOrder",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserID",
                table: "ProductionOrder",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PlannedQty",
                table: "ProductionOrder",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateOnly>(
                name: "StartDate",
                table: "ProductionOrder",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<int>(
                name: "UpdatedByUserID",
                table: "ProductionOrder",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProductVersion",
                columns: table => new
                {
                    VersionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApprovalStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    BOMComplete = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    ProductID = table.Column<int>(type: "int", nullable: false),
                    ReleasedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReleasedBudgetID = table.Column<int>(type: "int", nullable: true),
                    StandardLaborCost = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    StandardOverheadCost = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    VersionNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductVersion", x => x.VersionID);
                    table.ForeignKey(
                        name: "FK_ProductVersion_Budget_ReleasedBudgetID",
                        column: x => x.ReleasedBudgetID,
                        principalTable: "Budget",
                        principalColumn: "BudgetID");
                    table.ForeignKey(
                        name: "FK_ProductVersion_Product_ProductID",
                        column: x => x.ProductID,
                        principalTable: "Product",
                        principalColumn: "ProductID");
                    table.ForeignKey(
                        name: "FK_ProductVersion_User_CreatedByUserID",
                        column: x => x.CreatedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_ProductVersion_User_UpdatedByUserID",
                        column: x => x.UpdatedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductionOrder_BranchID",
                table: "ProductionOrder",
                column: "BranchID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionOrder_CreatedByUserID",
                table: "ProductionOrder",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionOrder_UpdatedByUserID",
                table: "ProductionOrder",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVersion_CreatedByUserID",
                table: "ProductVersion",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVersion_ProductID",
                table: "ProductVersion",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVersion_ReleasedBudgetID",
                table: "ProductVersion",
                column: "ReleasedBudgetID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVersion_UpdatedByUserID",
                table: "ProductVersion",
                column: "UpdatedByUserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequestItem_ProductVersion_VersionID",
                table: "BranchRequestItem",
                column: "VersionID",
                principalTable: "ProductVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetReservation_ProductVersion_VersionID",
                table: "BudgetReservation",
                column: "VersionID",
                principalTable: "ProductVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventory_ProductVersion_VersionID",
                table: "ProductionInventory",
                column: "VersionID",
                principalTable: "ProductVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrder_Branch_BranchID",
                table: "ProductionOrder",
                column: "BranchID",
                principalTable: "Branch",
                principalColumn: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrder_ProductVersion_VersionID",
                table: "ProductionOrder",
                column: "VersionID",
                principalTable: "ProductVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrder_User_CreatedByUserID",
                table: "ProductionOrder",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrder_User_UpdatedByUserID",
                table: "ProductionOrder",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_TransferItem_ProductVersion_VersionID",
                table: "TransferItem",
                column: "VersionID",
                principalTable: "ProductVersion",
                principalColumn: "VersionID");
        }
    }
}
