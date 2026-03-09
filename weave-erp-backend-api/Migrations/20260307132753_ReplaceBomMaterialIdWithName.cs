using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceBomMaterialIdWithName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MaterialName",
                table: "BillOfMaterials",
                type: "nvarchar(180)",
                maxLength: 180,
                nullable: true);

            migrationBuilder.Sql(@"
UPDATE b
SET b.MaterialName = LEFT(ISNULL(m.[Name], 'Unknown Material'), 180)
FROM [BillOfMaterials] b
LEFT JOIN [Material] m ON b.[MaterialID] = m.[MaterialID];
");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_BillOfMaterials_Material_MaterialID')
    ALTER TABLE [BillOfMaterials] DROP CONSTRAINT [FK_BillOfMaterials_Material_MaterialID];
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_BOM_Material')
    ALTER TABLE [BillOfMaterials] DROP CONSTRAINT [FK_BOM_Material];
");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_BillOfMaterials_MaterialID' AND object_id = OBJECT_ID('BillOfMaterials'))
    DROP INDEX [IX_BillOfMaterials_MaterialID] ON [BillOfMaterials];
");

            migrationBuilder.DropColumn(
                name: "MaterialID",
                table: "BillOfMaterials");

            migrationBuilder.AlterColumn<string>(
                name: "MaterialName",
                table: "BillOfMaterials",
                type: "nvarchar(180)",
                maxLength: 180,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(180)",
                oldMaxLength: 180,
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaterialID",
                table: "BillOfMaterials",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(@"
UPDATE b
SET b.MaterialID = ISNULL(m.MaterialID, 0)
FROM [BillOfMaterials] b
LEFT JOIN [Material] m ON m.[Name] = b.[MaterialName];
");

            migrationBuilder.AlterColumn<int>(
                name: "MaterialID",
                table: "BillOfMaterials",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "MaterialName",
                table: "BillOfMaterials");

            migrationBuilder.CreateIndex(
                name: "IX_BillOfMaterials_MaterialID",
                table: "BillOfMaterials",
                column: "MaterialID");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_Material_MaterialID",
                table: "BillOfMaterials",
                column: "MaterialID",
                principalTable: "Material",
                principalColumn: "MaterialID");
        }
    }
}
