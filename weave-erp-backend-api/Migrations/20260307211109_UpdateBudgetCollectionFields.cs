using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBudgetCollectionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Budget_Region_RegionID')
                    ALTER TABLE [Budget] DROP CONSTRAINT [FK_Budget_Region_RegionID];
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Budget_Region')
                    ALTER TABLE [Budget] DROP CONSTRAINT [FK_Budget_Region];
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Budgets_Region_RegionID')
                    ALTER TABLE [Budget] DROP CONSTRAINT [FK_Budgets_Region_RegionID];
                """
            );

            migrationBuilder.Sql(
                """
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Budget_RegionID' AND object_id = OBJECT_ID('[Budget]'))
                    DROP INDEX [IX_Budget_RegionID] ON [Budget];
                """
            );

            migrationBuilder.AddColumn<int>(
                name: "CollectionID",
                table: "Budget",
                type: "int",
                nullable: true);

            migrationBuilder.DropColumn(
                name: "LaborBudget",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "OverheadBudget",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "RegionID",
                table: "Budget");

            migrationBuilder.CreateIndex(
                name: "IX_Budget_CollectionID",
                table: "Budget",
                column: "CollectionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budget_Collection_CollectionID",
                table: "Budget",
                column: "CollectionID",
                principalTable: "Collection",
                principalColumn: "CollectionID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Budget_Collection_CollectionID",
                table: "Budget");

            migrationBuilder.DropIndex(
                name: "IX_Budget_CollectionID",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "CollectionID",
                table: "Budget");

            migrationBuilder.AddColumn<decimal>(
                name: "LaborBudget",
                table: "Budget",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Budget",
                type: "nvarchar(180)",
                maxLength: 180,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "OverheadBudget",
                table: "Budget",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "RegionID",
                table: "Budget",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Budget_RegionID",
                table: "Budget",
                column: "RegionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budget_Region_RegionID",
                table: "Budget",
                column: "RegionID",
                principalTable: "Region",
                principalColumn: "RegionID");
        }
    }
}
