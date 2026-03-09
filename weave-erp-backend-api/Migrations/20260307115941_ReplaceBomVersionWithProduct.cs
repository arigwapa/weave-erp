using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceBomVersionWithProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_BillOfMaterials_ProductVersion_VersionID')
    ALTER TABLE [BillOfMaterials] DROP CONSTRAINT [FK_BillOfMaterials_ProductVersion_VersionID];
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_BillOfMaterials_ProductVersions_VersionID')
    ALTER TABLE [BillOfMaterials] DROP CONSTRAINT [FK_BillOfMaterials_ProductVersions_VersionID];
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_BOM_Version')
    ALTER TABLE [BillOfMaterials] DROP CONSTRAINT [FK_BOM_Version];
");

            migrationBuilder.RenameColumn(
                name: "VersionID",
                table: "BillOfMaterials",
                newName: "ProductID");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_BillOfMaterials_VersionID' AND object_id = OBJECT_ID('BillOfMaterials'))
    EXEC sp_rename 'BillOfMaterials.IX_BillOfMaterials_VersionID', 'IX_BillOfMaterials_ProductID', 'INDEX';
");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_Product_ProductID",
                table: "BillOfMaterials",
                column: "ProductID",
                principalTable: "Product",
                principalColumn: "ProductID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BillOfMaterials_Product_ProductID",
                table: "BillOfMaterials");

            migrationBuilder.RenameColumn(
                name: "ProductID",
                table: "BillOfMaterials",
                newName: "VersionID");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_BillOfMaterials_ProductID' AND object_id = OBJECT_ID('BillOfMaterials'))
    EXEC sp_rename 'BillOfMaterials.IX_BillOfMaterials_ProductID', 'IX_BillOfMaterials_VersionID', 'INDEX';
");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_ProductVersions_VersionID",
                table: "BillOfMaterials",
                column: "VersionID",
                principalTable: "ProductVersions",
                principalColumn: "VersionID");
        }
    }
}
