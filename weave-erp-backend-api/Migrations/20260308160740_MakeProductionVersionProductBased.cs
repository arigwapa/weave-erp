using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class MakeProductionVersionProductBased : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProductID",
                table: "ProductionVersion",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE pv
                SET pv.ProductID = TRY_CONVERT(int, JSON_VALUE(po.Products, '$.ProductID'))
                FROM [ProductionVersion] pv
                INNER JOIN [ProductionOrder] po ON po.OrderID = pv.OrderID;

                DELETE FROM [ProductionVersion]
                WHERE ProductID IS NULL
                   OR ProductID <= 0;
            ");

            migrationBuilder.AlterColumn<int>(
                name: "ProductID",
                table: "ProductionVersion",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductionVersion_ProductID_VersionNumber",
                table: "ProductionVersion",
                columns: new[] { "ProductID", "VersionNumber" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionVersion_Product_ProductID",
                table: "ProductionVersion",
                column: "ProductID",
                principalTable: "Product",
                principalColumn: "ProductID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductionVersion_Product_ProductID",
                table: "ProductionVersion");

            migrationBuilder.DropIndex(
                name: "IX_ProductionVersion_ProductID_VersionNumber",
                table: "ProductionVersion");

            migrationBuilder.DropColumn(
                name: "ProductID",
                table: "ProductionVersion");
        }
    }
}
