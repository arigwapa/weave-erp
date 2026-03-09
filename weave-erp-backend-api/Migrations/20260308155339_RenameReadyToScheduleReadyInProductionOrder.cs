using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class RenameReadyToScheduleReadyInProductionOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE [ProductionOrder]
                SET [Status] = 'Schedule Ready'
                WHERE [Status] = 'Ready';

                IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ProductionOrder_Status')
                    ALTER TABLE [ProductionOrder] DROP CONSTRAINT [CK_ProductionOrder_Status];

                ALTER TABLE [ProductionOrder] WITH CHECK
                ADD CONSTRAINT [CK_ProductionOrder_Status]
                CHECK ([Status] IN ('Pending', 'For Scheduling', 'Schedule Ready', 'Schedule Running', 'Finished Run'));
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE [ProductionOrder]
                SET [Status] = 'Ready'
                WHERE [Status] = 'Schedule Ready';

                IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ProductionOrder_Status')
                    ALTER TABLE [ProductionOrder] DROP CONSTRAINT [CK_ProductionOrder_Status];

                ALTER TABLE [ProductionOrder] WITH CHECK
                ADD CONSTRAINT [CK_ProductionOrder_Status]
                CHECK ([Status] IN ('Pending', 'For Scheduling', 'Ready', 'Schedule Running', 'Finished Run'));
            ");
        }
    }
}
