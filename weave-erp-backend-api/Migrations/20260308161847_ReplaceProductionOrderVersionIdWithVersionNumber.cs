using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceProductionOrderVersionIdWithVersionNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VersionNumber",
                table: "ProductionOrder",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE po
                SET po.VersionNumber = pv.VersionNumber
                FROM [ProductionOrder] po
                INNER JOIN [ProductionVersion] pv ON pv.VersionID = po.VersionID;
            ");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionOrder_ProductionVersion_VersionID",
                table: "ProductionOrder");

            migrationBuilder.DropIndex(
                name: "IX_ProductionVersion_OrderID",
                table: "ProductionVersion");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ProductionOrder_VersionID' AND object_id = OBJECT_ID('ProductionOrder'))
                    DROP INDEX [IX_ProductionOrder_VersionID] ON [ProductionOrder];
            ");

            migrationBuilder.DropColumn(
                name: "VersionID",
                table: "ProductionOrder");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_ProductionVersion_OrderID_VersionNumber",
                table: "ProductionVersion",
                columns: new[] { "OrderID", "VersionNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductionVersion_OrderID_VersionNumber",
                table: "ProductionVersion",
                columns: new[] { "OrderID", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductionOrder_OrderID_VersionNumber",
                table: "ProductionOrder",
                columns: new[] { "OrderID", "VersionNumber" });

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrder_ProductionVersion_OrderID_VersionNumber",
                table: "ProductionOrder",
                columns: new[] { "OrderID", "VersionNumber" },
                principalTable: "ProductionVersion",
                principalColumns: new[] { "OrderID", "VersionNumber" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductionOrder_ProductionVersion_OrderID_VersionNumber",
                table: "ProductionOrder");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_ProductionVersion_OrderID_VersionNumber",
                table: "ProductionVersion");

            migrationBuilder.DropIndex(
                name: "IX_ProductionVersion_OrderID_VersionNumber",
                table: "ProductionVersion");

            migrationBuilder.DropIndex(
                name: "IX_ProductionOrder_OrderID_VersionNumber",
                table: "ProductionOrder");

            migrationBuilder.AddColumn<int>(
                name: "VersionID",
                table: "ProductionOrder",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE po
                SET po.VersionID = pv.VersionID
                FROM [ProductionOrder] po
                INNER JOIN [ProductionVersion] pv
                    ON pv.OrderID = po.OrderID
                   AND pv.VersionNumber = po.VersionNumber;
            ");

            migrationBuilder.DropColumn(
                name: "VersionNumber",
                table: "ProductionOrder");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionVersion_OrderID",
                table: "ProductionVersion",
                column: "OrderID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionOrder_VersionID",
                table: "ProductionOrder",
                column: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrder_ProductionVersion_VersionID",
                table: "ProductionOrder",
                column: "VersionID",
                principalTable: "ProductionVersion",
                principalColumn: "VersionID");
        }
    }
}
