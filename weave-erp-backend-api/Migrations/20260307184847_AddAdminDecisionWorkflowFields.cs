using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminDecisionWorkflowFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminDecision",
                table: "CollectionBudgetPlan",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AdminDecisionAt",
                table: "CollectionBudgetPlan",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdminDecisionReason",
                table: "CollectionBudgetPlan",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "SentToProductManager",
                table: "CollectionBudgetPlan",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "SentToProductionManager",
                table: "CollectionBudgetPlan",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminDecision",
                table: "CollectionBudgetPlan");

            migrationBuilder.DropColumn(
                name: "AdminDecisionAt",
                table: "CollectionBudgetPlan");

            migrationBuilder.DropColumn(
                name: "AdminDecisionReason",
                table: "CollectionBudgetPlan");

            migrationBuilder.DropColumn(
                name: "SentToProductManager",
                table: "CollectionBudgetPlan");

            migrationBuilder.DropColumn(
                name: "SentToProductionManager",
                table: "CollectionBudgetPlan");
        }
    }
}
