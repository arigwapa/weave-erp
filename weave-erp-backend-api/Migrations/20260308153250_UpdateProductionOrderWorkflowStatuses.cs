using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProductionOrderWorkflowStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ProductionOrder_Status')
                    ALTER TABLE [ProductionOrder] DROP CONSTRAINT [CK_ProductionOrder_Status];

                UPDATE [ProductionOrder]
                SET [Status] = CASE
                    WHEN [Status] = 'Planned' THEN 'Pending'
                    WHEN [Status] = 'InProgress' THEN 'Schedule Running'
                    WHEN [Status] = 'Paused' THEN 'For Scheduling'
                    WHEN [Status] = 'Completed' THEN 'Finished Run'
                    WHEN [Status] = 'Cancelled' THEN 'Finished Run'
                    ELSE [Status]
                END;

                ALTER TABLE [ProductionOrder] WITH CHECK
                ADD CONSTRAINT [CK_ProductionOrder_Status]
                CHECK ([Status] IN ('Pending', 'For Scheduling', 'Ready', 'Schedule Running', 'Finished Run'));
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ProductionOrder_Status')
                    ALTER TABLE [ProductionOrder] DROP CONSTRAINT [CK_ProductionOrder_Status];

                UPDATE [ProductionOrder]
                SET [Status] = CASE
                    WHEN [Status] = 'Pending' THEN 'Planned'
                    WHEN [Status] = 'For Scheduling' THEN 'Paused'
                    WHEN [Status] = 'Ready' THEN 'Paused'
                    WHEN [Status] = 'Schedule Running' THEN 'InProgress'
                    WHEN [Status] = 'Finished Run' THEN 'Completed'
                    ELSE [Status]
                END;

                ALTER TABLE [ProductionOrder] WITH CHECK
                ADD CONSTRAINT [CK_ProductionOrder_Status]
                CHECK ([Status] IN ('Planned', 'InProgress', 'Paused', 'Completed', 'Cancelled'));
            ");
        }
    }
}
