using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class LinkInspectionToBatchBoard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Inspection_ProductionBatch_BatchID')
                    ALTER TABLE [Inspection] DROP CONSTRAINT [FK_Inspection_ProductionBatch_BatchID];

                IF COL_LENGTH('Inspection', 'BatchID') IS NOT NULL AND COL_LENGTH('Inspection', 'BatchBoardID') IS NULL
                    EXEC sp_rename 'Inspection.BatchID', 'BatchBoardID', 'COLUMN';

                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Inspection_BatchID' AND object_id = OBJECT_ID('Inspection'))
                    EXEC sp_rename 'Inspection.IX_Inspection_BatchID', 'IX_Inspection_BatchBoardID', 'INDEX';

                IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Inspection_ProductionBatchBoardItem_BatchBoardID')
                    ALTER TABLE [Inspection]
                    ADD CONSTRAINT [FK_Inspection_ProductionBatchBoardItem_BatchBoardID]
                    FOREIGN KEY ([BatchBoardID]) REFERENCES [ProductionBatchBoardItem] ([BatchBoardID]);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Inspection_ProductionBatchBoardItem_BatchBoardID')
                    ALTER TABLE [Inspection] DROP CONSTRAINT [FK_Inspection_ProductionBatchBoardItem_BatchBoardID];

                IF COL_LENGTH('Inspection', 'BatchBoardID') IS NOT NULL AND COL_LENGTH('Inspection', 'BatchID') IS NULL
                    EXEC sp_rename 'Inspection.BatchBoardID', 'BatchID', 'COLUMN';

                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Inspection_BatchBoardID' AND object_id = OBJECT_ID('Inspection'))
                    EXEC sp_rename 'Inspection.IX_Inspection_BatchBoardID', 'IX_Inspection_BatchID', 'INDEX';

                IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Inspection_ProductionBatch_BatchID')
                    ALTER TABLE [Inspection]
                    ADD CONSTRAINT [FK_Inspection_ProductionBatch_BatchID]
                    FOREIGN KEY ([BatchID]) REFERENCES [ProductionBatch] ([BatchID]);
            ");
        }
    }
}
