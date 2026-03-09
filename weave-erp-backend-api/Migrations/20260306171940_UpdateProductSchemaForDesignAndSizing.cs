using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProductSchemaForDesignAndSizing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DECLARE @dropFkSql nvarchar(max) = N'';
                SELECT @dropFkSql = @dropFkSql +
                    N'ALTER TABLE [Product] DROP CONSTRAINT [' + fk.name + N'];'
                FROM sys.foreign_keys fk
                INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
                INNER JOIN sys.columns c ON c.object_id = fkc.parent_object_id AND c.column_id = fkc.parent_column_id
                WHERE fkc.parent_object_id = OBJECT_ID(N'[Product]')
                  AND c.name = 'BranchID';
                IF LEN(@dropFkSql) > 0 EXEC sp_executesql @dropFkSql;

                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Product_Branch_BranchID')
                    ALTER TABLE [Product] DROP CONSTRAINT [FK_Product_Branch_BranchID];
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Products_Branches_BranchID')
                    ALTER TABLE [Product] DROP CONSTRAINT [FK_Products_Branches_BranchID];
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Product_Branch')
                    ALTER TABLE [Product] DROP CONSTRAINT [FK_Product_Branch];
                """
            );

            migrationBuilder.Sql(
                """
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Product_BranchID' AND object_id = OBJECT_ID(N'[Product]'))
                    DROP INDEX [IX_Product_BranchID] ON [Product];
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Products_BranchID' AND object_id = OBJECT_ID(N'[Product]'))
                    DROP INDEX [IX_Products_BranchID] ON [Product];
                """
            );

            migrationBuilder.Sql(
                """
                IF COL_LENGTH('Product', 'BranchID') IS NOT NULL
                    ALTER TABLE [Product] DROP COLUMN [BranchID];
                """
            );

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Product",
                newName: "DesignNotes");

            migrationBuilder.AddColumn<string>(
                name: "ManufacturingInstructions",
                table: "Product",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SizeProfile",
                table: "Product",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "S/M/XL/XXL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ManufacturingInstructions",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "SizeProfile",
                table: "Product");

            migrationBuilder.RenameColumn(
                name: "DesignNotes",
                table: "Product",
                newName: "Description");

            migrationBuilder.AddColumn<int>(
                name: "BranchID",
                table: "Product",
                type: "int",
                nullable: true);
            migrationBuilder.CreateIndex(name: "IX_Product_BranchID", table: "Product", column: "BranchID");
            migrationBuilder.AddForeignKey(name: "FK_Product_Branch_BranchID", table: "Product", column: "BranchID", principalTable: "Branch", principalColumn: "BranchID");
        }
    }
}
