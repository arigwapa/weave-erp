using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class RefactorBranchWarehouseSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Branch_Region_RegionID')
                    ALTER TABLE [Branch] DROP CONSTRAINT [FK_Branch_Region_RegionID];
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Branch_Region')
                    ALTER TABLE [Branch] DROP CONSTRAINT [FK_Branch_Region];
                DECLARE @dropFkSql nvarchar(max) = N'';
                SELECT @dropFkSql = @dropFkSql + N'ALTER TABLE [Branch] DROP CONSTRAINT [' + fk.name + N'];'
                FROM sys.foreign_keys fk
                INNER JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
                INNER JOIN sys.columns c ON c.object_id = fkc.parent_object_id AND c.column_id = fkc.parent_column_id
                WHERE fk.parent_object_id = OBJECT_ID('Branch') AND c.name = 'RegionID';
                IF LEN(@dropFkSql) > 0 EXEC sp_executesql @dropFkSql;

                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Branch_RegionID' AND object_id = OBJECT_ID('Branch'))
                    DROP INDEX [IX_Branch_RegionID] ON [Branch];
            ");

            migrationBuilder.AddColumn<int>(
                name: "Capacity",
                table: "Branch",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql(@"
                UPDATE [Branch]
                SET [Capacity] = CASE WHEN [Capacity] < 0 THEN 0 WHEN [Capacity] > 100 THEN 100 ELSE [Capacity] END;
            ");

            migrationBuilder.AddColumn<int>(
                name: "WarehouseManagerUserID",
                table: "Branch",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(@"
                IF COL_LENGTH('Branch', 'Location') IS NOT NULL
                    ALTER TABLE [Branch] DROP COLUMN [Location];

                IF COL_LENGTH('Branch', 'RegionID') IS NOT NULL
                    ALTER TABLE [Branch] DROP COLUMN [RegionID];
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Branch_WarehouseManagerUserID",
                table: "Branch",
                column: "WarehouseManagerUserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branch_User_WarehouseManagerUserID",
                table: "Branch",
                column: "WarehouseManagerUserID",
                principalTable: "User",
                principalColumn: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Branch_User_WarehouseManagerUserID",
                table: "Branch");

            migrationBuilder.DropIndex(
                name: "IX_Branch_WarehouseManagerUserID",
                table: "Branch");

            migrationBuilder.DropColumn(
                name: "WarehouseManagerUserID",
                table: "Branch");

            migrationBuilder.DropColumn(
                name: "Capacity",
                table: "Branch");

            migrationBuilder.AddColumn<int>(
                name: "RegionID",
                table: "Branch",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Branch",
                type: "nvarchar(160)",
                maxLength: 160,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Branch_RegionID",
                table: "Branch",
                column: "RegionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branch_Region_RegionID",
                table: "Branch",
                column: "RegionID",
                principalTable: "Region",
                principalColumn: "RegionID");
        }
    }
}
