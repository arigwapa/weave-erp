using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class AddQaInspectionWorkflowTablesAndStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "QAStartedAt",
                table: "ProductionBatchBoardItem",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QAStartedByUserID",
                table: "ProductionBatchBoardItem",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QAStatus",
                table: "ProductionBatchBoardItem",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "CAPA",
                columns: table => new
                {
                    CAPAID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InspectionID = table.Column<int>(type: "int", nullable: false),
                    IssueTitle = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    RootCause = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CorrectiveAction = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PreventiveAction = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ResponsibleDepartment = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ResponsibleUserID = table.Column<int>(type: "int", nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CAPA", x => x.CAPAID);
                    table.ForeignKey(
                        name: "FK_CAPA_Inspection_InspectionID",
                        column: x => x.InspectionID,
                        principalTable: "Inspection",
                        principalColumn: "InspectionID");
                    table.ForeignKey(
                        name: "FK_CAPA_User_CreatedByUserID",
                        column: x => x.CreatedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_CAPA_User_ResponsibleUserID",
                        column: x => x.ResponsibleUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_CAPA_User_UpdatedByUserID",
                        column: x => x.UpdatedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "InspectionAttachment",
                columns: table => new
                {
                    InspectionAttachmentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InspectionID = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FileType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    UploadedByUserID = table.Column<int>(type: "int", nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InspectionAttachment", x => x.InspectionAttachmentID);
                    table.ForeignKey(
                        name: "FK_InspectionAttachment_Inspection_InspectionID",
                        column: x => x.InspectionID,
                        principalTable: "Inspection",
                        principalColumn: "InspectionID");
                    table.ForeignKey(
                        name: "FK_InspectionAttachment_User_UploadedByUserID",
                        column: x => x.UploadedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "InspectionChecklistTemplate",
                columns: table => new
                {
                    ChecklistTemplateID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChecklistCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ChecklistName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SequenceNo = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InspectionChecklistTemplate", x => x.ChecklistTemplateID);
                    table.ForeignKey(
                        name: "FK_InspectionChecklistTemplate_User_CreatedByUserID",
                        column: x => x.CreatedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_InspectionChecklistTemplate_User_UpdatedByUserID",
                        column: x => x.UpdatedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "InspectionDefect",
                columns: table => new
                {
                    InspectionDefectID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InspectionID = table.Column<int>(type: "int", nullable: false),
                    DefectType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DefectCategory = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DefectDescription = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    AffectedQuantity = table.Column<int>(type: "int", nullable: false),
                    SeverityScore = table.Column<int>(type: "int", nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InspectionDefect", x => x.InspectionDefectID);
                    table.ForeignKey(
                        name: "FK_InspectionDefect_Inspection_InspectionID",
                        column: x => x.InspectionID,
                        principalTable: "Inspection",
                        principalColumn: "InspectionID");
                    table.ForeignKey(
                        name: "FK_InspectionDefect_User_CreatedByUserID",
                        column: x => x.CreatedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_InspectionDefect_User_UpdatedByUserID",
                        column: x => x.UpdatedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "InspectionChecklistResult",
                columns: table => new
                {
                    ChecklistResultID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InspectionID = table.Column<int>(type: "int", nullable: false),
                    ChecklistTemplateID = table.Column<int>(type: "int", nullable: false),
                    ChecklistStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserID = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InspectionChecklistResult", x => x.ChecklistResultID);
                    table.ForeignKey(
                        name: "FK_InspectionChecklistResult_InspectionChecklistTemplate_ChecklistTemplateID",
                        column: x => x.ChecklistTemplateID,
                        principalTable: "InspectionChecklistTemplate",
                        principalColumn: "ChecklistTemplateID");
                    table.ForeignKey(
                        name: "FK_InspectionChecklistResult_Inspection_InspectionID",
                        column: x => x.InspectionID,
                        principalTable: "Inspection",
                        principalColumn: "InspectionID");
                    table.ForeignKey(
                        name: "FK_InspectionChecklistResult_User_CreatedByUserID",
                        column: x => x.CreatedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_InspectionChecklistResult_User_UpdatedByUserID",
                        column: x => x.UpdatedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                });

            migrationBuilder.InsertData(
                table: "InspectionChecklistTemplate",
                columns: new[] { "ChecklistTemplateID", "Category", "ChecklistCode", "ChecklistName", "CreatedAt", "CreatedByUserID", "IsActive", "IsRequired", "SequenceNo", "UpdatedAt", "UpdatedByUserID" },
                values: new object[,]
                {
                    { 1, "Construction", "CHK-STITCH", "Stitching quality", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 1, null, null },
                    { 2, "Material", "CHK-FABRIC", "Fabric quality", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 2, null, null },
                    { 3, "Visual", "CHK-COLOR", "Color consistency", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 3, null, null },
                    { 4, "Specification", "CHK-MEASURE", "Measurement accuracy", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 4, null, null },
                    { 5, "Trims", "CHK-LABEL", "Label and tag placement", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 5, null, null },
                    { 6, "Trims", "CHK-BUTTON", "Button quality", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 6, null, null },
                    { 7, "Trims", "CHK-ZIPPER", "Zipper functionality", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 7, null, null },
                    { 8, "Decoration", "CHK-PRINT", "Print/embroidery quality", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 8, null, null },
                    { 9, "Finishing", "CHK-CLEAN", "Cleanliness of garment", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 9, null, null },
                    { 10, "Finishing", "CHK-THREAD", "Thread trimming", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 10, null, null },
                    { 11, "Final", "CHK-OVERALL", "Overall appearance", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, true, 11, null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatchBoardItem_QAStartedByUserID",
                table: "ProductionBatchBoardItem",
                column: "QAStartedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_CAPA_CreatedByUserID",
                table: "CAPA",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_CAPA_InspectionID",
                table: "CAPA",
                column: "InspectionID");

            migrationBuilder.CreateIndex(
                name: "IX_CAPA_ResponsibleUserID",
                table: "CAPA",
                column: "ResponsibleUserID");

            migrationBuilder.CreateIndex(
                name: "IX_CAPA_UpdatedByUserID",
                table: "CAPA",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionAttachment_InspectionID",
                table: "InspectionAttachment",
                column: "InspectionID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionAttachment_UploadedByUserID",
                table: "InspectionAttachment",
                column: "UploadedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionChecklistResult_ChecklistTemplateID",
                table: "InspectionChecklistResult",
                column: "ChecklistTemplateID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionChecklistResult_CreatedByUserID",
                table: "InspectionChecklistResult",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionChecklistResult_InspectionID",
                table: "InspectionChecklistResult",
                column: "InspectionID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionChecklistResult_UpdatedByUserID",
                table: "InspectionChecklistResult",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionChecklistTemplate_ChecklistCode",
                table: "InspectionChecklistTemplate",
                column: "ChecklistCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InspectionChecklistTemplate_CreatedByUserID",
                table: "InspectionChecklistTemplate",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionChecklistTemplate_UpdatedByUserID",
                table: "InspectionChecklistTemplate",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionDefect_CreatedByUserID",
                table: "InspectionDefect",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionDefect_InspectionID",
                table: "InspectionDefect",
                column: "InspectionID");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionDefect_UpdatedByUserID",
                table: "InspectionDefect",
                column: "UpdatedByUserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionBatchBoardItem_User_QAStartedByUserID",
                table: "ProductionBatchBoardItem",
                column: "QAStartedByUserID",
                principalTable: "User",
                principalColumn: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductionBatchBoardItem_User_QAStartedByUserID",
                table: "ProductionBatchBoardItem");

            migrationBuilder.DropTable(
                name: "CAPA");

            migrationBuilder.DropTable(
                name: "InspectionAttachment");

            migrationBuilder.DropTable(
                name: "InspectionChecklistResult");

            migrationBuilder.DropTable(
                name: "InspectionDefect");

            migrationBuilder.DropTable(
                name: "InspectionChecklistTemplate");

            migrationBuilder.DropIndex(
                name: "IX_ProductionBatchBoardItem_QAStartedByUserID",
                table: "ProductionBatchBoardItem");

            migrationBuilder.DropColumn(
                name: "QAStartedAt",
                table: "ProductionBatchBoardItem");

            migrationBuilder.DropColumn(
                name: "QAStartedByUserID",
                table: "ProductionBatchBoardItem");

            migrationBuilder.DropColumn(
                name: "QAStatus",
                table: "ProductionBatchBoardItem");
        }
    }
}
