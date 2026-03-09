using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class AddRunScheduleSqlPersistence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RunSchedule",
                columns: table => new
                {
                    RunScheduleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ScheduleKey = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CollectionID = table.Column<int>(type: "int", nullable: false),
                    ProductID = table.Column<int>(type: "int", nullable: false),
                    RunCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LineTeam = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    OwnerAssignment = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    StartDate = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    EndDate = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PlannedQty = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Source = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CollectionCode = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CollectionName = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    ProductSKU = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    LinkedVersion = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RunSchedule", x => x.RunScheduleID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RunSchedule_ScheduleKey",
                table: "RunSchedule",
                column: "ScheduleKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RunSchedule");
        }
    }
}
