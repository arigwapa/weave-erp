using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveBranchIdFromUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DECLARE @fkName NVARCHAR(128);
                SELECT TOP 1 @fkName = fk.name
                FROM sys.foreign_keys fk
                INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
                INNER JOIN sys.columns c ON c.object_id = fkc.parent_object_id AND c.column_id = fkc.parent_column_id
                INNER JOIN sys.tables t ON t.object_id = c.object_id
                WHERE t.name = 'User' AND c.name = 'BranchID';

                IF @fkName IS NOT NULL
                    EXEC('ALTER TABLE [User] DROP CONSTRAINT [' + @fkName + ']');

                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_User_BranchID' AND object_id = OBJECT_ID('[User]'))
                    DROP INDEX [IX_User_BranchID] ON [User];

                IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('[User]') AND name = 'BranchID')
                    ALTER TABLE [User] DROP COLUMN [BranchID];
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
