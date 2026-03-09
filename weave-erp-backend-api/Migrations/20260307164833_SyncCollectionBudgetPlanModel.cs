using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class SyncCollectionBudgetPlanModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CollectionBudgetPlan",
                columns: table => new
                {
                    CollectionBudgetPlanID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CollectionID = table.Column<int>(type: "int", nullable: false),
                    BudgetCap = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    ContingencyPercent = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CollectionBudgetPlan", x => x.CollectionBudgetPlanID);
                    table.ForeignKey(
                        name: "FK_CollectionBudgetPlan_Collection_CollectionID",
                        column: x => x.CollectionID,
                        principalTable: "Collection",
                        principalColumn: "CollectionID");
                    table.ForeignKey(
                        name: "FK_CollectionBudgetPlan_User_CreatedByUserID",
                        column: x => x.CreatedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_CollectionBudgetPlan_User_UpdatedByUserID",
                        column: x => x.UpdatedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CollectionBudgetPlan_CollectionID",
                table: "CollectionBudgetPlan",
                column: "CollectionID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CollectionBudgetPlan_CreatedByUserID",
                table: "CollectionBudgetPlan",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_CollectionBudgetPlan_UpdatedByUserID",
                table: "CollectionBudgetPlan",
                column: "UpdatedByUserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CollectionBudgetPlan");
        }
    }
}
