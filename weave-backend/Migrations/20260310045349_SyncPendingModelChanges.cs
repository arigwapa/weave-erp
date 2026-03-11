using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class SyncPendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_User_Branch_BranchID",
                table: "User");

            migrationBuilder.DropIndex(
                name: "IX_User_BranchID",
                table: "User");

            migrationBuilder.DropColumn(
                name: "BranchID",
                table: "User");

            migrationBuilder.AddColumn<string>(
                name: "BranchName",
                table: "ProductionInventory",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BranchName",
                table: "ProductionInventory");

            migrationBuilder.AddColumn<int>(
                name: "BranchID",
                table: "User",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_User_BranchID",
                table: "User",
                column: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_User_Branch_BranchID",
                table: "User",
                column: "BranchID",
                principalTable: "Branch",
                principalColumn: "BranchID");
        }
    }
}
