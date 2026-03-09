using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class AddTraceabilityToProductionBatchBoard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CollectionCode",
                table: "ProductionBatchBoardItem",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CollectionID",
                table: "ProductionBatchBoardItem",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CollectionName",
                table: "ProductionBatchBoardItem",
                type: "nvarchar(180)",
                maxLength: 180,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "OrderID",
                table: "ProductionBatchBoardItem",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ProductID",
                table: "ProductionBatchBoardItem",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ProductSKU",
                table: "ProductionBatchBoardItem",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RunCode",
                table: "ProductionBatchBoardItem",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ScheduleKey",
                table: "ProductionBatchBoardItem",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SourceStatus",
                table: "ProductionBatchBoardItem",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VersionNumber",
                table: "ProductionBatchBoardItem",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CollectionCode",
                table: "ProductionBatchBoardItem");

            migrationBuilder.DropColumn(
                name: "CollectionID",
                table: "ProductionBatchBoardItem");

            migrationBuilder.DropColumn(
                name: "CollectionName",
                table: "ProductionBatchBoardItem");

            migrationBuilder.DropColumn(
                name: "OrderID",
                table: "ProductionBatchBoardItem");

            migrationBuilder.DropColumn(
                name: "ProductID",
                table: "ProductionBatchBoardItem");

            migrationBuilder.DropColumn(
                name: "ProductSKU",
                table: "ProductionBatchBoardItem");

            migrationBuilder.DropColumn(
                name: "RunCode",
                table: "ProductionBatchBoardItem");

            migrationBuilder.DropColumn(
                name: "ScheduleKey",
                table: "ProductionBatchBoardItem");

            migrationBuilder.DropColumn(
                name: "SourceStatus",
                table: "ProductionBatchBoardItem");

            migrationBuilder.DropColumn(
                name: "VersionNumber",
                table: "ProductionBatchBoardItem");
        }
    }
}
