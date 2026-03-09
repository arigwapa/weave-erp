using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BillOfMaterials_Materials_MaterialID",
                table: "BillOfMaterials");

            migrationBuilder.DropForeignKey(
                name: "FK_BillOfMaterials_ProductVersions_VersionID",
                table: "BillOfMaterials");

            migrationBuilder.DropForeignKey(
                name: "FK_BillOfMaterials_Users_CreatedByUserID",
                table: "BillOfMaterials");

            migrationBuilder.DropForeignKey(
                name: "FK_BillOfMaterials_Users_UpdatedByUserID",
                table: "BillOfMaterials");

            migrationBuilder.DropForeignKey(
                name: "FK_BinLocations_Branches_BranchID",
                table: "BinLocations");

            migrationBuilder.DropForeignKey(
                name: "FK_BinLocations_Users_CreatedByUserID",
                table: "BinLocations");

            migrationBuilder.DropForeignKey(
                name: "FK_BinLocations_Users_UpdatedByUserID",
                table: "BinLocations");

            migrationBuilder.DropForeignKey(
                name: "FK_Branches_Regions_RegionID",
                table: "Branches");

            migrationBuilder.DropForeignKey(
                name: "FK_Branches_Users_CreatedByUserID",
                table: "Branches");

            migrationBuilder.DropForeignKey(
                name: "FK_Branches_Users_UpdatedByUserID",
                table: "Branches");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequestItems_BranchRequests_RequestID",
                table: "BranchRequestItems");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequestItems_ProductVersions_VersionID",
                table: "BranchRequestItems");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequestItems_Users_CreatedByUserID",
                table: "BranchRequestItems");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequestItems_Users_UpdatedByUserID",
                table: "BranchRequestItems");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequests_Branches_BranchID",
                table: "BranchRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequests_Regions_RegionID",
                table: "BranchRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequests_Users_CreatedByUserID",
                table: "BranchRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequests_Users_RequestedByUserID",
                table: "BranchRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequests_Users_UpdatedByUserID",
                table: "BranchRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_BudgetReservations_Budgets_BudgetID",
                table: "BudgetReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_BudgetReservations_ProductVersions_VersionID",
                table: "BudgetReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_BudgetReservations_Users_CreatedByUserID",
                table: "BudgetReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_BudgetReservations_Users_UpdatedByUserID",
                table: "BudgetReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_Budgets_Regions_RegionID",
                table: "Budgets");

            migrationBuilder.DropForeignKey(
                name: "FK_Budgets_Users_ApprovedByUserID",
                table: "Budgets");

            migrationBuilder.DropForeignKey(
                name: "FK_Budgets_Users_CreatedByUserID",
                table: "Budgets");

            migrationBuilder.DropForeignKey(
                name: "FK_Budgets_Users_SubmittedByUserID",
                table: "Budgets");

            migrationBuilder.DropForeignKey(
                name: "FK_Budgets_Users_UpdatedByUserID",
                table: "Budgets");

            migrationBuilder.DropForeignKey(
                name: "FK_Inspections_ProductionBatches_BatchID",
                table: "Inspections");

            migrationBuilder.DropForeignKey(
                name: "FK_Inspections_Users_CreatedByUserID",
                table: "Inspections");

            migrationBuilder.DropForeignKey(
                name: "FK_Inspections_Users_UpdatedByUserID",
                table: "Inspections");

            migrationBuilder.DropForeignKey(
                name: "FK_Inspections_Users_UserID",
                table: "Inspections");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialInventories_BinLocations_BinID",
                table: "MaterialInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialInventories_Materials_MaterialID",
                table: "MaterialInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialInventories_Users_CreatedByUserID",
                table: "MaterialInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialInventories_Users_UpdatedByUserID",
                table: "MaterialInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_Materials_Users_CreatedByUserID",
                table: "Materials");

            migrationBuilder.DropForeignKey(
                name: "FK_Materials_Users_UpdatedByUserID",
                table: "Materials");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialTransactions_MaterialInventories_MatInvID",
                table: "MaterialTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialTransactions_Users_CreatedByUserID",
                table: "MaterialTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialTransactions_Users_UpdatedByUserID",
                table: "MaterialTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialTransactions_Users_UserID",
                table: "MaterialTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Regions_RegionID",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_CreatedByUserID",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_UpdatedByUserID",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_UserID",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionBatches_ProductionOrders_OrderID",
                table: "ProductionBatches");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionBatches_Users_CreatedByUserID",
                table: "ProductionBatches");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionBatches_Users_UpdatedByUserID",
                table: "ProductionBatches");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionInventories_BinLocations_BinID",
                table: "ProductionInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionInventories_ProductVersions_VersionID",
                table: "ProductionInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionInventories_Users_CreatedByUserID",
                table: "ProductionInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionInventories_Users_UpdatedByUserID",
                table: "ProductionInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionOrders_Branches_BranchID",
                table: "ProductionOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionOrders_ProductVersions_VersionID",
                table: "ProductionOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionOrders_Users_CreatedByUserID",
                table: "ProductionOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionOrders_Users_UpdatedByUserID",
                table: "ProductionOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Branches_BranchID",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Users_CreatedByUserID",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Users_UpdatedByUserID",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductTransactions_ProductionInventories_ProdInvID",
                table: "ProductTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductTransactions_Users_CreatedByUserID",
                table: "ProductTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductTransactions_Users_UpdatedByUserID",
                table: "ProductTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductTransactions_Users_UserID",
                table: "ProductTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVersions_Budgets_ReleasedBudgetID",
                table: "ProductVersions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVersions_Products_ProductID",
                table: "ProductVersions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVersions_Users_CreatedByUserID",
                table: "ProductVersions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVersions_Users_UpdatedByUserID",
                table: "ProductVersions");

            migrationBuilder.DropForeignKey(
                name: "FK_Regions_Users_CreatedByUserID",
                table: "Regions");

            migrationBuilder.DropForeignKey(
                name: "FK_Regions_Users_UpdatedByUserID",
                table: "Regions");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissionChangeRequests_Branches_BranchID",
                table: "RolePermissionChangeRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissionChangeRequests_Roles_RoleID",
                table: "RolePermissionChangeRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissionChangeRequests_Users_CreatedByUserID",
                table: "RolePermissionChangeRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissionChangeRequests_Users_RequestedByUserID",
                table: "RolePermissionChangeRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissionChangeRequests_Users_ReviewedByUserID",
                table: "RolePermissionChangeRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissionChangeRequests_Users_UpdatedByUserID",
                table: "RolePermissionChangeRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Roles_Users_CreatedByUserID",
                table: "Roles");

            migrationBuilder.DropForeignKey(
                name: "FK_Roles_Users_UpdatedByUserID",
                table: "Roles");

            migrationBuilder.DropForeignKey(
                name: "FK_TransferItems_ProductVersions_VersionID",
                table: "TransferItems");

            migrationBuilder.DropForeignKey(
                name: "FK_TransferItems_Transfers_TransferID",
                table: "TransferItems");

            migrationBuilder.DropForeignKey(
                name: "FK_TransferItems_Users_CreatedByUserID",
                table: "TransferItems");

            migrationBuilder.DropForeignKey(
                name: "FK_TransferItems_Users_UpdatedByUserID",
                table: "TransferItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Transfers_BinLocations_FromBinID",
                table: "Transfers");

            migrationBuilder.DropForeignKey(
                name: "FK_Transfers_BranchRequests_RequestID",
                table: "Transfers");

            migrationBuilder.DropForeignKey(
                name: "FK_Transfers_Users_CreatedByUserID",
                table: "Transfers");

            migrationBuilder.DropForeignKey(
                name: "FK_Transfers_Users_UpdatedByUserID",
                table: "Transfers");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Branches_BranchID",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Roles_RoleID",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Users_CreatedByUserID",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Users_UpdatedByUserID",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Transfers",
                table: "Transfers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TransferItems",
                table: "TransferItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Roles",
                table: "Roles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RolePermissionChangeRequests",
                table: "RolePermissionChangeRequests");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Regions",
                table: "Regions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductVersions",
                table: "ProductVersions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductTransactions",
                table: "ProductTransactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Products",
                table: "Products");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductionOrders",
                table: "ProductionOrders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductionInventories",
                table: "ProductionInventories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductionBatches",
                table: "ProductionBatches");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MaterialTransactions",
                table: "MaterialTransactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Materials",
                table: "Materials");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MaterialInventories",
                table: "MaterialInventories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Inspections",
                table: "Inspections");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Budgets",
                table: "Budgets");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BudgetReservations",
                table: "BudgetReservations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BranchRequests",
                table: "BranchRequests");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BranchRequestItems",
                table: "BranchRequestItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Branches",
                table: "Branches");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BinLocations",
                table: "BinLocations");

            migrationBuilder.DropColumn(
                name: "Firstname",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Lastname",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Middlename",
                table: "Users");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "User");

            migrationBuilder.RenameTable(
                name: "Transfers",
                newName: "Transfer");

            migrationBuilder.RenameTable(
                name: "TransferItems",
                newName: "TransferItem");

            migrationBuilder.RenameTable(
                name: "Roles",
                newName: "Role");

            migrationBuilder.RenameTable(
                name: "RolePermissionChangeRequests",
                newName: "RolePermissionChangeRequest");

            migrationBuilder.RenameTable(
                name: "Regions",
                newName: "Region");

            migrationBuilder.RenameTable(
                name: "ProductVersions",
                newName: "ProductVersion");

            migrationBuilder.RenameTable(
                name: "ProductTransactions",
                newName: "ProductTransaction");

            migrationBuilder.RenameTable(
                name: "Products",
                newName: "Product");

            migrationBuilder.RenameTable(
                name: "ProductionOrders",
                newName: "ProductionOrder");

            migrationBuilder.RenameTable(
                name: "ProductionInventories",
                newName: "ProductionInventory");

            migrationBuilder.RenameTable(
                name: "ProductionBatches",
                newName: "ProductionBatch");

            migrationBuilder.RenameTable(
                name: "Notifications",
                newName: "Notification");

            migrationBuilder.RenameTable(
                name: "MaterialTransactions",
                newName: "MaterialTransaction");

            migrationBuilder.RenameTable(
                name: "Materials",
                newName: "Material");

            migrationBuilder.RenameTable(
                name: "MaterialInventories",
                newName: "MaterialInventory");

            migrationBuilder.RenameTable(
                name: "Inspections",
                newName: "Inspection");

            migrationBuilder.RenameTable(
                name: "Budgets",
                newName: "Budget");

            migrationBuilder.RenameTable(
                name: "BudgetReservations",
                newName: "BudgetReservation");

            migrationBuilder.RenameTable(
                name: "BranchRequests",
                newName: "BranchRequest");

            migrationBuilder.RenameTable(
                name: "BranchRequestItems",
                newName: "BranchRequestItem");

            migrationBuilder.RenameTable(
                name: "Branches",
                newName: "Branch");

            migrationBuilder.RenameTable(
                name: "BinLocations",
                newName: "BinLocation");

            migrationBuilder.RenameIndex(
                name: "IX_Users_Username",
                table: "User",
                newName: "IX_User_Username");

            migrationBuilder.RenameIndex(
                name: "IX_Users_UpdatedByUserID",
                table: "User",
                newName: "IX_User_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Users_RoleID",
                table: "User",
                newName: "IX_User_RoleID");

            migrationBuilder.RenameIndex(
                name: "IX_Users_CreatedByUserID",
                table: "User",
                newName: "IX_User_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Users_BranchID",
                table: "User",
                newName: "IX_User_BranchID");

            migrationBuilder.RenameIndex(
                name: "IX_Transfers_UpdatedByUserID",
                table: "Transfer",
                newName: "IX_Transfer_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Transfers_RequestID",
                table: "Transfer",
                newName: "IX_Transfer_RequestID");

            migrationBuilder.RenameIndex(
                name: "IX_Transfers_FromBinID",
                table: "Transfer",
                newName: "IX_Transfer_FromBinID");

            migrationBuilder.RenameIndex(
                name: "IX_Transfers_CreatedByUserID",
                table: "Transfer",
                newName: "IX_Transfer_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_TransferItems_VersionID",
                table: "TransferItem",
                newName: "IX_TransferItem_VersionID");

            migrationBuilder.RenameIndex(
                name: "IX_TransferItems_UpdatedByUserID",
                table: "TransferItem",
                newName: "IX_TransferItem_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_TransferItems_TransferID",
                table: "TransferItem",
                newName: "IX_TransferItem_TransferID");

            migrationBuilder.RenameIndex(
                name: "IX_TransferItems_CreatedByUserID",
                table: "TransferItem",
                newName: "IX_TransferItem_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Roles_UpdatedByUserID",
                table: "Role",
                newName: "IX_Role_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Roles_CreatedByUserID",
                table: "Role",
                newName: "IX_Role_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_RolePermissionChangeRequests_UpdatedByUserID",
                table: "RolePermissionChangeRequest",
                newName: "IX_RolePermissionChangeRequest_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_RolePermissionChangeRequests_RoleID",
                table: "RolePermissionChangeRequest",
                newName: "IX_RolePermissionChangeRequest_RoleID");

            migrationBuilder.RenameIndex(
                name: "IX_RolePermissionChangeRequests_ReviewedByUserID",
                table: "RolePermissionChangeRequest",
                newName: "IX_RolePermissionChangeRequest_ReviewedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_RolePermissionChangeRequests_RequestedByUserID",
                table: "RolePermissionChangeRequest",
                newName: "IX_RolePermissionChangeRequest_RequestedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_RolePermissionChangeRequests_CreatedByUserID",
                table: "RolePermissionChangeRequest",
                newName: "IX_RolePermissionChangeRequest_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_RolePermissionChangeRequests_BranchID",
                table: "RolePermissionChangeRequest",
                newName: "IX_RolePermissionChangeRequest_BranchID");

            migrationBuilder.RenameIndex(
                name: "IX_Regions_UpdatedByUserID",
                table: "Region",
                newName: "IX_Region_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Regions_RegionName",
                table: "Region",
                newName: "IX_Region_RegionName");

            migrationBuilder.RenameIndex(
                name: "IX_Regions_CreatedByUserID",
                table: "Region",
                newName: "IX_Region_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductVersions_UpdatedByUserID",
                table: "ProductVersion",
                newName: "IX_ProductVersion_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductVersions_ReleasedBudgetID",
                table: "ProductVersion",
                newName: "IX_ProductVersion_ReleasedBudgetID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductVersions_ProductID",
                table: "ProductVersion",
                newName: "IX_ProductVersion_ProductID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductVersions_CreatedByUserID",
                table: "ProductVersion",
                newName: "IX_ProductVersion_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductTransactions_UserID",
                table: "ProductTransaction",
                newName: "IX_ProductTransaction_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductTransactions_UpdatedByUserID",
                table: "ProductTransaction",
                newName: "IX_ProductTransaction_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductTransactions_ProdInvID",
                table: "ProductTransaction",
                newName: "IX_ProductTransaction_ProdInvID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductTransactions_CreatedByUserID",
                table: "ProductTransaction",
                newName: "IX_ProductTransaction_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Products_UpdatedByUserID",
                table: "Product",
                newName: "IX_Product_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Products_SKU",
                table: "Product",
                newName: "IX_Product_SKU");

            migrationBuilder.RenameIndex(
                name: "IX_Products_CreatedByUserID",
                table: "Product",
                newName: "IX_Product_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Products_BranchID",
                table: "Product",
                newName: "IX_Product_BranchID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionOrders_VersionID",
                table: "ProductionOrder",
                newName: "IX_ProductionOrder_VersionID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionOrders_UpdatedByUserID",
                table: "ProductionOrder",
                newName: "IX_ProductionOrder_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionOrders_CreatedByUserID",
                table: "ProductionOrder",
                newName: "IX_ProductionOrder_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionOrders_BranchID",
                table: "ProductionOrder",
                newName: "IX_ProductionOrder_BranchID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionInventories_VersionID",
                table: "ProductionInventory",
                newName: "IX_ProductionInventory_VersionID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionInventories_UpdatedByUserID",
                table: "ProductionInventory",
                newName: "IX_ProductionInventory_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionInventories_CreatedByUserID",
                table: "ProductionInventory",
                newName: "IX_ProductionInventory_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionInventories_BinID",
                table: "ProductionInventory",
                newName: "IX_ProductionInventory_BinID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionBatches_UpdatedByUserID",
                table: "ProductionBatch",
                newName: "IX_ProductionBatch_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionBatches_OrderID",
                table: "ProductionBatch",
                newName: "IX_ProductionBatch_OrderID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionBatches_CreatedByUserID",
                table: "ProductionBatch",
                newName: "IX_ProductionBatch_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionBatches_BatchNumber",
                table: "ProductionBatch",
                newName: "IX_ProductionBatch_BatchNumber");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_UserID",
                table: "Notification",
                newName: "IX_Notification_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_UpdatedByUserID",
                table: "Notification",
                newName: "IX_Notification_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_RegionID",
                table: "Notification",
                newName: "IX_Notification_RegionID");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_CreatedByUserID",
                table: "Notification",
                newName: "IX_Notification_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialTransactions_UserID",
                table: "MaterialTransaction",
                newName: "IX_MaterialTransaction_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialTransactions_UpdatedByUserID",
                table: "MaterialTransaction",
                newName: "IX_MaterialTransaction_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialTransactions_MatInvID",
                table: "MaterialTransaction",
                newName: "IX_MaterialTransaction_MatInvID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialTransactions_CreatedByUserID",
                table: "MaterialTransaction",
                newName: "IX_MaterialTransaction_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Materials_UpdatedByUserID",
                table: "Material",
                newName: "IX_Material_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Materials_CreatedByUserID",
                table: "Material",
                newName: "IX_Material_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialInventories_UpdatedByUserID",
                table: "MaterialInventory",
                newName: "IX_MaterialInventory_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialInventories_MaterialID",
                table: "MaterialInventory",
                newName: "IX_MaterialInventory_MaterialID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialInventories_CreatedByUserID",
                table: "MaterialInventory",
                newName: "IX_MaterialInventory_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialInventories_BinID",
                table: "MaterialInventory",
                newName: "IX_MaterialInventory_BinID");

            migrationBuilder.RenameIndex(
                name: "IX_Inspections_UserID",
                table: "Inspection",
                newName: "IX_Inspection_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_Inspections_UpdatedByUserID",
                table: "Inspection",
                newName: "IX_Inspection_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Inspections_CreatedByUserID",
                table: "Inspection",
                newName: "IX_Inspection_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Inspections_BatchID",
                table: "Inspection",
                newName: "IX_Inspection_BatchID");

            migrationBuilder.RenameIndex(
                name: "IX_Budgets_UpdatedByUserID",
                table: "Budget",
                newName: "IX_Budget_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Budgets_SubmittedByUserID",
                table: "Budget",
                newName: "IX_Budget_SubmittedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Budgets_RegionID",
                table: "Budget",
                newName: "IX_Budget_RegionID");

            migrationBuilder.RenameIndex(
                name: "IX_Budgets_CreatedByUserID",
                table: "Budget",
                newName: "IX_Budget_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Budgets_BudgetCode",
                table: "Budget",
                newName: "IX_Budget_BudgetCode");

            migrationBuilder.RenameIndex(
                name: "IX_Budgets_ApprovedByUserID",
                table: "Budget",
                newName: "IX_Budget_ApprovedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BudgetReservations_VersionID",
                table: "BudgetReservation",
                newName: "IX_BudgetReservation_VersionID");

            migrationBuilder.RenameIndex(
                name: "IX_BudgetReservations_UpdatedByUserID",
                table: "BudgetReservation",
                newName: "IX_BudgetReservation_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BudgetReservations_CreatedByUserID",
                table: "BudgetReservation",
                newName: "IX_BudgetReservation_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BudgetReservations_BudgetID",
                table: "BudgetReservation",
                newName: "IX_BudgetReservation_BudgetID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequests_UpdatedByUserID",
                table: "BranchRequest",
                newName: "IX_BranchRequest_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequests_RequestedByUserID",
                table: "BranchRequest",
                newName: "IX_BranchRequest_RequestedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequests_RegionID",
                table: "BranchRequest",
                newName: "IX_BranchRequest_RegionID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequests_CreatedByUserID",
                table: "BranchRequest",
                newName: "IX_BranchRequest_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequests_BranchID",
                table: "BranchRequest",
                newName: "IX_BranchRequest_BranchID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequestItems_VersionID",
                table: "BranchRequestItem",
                newName: "IX_BranchRequestItem_VersionID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequestItems_UpdatedByUserID",
                table: "BranchRequestItem",
                newName: "IX_BranchRequestItem_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequestItems_RequestID",
                table: "BranchRequestItem",
                newName: "IX_BranchRequestItem_RequestID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequestItems_CreatedByUserID",
                table: "BranchRequestItem",
                newName: "IX_BranchRequestItem_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Branches_UpdatedByUserID",
                table: "Branch",
                newName: "IX_Branch_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Branches_RegionID",
                table: "Branch",
                newName: "IX_Branch_RegionID");

            migrationBuilder.RenameIndex(
                name: "IX_Branches_CreatedByUserID",
                table: "Branch",
                newName: "IX_Branch_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BinLocations_UpdatedByUserID",
                table: "BinLocation",
                newName: "IX_BinLocation_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BinLocations_CreatedByUserID",
                table: "BinLocation",
                newName: "IX_BinLocation_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BinLocations_BranchID",
                table: "BinLocation",
                newName: "IX_BinLocation_BranchID");

            migrationBuilder.RenameIndex(
                name: "IX_BinLocations_BinCode",
                table: "BinLocation",
                newName: "IX_BinLocation_BinCode");

            migrationBuilder.AddColumn<string>(
                name: "ContactNumber",
                table: "User",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "User",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Fullname",
                table: "User",
                type: "nvarchar(160)",
                maxLength: 160,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_User",
                table: "User",
                column: "UserID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Transfer",
                table: "Transfer",
                column: "TransferID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TransferItem",
                table: "TransferItem",
                column: "TransferItemID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Role",
                table: "Role",
                column: "RoleID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RolePermissionChangeRequest",
                table: "RolePermissionChangeRequest",
                column: "RequestID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Region",
                table: "Region",
                column: "RegionID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductVersion",
                table: "ProductVersion",
                column: "VersionID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductTransaction",
                table: "ProductTransaction",
                column: "ProdTransID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Product",
                table: "Product",
                column: "ProductID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductionOrder",
                table: "ProductionOrder",
                column: "OrderID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductionInventory",
                table: "ProductionInventory",
                column: "ProdInvID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductionBatch",
                table: "ProductionBatch",
                column: "BatchID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notification",
                table: "Notification",
                column: "NotificationID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MaterialTransaction",
                table: "MaterialTransaction",
                column: "MatTransID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Material",
                table: "Material",
                column: "MaterialID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MaterialInventory",
                table: "MaterialInventory",
                column: "MatInvID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Inspection",
                table: "Inspection",
                column: "InspectionID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Budget",
                table: "Budget",
                column: "BudgetID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BudgetReservation",
                table: "BudgetReservation",
                column: "BudgetReservationID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BranchRequest",
                table: "BranchRequest",
                column: "RequestID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BranchRequestItem",
                table: "BranchRequestItem",
                column: "RequestItemID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Branch",
                table: "Branch",
                column: "BranchID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BinLocation",
                table: "BinLocation",
                column: "BinID");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_Material_MaterialID",
                table: "BillOfMaterials",
                column: "MaterialID",
                principalTable: "Material",
                principalColumn: "MaterialID");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_ProductVersion_VersionID",
                table: "BillOfMaterials",
                column: "VersionID",
                principalTable: "ProductVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_User_CreatedByUserID",
                table: "BillOfMaterials",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_User_UpdatedByUserID",
                table: "BillOfMaterials",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BinLocation_Branch_BranchID",
                table: "BinLocation",
                column: "BranchID",
                principalTable: "Branch",
                principalColumn: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_BinLocation_User_CreatedByUserID",
                table: "BinLocation",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BinLocation_User_UpdatedByUserID",
                table: "BinLocation",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branch_Region_RegionID",
                table: "Branch",
                column: "RegionID",
                principalTable: "Region",
                principalColumn: "RegionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branch_User_CreatedByUserID",
                table: "Branch",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branch_User_UpdatedByUserID",
                table: "Branch",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequest_Branch_BranchID",
                table: "BranchRequest",
                column: "BranchID",
                principalTable: "Branch",
                principalColumn: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequest_Region_RegionID",
                table: "BranchRequest",
                column: "RegionID",
                principalTable: "Region",
                principalColumn: "RegionID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequest_User_CreatedByUserID",
                table: "BranchRequest",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequest_User_RequestedByUserID",
                table: "BranchRequest",
                column: "RequestedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequest_User_UpdatedByUserID",
                table: "BranchRequest",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequestItem_BranchRequest_RequestID",
                table: "BranchRequestItem",
                column: "RequestID",
                principalTable: "BranchRequest",
                principalColumn: "RequestID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequestItem_ProductVersion_VersionID",
                table: "BranchRequestItem",
                column: "VersionID",
                principalTable: "ProductVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequestItem_User_CreatedByUserID",
                table: "BranchRequestItem",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequestItem_User_UpdatedByUserID",
                table: "BranchRequestItem",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budget_Region_RegionID",
                table: "Budget",
                column: "RegionID",
                principalTable: "Region",
                principalColumn: "RegionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budget_User_ApprovedByUserID",
                table: "Budget",
                column: "ApprovedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budget_User_CreatedByUserID",
                table: "Budget",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budget_User_SubmittedByUserID",
                table: "Budget",
                column: "SubmittedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budget_User_UpdatedByUserID",
                table: "Budget",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetReservation_Budget_BudgetID",
                table: "BudgetReservation",
                column: "BudgetID",
                principalTable: "Budget",
                principalColumn: "BudgetID");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetReservation_ProductVersion_VersionID",
                table: "BudgetReservation",
                column: "VersionID",
                principalTable: "ProductVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetReservation_User_CreatedByUserID",
                table: "BudgetReservation",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetReservation_User_UpdatedByUserID",
                table: "BudgetReservation",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspection_ProductionBatch_BatchID",
                table: "Inspection",
                column: "BatchID",
                principalTable: "ProductionBatch",
                principalColumn: "BatchID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspection_User_CreatedByUserID",
                table: "Inspection",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspection_User_UpdatedByUserID",
                table: "Inspection",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspection_User_UserID",
                table: "Inspection",
                column: "UserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Material_User_CreatedByUserID",
                table: "Material",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Material_User_UpdatedByUserID",
                table: "Material",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialInventory_BinLocation_BinID",
                table: "MaterialInventory",
                column: "BinID",
                principalTable: "BinLocation",
                principalColumn: "BinID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialInventory_Material_MaterialID",
                table: "MaterialInventory",
                column: "MaterialID",
                principalTable: "Material",
                principalColumn: "MaterialID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialInventory_User_CreatedByUserID",
                table: "MaterialInventory",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialInventory_User_UpdatedByUserID",
                table: "MaterialInventory",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialTransaction_MaterialInventory_MatInvID",
                table: "MaterialTransaction",
                column: "MatInvID",
                principalTable: "MaterialInventory",
                principalColumn: "MatInvID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialTransaction_User_CreatedByUserID",
                table: "MaterialTransaction",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialTransaction_User_UpdatedByUserID",
                table: "MaterialTransaction",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialTransaction_User_UserID",
                table: "MaterialTransaction",
                column: "UserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Region_RegionID",
                table: "Notification",
                column: "RegionID",
                principalTable: "Region",
                principalColumn: "RegionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_User_CreatedByUserID",
                table: "Notification",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_User_UpdatedByUserID",
                table: "Notification",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_User_UserID",
                table: "Notification",
                column: "UserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Branch_BranchID",
                table: "Product",
                column: "BranchID",
                principalTable: "Branch",
                principalColumn: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_User_CreatedByUserID",
                table: "Product",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_User_UpdatedByUserID",
                table: "Product",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionBatch_ProductionOrder_OrderID",
                table: "ProductionBatch",
                column: "OrderID",
                principalTable: "ProductionOrder",
                principalColumn: "OrderID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionBatch_User_CreatedByUserID",
                table: "ProductionBatch",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionBatch_User_UpdatedByUserID",
                table: "ProductionBatch",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventory_BinLocation_BinID",
                table: "ProductionInventory",
                column: "BinID",
                principalTable: "BinLocation",
                principalColumn: "BinID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventory_ProductVersion_VersionID",
                table: "ProductionInventory",
                column: "VersionID",
                principalTable: "ProductVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventory_User_CreatedByUserID",
                table: "ProductionInventory",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventory_User_UpdatedByUserID",
                table: "ProductionInventory",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrder_Branch_BranchID",
                table: "ProductionOrder",
                column: "BranchID",
                principalTable: "Branch",
                principalColumn: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrder_ProductVersion_VersionID",
                table: "ProductionOrder",
                column: "VersionID",
                principalTable: "ProductVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrder_User_CreatedByUserID",
                table: "ProductionOrder",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrder_User_UpdatedByUserID",
                table: "ProductionOrder",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductTransaction_ProductionInventory_ProdInvID",
                table: "ProductTransaction",
                column: "ProdInvID",
                principalTable: "ProductionInventory",
                principalColumn: "ProdInvID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductTransaction_User_CreatedByUserID",
                table: "ProductTransaction",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductTransaction_User_UpdatedByUserID",
                table: "ProductTransaction",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductTransaction_User_UserID",
                table: "ProductTransaction",
                column: "UserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVersion_Budget_ReleasedBudgetID",
                table: "ProductVersion",
                column: "ReleasedBudgetID",
                principalTable: "Budget",
                principalColumn: "BudgetID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVersion_Product_ProductID",
                table: "ProductVersion",
                column: "ProductID",
                principalTable: "Product",
                principalColumn: "ProductID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVersion_User_CreatedByUserID",
                table: "ProductVersion",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVersion_User_UpdatedByUserID",
                table: "ProductVersion",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Region_User_CreatedByUserID",
                table: "Region",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Region_User_UpdatedByUserID",
                table: "Region",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Role_User_CreatedByUserID",
                table: "Role",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Role_User_UpdatedByUserID",
                table: "Role",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequest_Branch_BranchID",
                table: "RolePermissionChangeRequest",
                column: "BranchID",
                principalTable: "Branch",
                principalColumn: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequest_Role_RoleID",
                table: "RolePermissionChangeRequest",
                column: "RoleID",
                principalTable: "Role",
                principalColumn: "RoleID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequest_User_CreatedByUserID",
                table: "RolePermissionChangeRequest",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequest_User_RequestedByUserID",
                table: "RolePermissionChangeRequest",
                column: "RequestedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequest_User_ReviewedByUserID",
                table: "RolePermissionChangeRequest",
                column: "ReviewedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequest_User_UpdatedByUserID",
                table: "RolePermissionChangeRequest",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Transfer_BinLocation_FromBinID",
                table: "Transfer",
                column: "FromBinID",
                principalTable: "BinLocation",
                principalColumn: "BinID");

            migrationBuilder.AddForeignKey(
                name: "FK_Transfer_BranchRequest_RequestID",
                table: "Transfer",
                column: "RequestID",
                principalTable: "BranchRequest",
                principalColumn: "RequestID");

            migrationBuilder.AddForeignKey(
                name: "FK_Transfer_User_CreatedByUserID",
                table: "Transfer",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Transfer_User_UpdatedByUserID",
                table: "Transfer",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_TransferItem_ProductVersion_VersionID",
                table: "TransferItem",
                column: "VersionID",
                principalTable: "ProductVersion",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_TransferItem_Transfer_TransferID",
                table: "TransferItem",
                column: "TransferID",
                principalTable: "Transfer",
                principalColumn: "TransferID");

            migrationBuilder.AddForeignKey(
                name: "FK_TransferItem_User_CreatedByUserID",
                table: "TransferItem",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_TransferItem_User_UpdatedByUserID",
                table: "TransferItem",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_User_Branch_BranchID",
                table: "User",
                column: "BranchID",
                principalTable: "Branch",
                principalColumn: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_User_Role_RoleID",
                table: "User",
                column: "RoleID",
                principalTable: "Role",
                principalColumn: "RoleID");

            migrationBuilder.AddForeignKey(
                name: "FK_User_User_CreatedByUserID",
                table: "User",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_User_User_UpdatedByUserID",
                table: "User",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BillOfMaterials_Material_MaterialID",
                table: "BillOfMaterials");

            migrationBuilder.DropForeignKey(
                name: "FK_BillOfMaterials_ProductVersion_VersionID",
                table: "BillOfMaterials");

            migrationBuilder.DropForeignKey(
                name: "FK_BillOfMaterials_User_CreatedByUserID",
                table: "BillOfMaterials");

            migrationBuilder.DropForeignKey(
                name: "FK_BillOfMaterials_User_UpdatedByUserID",
                table: "BillOfMaterials");

            migrationBuilder.DropForeignKey(
                name: "FK_BinLocation_Branch_BranchID",
                table: "BinLocation");

            migrationBuilder.DropForeignKey(
                name: "FK_BinLocation_User_CreatedByUserID",
                table: "BinLocation");

            migrationBuilder.DropForeignKey(
                name: "FK_BinLocation_User_UpdatedByUserID",
                table: "BinLocation");

            migrationBuilder.DropForeignKey(
                name: "FK_Branch_Region_RegionID",
                table: "Branch");

            migrationBuilder.DropForeignKey(
                name: "FK_Branch_User_CreatedByUserID",
                table: "Branch");

            migrationBuilder.DropForeignKey(
                name: "FK_Branch_User_UpdatedByUserID",
                table: "Branch");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequest_Branch_BranchID",
                table: "BranchRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequest_Region_RegionID",
                table: "BranchRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequest_User_CreatedByUserID",
                table: "BranchRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequest_User_RequestedByUserID",
                table: "BranchRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequest_User_UpdatedByUserID",
                table: "BranchRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequestItem_BranchRequest_RequestID",
                table: "BranchRequestItem");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequestItem_ProductVersion_VersionID",
                table: "BranchRequestItem");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequestItem_User_CreatedByUserID",
                table: "BranchRequestItem");

            migrationBuilder.DropForeignKey(
                name: "FK_BranchRequestItem_User_UpdatedByUserID",
                table: "BranchRequestItem");

            migrationBuilder.DropForeignKey(
                name: "FK_Budget_Region_RegionID",
                table: "Budget");

            migrationBuilder.DropForeignKey(
                name: "FK_Budget_User_ApprovedByUserID",
                table: "Budget");

            migrationBuilder.DropForeignKey(
                name: "FK_Budget_User_CreatedByUserID",
                table: "Budget");

            migrationBuilder.DropForeignKey(
                name: "FK_Budget_User_SubmittedByUserID",
                table: "Budget");

            migrationBuilder.DropForeignKey(
                name: "FK_Budget_User_UpdatedByUserID",
                table: "Budget");

            migrationBuilder.DropForeignKey(
                name: "FK_BudgetReservation_Budget_BudgetID",
                table: "BudgetReservation");

            migrationBuilder.DropForeignKey(
                name: "FK_BudgetReservation_ProductVersion_VersionID",
                table: "BudgetReservation");

            migrationBuilder.DropForeignKey(
                name: "FK_BudgetReservation_User_CreatedByUserID",
                table: "BudgetReservation");

            migrationBuilder.DropForeignKey(
                name: "FK_BudgetReservation_User_UpdatedByUserID",
                table: "BudgetReservation");

            migrationBuilder.DropForeignKey(
                name: "FK_Inspection_ProductionBatch_BatchID",
                table: "Inspection");

            migrationBuilder.DropForeignKey(
                name: "FK_Inspection_User_CreatedByUserID",
                table: "Inspection");

            migrationBuilder.DropForeignKey(
                name: "FK_Inspection_User_UpdatedByUserID",
                table: "Inspection");

            migrationBuilder.DropForeignKey(
                name: "FK_Inspection_User_UserID",
                table: "Inspection");

            migrationBuilder.DropForeignKey(
                name: "FK_Material_User_CreatedByUserID",
                table: "Material");

            migrationBuilder.DropForeignKey(
                name: "FK_Material_User_UpdatedByUserID",
                table: "Material");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialInventory_BinLocation_BinID",
                table: "MaterialInventory");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialInventory_Material_MaterialID",
                table: "MaterialInventory");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialInventory_User_CreatedByUserID",
                table: "MaterialInventory");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialInventory_User_UpdatedByUserID",
                table: "MaterialInventory");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialTransaction_MaterialInventory_MatInvID",
                table: "MaterialTransaction");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialTransaction_User_CreatedByUserID",
                table: "MaterialTransaction");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialTransaction_User_UpdatedByUserID",
                table: "MaterialTransaction");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialTransaction_User_UserID",
                table: "MaterialTransaction");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Region_RegionID",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_User_CreatedByUserID",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_User_UpdatedByUserID",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_User_UserID",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_Branch_BranchID",
                table: "Product");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_User_CreatedByUserID",
                table: "Product");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_User_UpdatedByUserID",
                table: "Product");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionBatch_ProductionOrder_OrderID",
                table: "ProductionBatch");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionBatch_User_CreatedByUserID",
                table: "ProductionBatch");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionBatch_User_UpdatedByUserID",
                table: "ProductionBatch");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionInventory_BinLocation_BinID",
                table: "ProductionInventory");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionInventory_ProductVersion_VersionID",
                table: "ProductionInventory");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionInventory_User_CreatedByUserID",
                table: "ProductionInventory");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionInventory_User_UpdatedByUserID",
                table: "ProductionInventory");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionOrder_Branch_BranchID",
                table: "ProductionOrder");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionOrder_ProductVersion_VersionID",
                table: "ProductionOrder");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionOrder_User_CreatedByUserID",
                table: "ProductionOrder");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionOrder_User_UpdatedByUserID",
                table: "ProductionOrder");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductTransaction_ProductionInventory_ProdInvID",
                table: "ProductTransaction");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductTransaction_User_CreatedByUserID",
                table: "ProductTransaction");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductTransaction_User_UpdatedByUserID",
                table: "ProductTransaction");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductTransaction_User_UserID",
                table: "ProductTransaction");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVersion_Budget_ReleasedBudgetID",
                table: "ProductVersion");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVersion_Product_ProductID",
                table: "ProductVersion");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVersion_User_CreatedByUserID",
                table: "ProductVersion");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVersion_User_UpdatedByUserID",
                table: "ProductVersion");

            migrationBuilder.DropForeignKey(
                name: "FK_Region_User_CreatedByUserID",
                table: "Region");

            migrationBuilder.DropForeignKey(
                name: "FK_Region_User_UpdatedByUserID",
                table: "Region");

            migrationBuilder.DropForeignKey(
                name: "FK_Role_User_CreatedByUserID",
                table: "Role");

            migrationBuilder.DropForeignKey(
                name: "FK_Role_User_UpdatedByUserID",
                table: "Role");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissionChangeRequest_Branch_BranchID",
                table: "RolePermissionChangeRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissionChangeRequest_Role_RoleID",
                table: "RolePermissionChangeRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissionChangeRequest_User_CreatedByUserID",
                table: "RolePermissionChangeRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissionChangeRequest_User_RequestedByUserID",
                table: "RolePermissionChangeRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissionChangeRequest_User_ReviewedByUserID",
                table: "RolePermissionChangeRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissionChangeRequest_User_UpdatedByUserID",
                table: "RolePermissionChangeRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_Transfer_BinLocation_FromBinID",
                table: "Transfer");

            migrationBuilder.DropForeignKey(
                name: "FK_Transfer_BranchRequest_RequestID",
                table: "Transfer");

            migrationBuilder.DropForeignKey(
                name: "FK_Transfer_User_CreatedByUserID",
                table: "Transfer");

            migrationBuilder.DropForeignKey(
                name: "FK_Transfer_User_UpdatedByUserID",
                table: "Transfer");

            migrationBuilder.DropForeignKey(
                name: "FK_TransferItem_ProductVersion_VersionID",
                table: "TransferItem");

            migrationBuilder.DropForeignKey(
                name: "FK_TransferItem_Transfer_TransferID",
                table: "TransferItem");

            migrationBuilder.DropForeignKey(
                name: "FK_TransferItem_User_CreatedByUserID",
                table: "TransferItem");

            migrationBuilder.DropForeignKey(
                name: "FK_TransferItem_User_UpdatedByUserID",
                table: "TransferItem");

            migrationBuilder.DropForeignKey(
                name: "FK_User_Branch_BranchID",
                table: "User");

            migrationBuilder.DropForeignKey(
                name: "FK_User_Role_RoleID",
                table: "User");

            migrationBuilder.DropForeignKey(
                name: "FK_User_User_CreatedByUserID",
                table: "User");

            migrationBuilder.DropForeignKey(
                name: "FK_User_User_UpdatedByUserID",
                table: "User");

            migrationBuilder.DropPrimaryKey(
                name: "PK_User",
                table: "User");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TransferItem",
                table: "TransferItem");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Transfer",
                table: "Transfer");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RolePermissionChangeRequest",
                table: "RolePermissionChangeRequest");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Role",
                table: "Role");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Region",
                table: "Region");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductVersion",
                table: "ProductVersion");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductTransaction",
                table: "ProductTransaction");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductionOrder",
                table: "ProductionOrder");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductionInventory",
                table: "ProductionInventory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductionBatch",
                table: "ProductionBatch");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Product",
                table: "Product");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notification",
                table: "Notification");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MaterialTransaction",
                table: "MaterialTransaction");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MaterialInventory",
                table: "MaterialInventory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Material",
                table: "Material");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Inspection",
                table: "Inspection");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BudgetReservation",
                table: "BudgetReservation");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Budget",
                table: "Budget");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BranchRequestItem",
                table: "BranchRequestItem");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BranchRequest",
                table: "BranchRequest");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Branch",
                table: "Branch");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BinLocation",
                table: "BinLocation");

            migrationBuilder.DropColumn(
                name: "ContactNumber",
                table: "User");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "User");

            migrationBuilder.DropColumn(
                name: "Fullname",
                table: "User");

            migrationBuilder.RenameTable(
                name: "User",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "TransferItem",
                newName: "TransferItems");

            migrationBuilder.RenameTable(
                name: "Transfer",
                newName: "Transfers");

            migrationBuilder.RenameTable(
                name: "RolePermissionChangeRequest",
                newName: "RolePermissionChangeRequests");

            migrationBuilder.RenameTable(
                name: "Role",
                newName: "Roles");

            migrationBuilder.RenameTable(
                name: "Region",
                newName: "Regions");

            migrationBuilder.RenameTable(
                name: "ProductVersion",
                newName: "ProductVersions");

            migrationBuilder.RenameTable(
                name: "ProductTransaction",
                newName: "ProductTransactions");

            migrationBuilder.RenameTable(
                name: "ProductionOrder",
                newName: "ProductionOrders");

            migrationBuilder.RenameTable(
                name: "ProductionInventory",
                newName: "ProductionInventories");

            migrationBuilder.RenameTable(
                name: "ProductionBatch",
                newName: "ProductionBatches");

            migrationBuilder.RenameTable(
                name: "Product",
                newName: "Products");

            migrationBuilder.RenameTable(
                name: "Notification",
                newName: "Notifications");

            migrationBuilder.RenameTable(
                name: "MaterialTransaction",
                newName: "MaterialTransactions");

            migrationBuilder.RenameTable(
                name: "MaterialInventory",
                newName: "MaterialInventories");

            migrationBuilder.RenameTable(
                name: "Material",
                newName: "Materials");

            migrationBuilder.RenameTable(
                name: "Inspection",
                newName: "Inspections");

            migrationBuilder.RenameTable(
                name: "BudgetReservation",
                newName: "BudgetReservations");

            migrationBuilder.RenameTable(
                name: "Budget",
                newName: "Budgets");

            migrationBuilder.RenameTable(
                name: "BranchRequestItem",
                newName: "BranchRequestItems");

            migrationBuilder.RenameTable(
                name: "BranchRequest",
                newName: "BranchRequests");

            migrationBuilder.RenameTable(
                name: "Branch",
                newName: "Branches");

            migrationBuilder.RenameTable(
                name: "BinLocation",
                newName: "BinLocations");

            migrationBuilder.RenameIndex(
                name: "IX_User_Username",
                table: "Users",
                newName: "IX_Users_Username");

            migrationBuilder.RenameIndex(
                name: "IX_User_UpdatedByUserID",
                table: "Users",
                newName: "IX_Users_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_User_RoleID",
                table: "Users",
                newName: "IX_Users_RoleID");

            migrationBuilder.RenameIndex(
                name: "IX_User_CreatedByUserID",
                table: "Users",
                newName: "IX_Users_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_User_BranchID",
                table: "Users",
                newName: "IX_Users_BranchID");

            migrationBuilder.RenameIndex(
                name: "IX_TransferItem_VersionID",
                table: "TransferItems",
                newName: "IX_TransferItems_VersionID");

            migrationBuilder.RenameIndex(
                name: "IX_TransferItem_UpdatedByUserID",
                table: "TransferItems",
                newName: "IX_TransferItems_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_TransferItem_TransferID",
                table: "TransferItems",
                newName: "IX_TransferItems_TransferID");

            migrationBuilder.RenameIndex(
                name: "IX_TransferItem_CreatedByUserID",
                table: "TransferItems",
                newName: "IX_TransferItems_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Transfer_UpdatedByUserID",
                table: "Transfers",
                newName: "IX_Transfers_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Transfer_RequestID",
                table: "Transfers",
                newName: "IX_Transfers_RequestID");

            migrationBuilder.RenameIndex(
                name: "IX_Transfer_FromBinID",
                table: "Transfers",
                newName: "IX_Transfers_FromBinID");

            migrationBuilder.RenameIndex(
                name: "IX_Transfer_CreatedByUserID",
                table: "Transfers",
                newName: "IX_Transfers_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_RolePermissionChangeRequest_UpdatedByUserID",
                table: "RolePermissionChangeRequests",
                newName: "IX_RolePermissionChangeRequests_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_RolePermissionChangeRequest_RoleID",
                table: "RolePermissionChangeRequests",
                newName: "IX_RolePermissionChangeRequests_RoleID");

            migrationBuilder.RenameIndex(
                name: "IX_RolePermissionChangeRequest_ReviewedByUserID",
                table: "RolePermissionChangeRequests",
                newName: "IX_RolePermissionChangeRequests_ReviewedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_RolePermissionChangeRequest_RequestedByUserID",
                table: "RolePermissionChangeRequests",
                newName: "IX_RolePermissionChangeRequests_RequestedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_RolePermissionChangeRequest_CreatedByUserID",
                table: "RolePermissionChangeRequests",
                newName: "IX_RolePermissionChangeRequests_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_RolePermissionChangeRequest_BranchID",
                table: "RolePermissionChangeRequests",
                newName: "IX_RolePermissionChangeRequests_BranchID");

            migrationBuilder.RenameIndex(
                name: "IX_Role_UpdatedByUserID",
                table: "Roles",
                newName: "IX_Roles_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Role_CreatedByUserID",
                table: "Roles",
                newName: "IX_Roles_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Region_UpdatedByUserID",
                table: "Regions",
                newName: "IX_Regions_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Region_RegionName",
                table: "Regions",
                newName: "IX_Regions_RegionName");

            migrationBuilder.RenameIndex(
                name: "IX_Region_CreatedByUserID",
                table: "Regions",
                newName: "IX_Regions_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductVersion_UpdatedByUserID",
                table: "ProductVersions",
                newName: "IX_ProductVersions_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductVersion_ReleasedBudgetID",
                table: "ProductVersions",
                newName: "IX_ProductVersions_ReleasedBudgetID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductVersion_ProductID",
                table: "ProductVersions",
                newName: "IX_ProductVersions_ProductID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductVersion_CreatedByUserID",
                table: "ProductVersions",
                newName: "IX_ProductVersions_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductTransaction_UserID",
                table: "ProductTransactions",
                newName: "IX_ProductTransactions_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductTransaction_UpdatedByUserID",
                table: "ProductTransactions",
                newName: "IX_ProductTransactions_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductTransaction_ProdInvID",
                table: "ProductTransactions",
                newName: "IX_ProductTransactions_ProdInvID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductTransaction_CreatedByUserID",
                table: "ProductTransactions",
                newName: "IX_ProductTransactions_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionOrder_VersionID",
                table: "ProductionOrders",
                newName: "IX_ProductionOrders_VersionID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionOrder_UpdatedByUserID",
                table: "ProductionOrders",
                newName: "IX_ProductionOrders_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionOrder_CreatedByUserID",
                table: "ProductionOrders",
                newName: "IX_ProductionOrders_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionOrder_BranchID",
                table: "ProductionOrders",
                newName: "IX_ProductionOrders_BranchID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionInventory_VersionID",
                table: "ProductionInventories",
                newName: "IX_ProductionInventories_VersionID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionInventory_UpdatedByUserID",
                table: "ProductionInventories",
                newName: "IX_ProductionInventories_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionInventory_CreatedByUserID",
                table: "ProductionInventories",
                newName: "IX_ProductionInventories_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionInventory_BinID",
                table: "ProductionInventories",
                newName: "IX_ProductionInventories_BinID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionBatch_UpdatedByUserID",
                table: "ProductionBatches",
                newName: "IX_ProductionBatches_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionBatch_OrderID",
                table: "ProductionBatches",
                newName: "IX_ProductionBatches_OrderID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionBatch_CreatedByUserID",
                table: "ProductionBatches",
                newName: "IX_ProductionBatches_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionBatch_BatchNumber",
                table: "ProductionBatches",
                newName: "IX_ProductionBatches_BatchNumber");

            migrationBuilder.RenameIndex(
                name: "IX_Product_UpdatedByUserID",
                table: "Products",
                newName: "IX_Products_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Product_SKU",
                table: "Products",
                newName: "IX_Products_SKU");

            migrationBuilder.RenameIndex(
                name: "IX_Product_CreatedByUserID",
                table: "Products",
                newName: "IX_Products_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Product_BranchID",
                table: "Products",
                newName: "IX_Products_BranchID");

            migrationBuilder.RenameIndex(
                name: "IX_Notification_UserID",
                table: "Notifications",
                newName: "IX_Notifications_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_Notification_UpdatedByUserID",
                table: "Notifications",
                newName: "IX_Notifications_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Notification_RegionID",
                table: "Notifications",
                newName: "IX_Notifications_RegionID");

            migrationBuilder.RenameIndex(
                name: "IX_Notification_CreatedByUserID",
                table: "Notifications",
                newName: "IX_Notifications_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialTransaction_UserID",
                table: "MaterialTransactions",
                newName: "IX_MaterialTransactions_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialTransaction_UpdatedByUserID",
                table: "MaterialTransactions",
                newName: "IX_MaterialTransactions_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialTransaction_MatInvID",
                table: "MaterialTransactions",
                newName: "IX_MaterialTransactions_MatInvID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialTransaction_CreatedByUserID",
                table: "MaterialTransactions",
                newName: "IX_MaterialTransactions_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialInventory_UpdatedByUserID",
                table: "MaterialInventories",
                newName: "IX_MaterialInventories_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialInventory_MaterialID",
                table: "MaterialInventories",
                newName: "IX_MaterialInventories_MaterialID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialInventory_CreatedByUserID",
                table: "MaterialInventories",
                newName: "IX_MaterialInventories_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialInventory_BinID",
                table: "MaterialInventories",
                newName: "IX_MaterialInventories_BinID");

            migrationBuilder.RenameIndex(
                name: "IX_Material_UpdatedByUserID",
                table: "Materials",
                newName: "IX_Materials_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Material_CreatedByUserID",
                table: "Materials",
                newName: "IX_Materials_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Inspection_UserID",
                table: "Inspections",
                newName: "IX_Inspections_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_Inspection_UpdatedByUserID",
                table: "Inspections",
                newName: "IX_Inspections_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Inspection_CreatedByUserID",
                table: "Inspections",
                newName: "IX_Inspections_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Inspection_BatchID",
                table: "Inspections",
                newName: "IX_Inspections_BatchID");

            migrationBuilder.RenameIndex(
                name: "IX_BudgetReservation_VersionID",
                table: "BudgetReservations",
                newName: "IX_BudgetReservations_VersionID");

            migrationBuilder.RenameIndex(
                name: "IX_BudgetReservation_UpdatedByUserID",
                table: "BudgetReservations",
                newName: "IX_BudgetReservations_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BudgetReservation_CreatedByUserID",
                table: "BudgetReservations",
                newName: "IX_BudgetReservations_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BudgetReservation_BudgetID",
                table: "BudgetReservations",
                newName: "IX_BudgetReservations_BudgetID");

            migrationBuilder.RenameIndex(
                name: "IX_Budget_UpdatedByUserID",
                table: "Budgets",
                newName: "IX_Budgets_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Budget_SubmittedByUserID",
                table: "Budgets",
                newName: "IX_Budgets_SubmittedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Budget_RegionID",
                table: "Budgets",
                newName: "IX_Budgets_RegionID");

            migrationBuilder.RenameIndex(
                name: "IX_Budget_CreatedByUserID",
                table: "Budgets",
                newName: "IX_Budgets_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Budget_BudgetCode",
                table: "Budgets",
                newName: "IX_Budgets_BudgetCode");

            migrationBuilder.RenameIndex(
                name: "IX_Budget_ApprovedByUserID",
                table: "Budgets",
                newName: "IX_Budgets_ApprovedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequestItem_VersionID",
                table: "BranchRequestItems",
                newName: "IX_BranchRequestItems_VersionID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequestItem_UpdatedByUserID",
                table: "BranchRequestItems",
                newName: "IX_BranchRequestItems_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequestItem_RequestID",
                table: "BranchRequestItems",
                newName: "IX_BranchRequestItems_RequestID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequestItem_CreatedByUserID",
                table: "BranchRequestItems",
                newName: "IX_BranchRequestItems_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequest_UpdatedByUserID",
                table: "BranchRequests",
                newName: "IX_BranchRequests_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequest_RequestedByUserID",
                table: "BranchRequests",
                newName: "IX_BranchRequests_RequestedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequest_RegionID",
                table: "BranchRequests",
                newName: "IX_BranchRequests_RegionID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequest_CreatedByUserID",
                table: "BranchRequests",
                newName: "IX_BranchRequests_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BranchRequest_BranchID",
                table: "BranchRequests",
                newName: "IX_BranchRequests_BranchID");

            migrationBuilder.RenameIndex(
                name: "IX_Branch_UpdatedByUserID",
                table: "Branches",
                newName: "IX_Branches_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Branch_RegionID",
                table: "Branches",
                newName: "IX_Branches_RegionID");

            migrationBuilder.RenameIndex(
                name: "IX_Branch_CreatedByUserID",
                table: "Branches",
                newName: "IX_Branches_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BinLocation_UpdatedByUserID",
                table: "BinLocations",
                newName: "IX_BinLocations_UpdatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BinLocation_CreatedByUserID",
                table: "BinLocations",
                newName: "IX_BinLocations_CreatedByUserID");

            migrationBuilder.RenameIndex(
                name: "IX_BinLocation_BranchID",
                table: "BinLocations",
                newName: "IX_BinLocations_BranchID");

            migrationBuilder.RenameIndex(
                name: "IX_BinLocation_BinCode",
                table: "BinLocations",
                newName: "IX_BinLocations_BinCode");

            migrationBuilder.AddColumn<string>(
                name: "Firstname",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Lastname",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Middlename",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "UserID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TransferItems",
                table: "TransferItems",
                column: "TransferItemID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Transfers",
                table: "Transfers",
                column: "TransferID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RolePermissionChangeRequests",
                table: "RolePermissionChangeRequests",
                column: "RequestID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Roles",
                table: "Roles",
                column: "RoleID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Regions",
                table: "Regions",
                column: "RegionID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductVersions",
                table: "ProductVersions",
                column: "VersionID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductTransactions",
                table: "ProductTransactions",
                column: "ProdTransID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductionOrders",
                table: "ProductionOrders",
                column: "OrderID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductionInventories",
                table: "ProductionInventories",
                column: "ProdInvID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductionBatches",
                table: "ProductionBatches",
                column: "BatchID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Products",
                table: "Products",
                column: "ProductID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications",
                column: "NotificationID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MaterialTransactions",
                table: "MaterialTransactions",
                column: "MatTransID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MaterialInventories",
                table: "MaterialInventories",
                column: "MatInvID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Materials",
                table: "Materials",
                column: "MaterialID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Inspections",
                table: "Inspections",
                column: "InspectionID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BudgetReservations",
                table: "BudgetReservations",
                column: "BudgetReservationID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Budgets",
                table: "Budgets",
                column: "BudgetID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BranchRequestItems",
                table: "BranchRequestItems",
                column: "RequestItemID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BranchRequests",
                table: "BranchRequests",
                column: "RequestID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Branches",
                table: "Branches",
                column: "BranchID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BinLocations",
                table: "BinLocations",
                column: "BinID");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_Materials_MaterialID",
                table: "BillOfMaterials",
                column: "MaterialID",
                principalTable: "Materials",
                principalColumn: "MaterialID");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_ProductVersions_VersionID",
                table: "BillOfMaterials",
                column: "VersionID",
                principalTable: "ProductVersions",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_Users_CreatedByUserID",
                table: "BillOfMaterials",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BillOfMaterials_Users_UpdatedByUserID",
                table: "BillOfMaterials",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BinLocations_Branches_BranchID",
                table: "BinLocations",
                column: "BranchID",
                principalTable: "Branches",
                principalColumn: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_BinLocations_Users_CreatedByUserID",
                table: "BinLocations",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BinLocations_Users_UpdatedByUserID",
                table: "BinLocations",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branches_Regions_RegionID",
                table: "Branches",
                column: "RegionID",
                principalTable: "Regions",
                principalColumn: "RegionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branches_Users_CreatedByUserID",
                table: "Branches",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branches_Users_UpdatedByUserID",
                table: "Branches",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequestItems_BranchRequests_RequestID",
                table: "BranchRequestItems",
                column: "RequestID",
                principalTable: "BranchRequests",
                principalColumn: "RequestID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequestItems_ProductVersions_VersionID",
                table: "BranchRequestItems",
                column: "VersionID",
                principalTable: "ProductVersions",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequestItems_Users_CreatedByUserID",
                table: "BranchRequestItems",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequestItems_Users_UpdatedByUserID",
                table: "BranchRequestItems",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequests_Branches_BranchID",
                table: "BranchRequests",
                column: "BranchID",
                principalTable: "Branches",
                principalColumn: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequests_Regions_RegionID",
                table: "BranchRequests",
                column: "RegionID",
                principalTable: "Regions",
                principalColumn: "RegionID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequests_Users_CreatedByUserID",
                table: "BranchRequests",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequests_Users_RequestedByUserID",
                table: "BranchRequests",
                column: "RequestedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchRequests_Users_UpdatedByUserID",
                table: "BranchRequests",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetReservations_Budgets_BudgetID",
                table: "BudgetReservations",
                column: "BudgetID",
                principalTable: "Budgets",
                principalColumn: "BudgetID");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetReservations_ProductVersions_VersionID",
                table: "BudgetReservations",
                column: "VersionID",
                principalTable: "ProductVersions",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetReservations_Users_CreatedByUserID",
                table: "BudgetReservations",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetReservations_Users_UpdatedByUserID",
                table: "BudgetReservations",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budgets_Regions_RegionID",
                table: "Budgets",
                column: "RegionID",
                principalTable: "Regions",
                principalColumn: "RegionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budgets_Users_ApprovedByUserID",
                table: "Budgets",
                column: "ApprovedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budgets_Users_CreatedByUserID",
                table: "Budgets",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budgets_Users_SubmittedByUserID",
                table: "Budgets",
                column: "SubmittedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Budgets_Users_UpdatedByUserID",
                table: "Budgets",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspections_ProductionBatches_BatchID",
                table: "Inspections",
                column: "BatchID",
                principalTable: "ProductionBatches",
                principalColumn: "BatchID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspections_Users_CreatedByUserID",
                table: "Inspections",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspections_Users_UpdatedByUserID",
                table: "Inspections",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inspections_Users_UserID",
                table: "Inspections",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialInventories_BinLocations_BinID",
                table: "MaterialInventories",
                column: "BinID",
                principalTable: "BinLocations",
                principalColumn: "BinID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialInventories_Materials_MaterialID",
                table: "MaterialInventories",
                column: "MaterialID",
                principalTable: "Materials",
                principalColumn: "MaterialID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialInventories_Users_CreatedByUserID",
                table: "MaterialInventories",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialInventories_Users_UpdatedByUserID",
                table: "MaterialInventories",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Materials_Users_CreatedByUserID",
                table: "Materials",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Materials_Users_UpdatedByUserID",
                table: "Materials",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialTransactions_MaterialInventories_MatInvID",
                table: "MaterialTransactions",
                column: "MatInvID",
                principalTable: "MaterialInventories",
                principalColumn: "MatInvID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialTransactions_Users_CreatedByUserID",
                table: "MaterialTransactions",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialTransactions_Users_UpdatedByUserID",
                table: "MaterialTransactions",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialTransactions_Users_UserID",
                table: "MaterialTransactions",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Regions_RegionID",
                table: "Notifications",
                column: "RegionID",
                principalTable: "Regions",
                principalColumn: "RegionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_CreatedByUserID",
                table: "Notifications",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_UpdatedByUserID",
                table: "Notifications",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_UserID",
                table: "Notifications",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionBatches_ProductionOrders_OrderID",
                table: "ProductionBatches",
                column: "OrderID",
                principalTable: "ProductionOrders",
                principalColumn: "OrderID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionBatches_Users_CreatedByUserID",
                table: "ProductionBatches",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionBatches_Users_UpdatedByUserID",
                table: "ProductionBatches",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventories_BinLocations_BinID",
                table: "ProductionInventories",
                column: "BinID",
                principalTable: "BinLocations",
                principalColumn: "BinID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventories_ProductVersions_VersionID",
                table: "ProductionInventories",
                column: "VersionID",
                principalTable: "ProductVersions",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventories_Users_CreatedByUserID",
                table: "ProductionInventories",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionInventories_Users_UpdatedByUserID",
                table: "ProductionInventories",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrders_Branches_BranchID",
                table: "ProductionOrders",
                column: "BranchID",
                principalTable: "Branches",
                principalColumn: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrders_ProductVersions_VersionID",
                table: "ProductionOrders",
                column: "VersionID",
                principalTable: "ProductVersions",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrders_Users_CreatedByUserID",
                table: "ProductionOrders",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOrders_Users_UpdatedByUserID",
                table: "ProductionOrders",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Branches_BranchID",
                table: "Products",
                column: "BranchID",
                principalTable: "Branches",
                principalColumn: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Users_CreatedByUserID",
                table: "Products",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Users_UpdatedByUserID",
                table: "Products",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductTransactions_ProductionInventories_ProdInvID",
                table: "ProductTransactions",
                column: "ProdInvID",
                principalTable: "ProductionInventories",
                principalColumn: "ProdInvID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductTransactions_Users_CreatedByUserID",
                table: "ProductTransactions",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductTransactions_Users_UpdatedByUserID",
                table: "ProductTransactions",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductTransactions_Users_UserID",
                table: "ProductTransactions",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVersions_Budgets_ReleasedBudgetID",
                table: "ProductVersions",
                column: "ReleasedBudgetID",
                principalTable: "Budgets",
                principalColumn: "BudgetID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVersions_Products_ProductID",
                table: "ProductVersions",
                column: "ProductID",
                principalTable: "Products",
                principalColumn: "ProductID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVersions_Users_CreatedByUserID",
                table: "ProductVersions",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVersions_Users_UpdatedByUserID",
                table: "ProductVersions",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Regions_Users_CreatedByUserID",
                table: "Regions",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Regions_Users_UpdatedByUserID",
                table: "Regions",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequests_Branches_BranchID",
                table: "RolePermissionChangeRequests",
                column: "BranchID",
                principalTable: "Branches",
                principalColumn: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequests_Roles_RoleID",
                table: "RolePermissionChangeRequests",
                column: "RoleID",
                principalTable: "Roles",
                principalColumn: "RoleID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequests_Users_CreatedByUserID",
                table: "RolePermissionChangeRequests",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequests_Users_RequestedByUserID",
                table: "RolePermissionChangeRequests",
                column: "RequestedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequests_Users_ReviewedByUserID",
                table: "RolePermissionChangeRequests",
                column: "ReviewedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissionChangeRequests_Users_UpdatedByUserID",
                table: "RolePermissionChangeRequests",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Roles_Users_CreatedByUserID",
                table: "Roles",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Roles_Users_UpdatedByUserID",
                table: "Roles",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_TransferItems_ProductVersions_VersionID",
                table: "TransferItems",
                column: "VersionID",
                principalTable: "ProductVersions",
                principalColumn: "VersionID");

            migrationBuilder.AddForeignKey(
                name: "FK_TransferItems_Transfers_TransferID",
                table: "TransferItems",
                column: "TransferID",
                principalTable: "Transfers",
                principalColumn: "TransferID");

            migrationBuilder.AddForeignKey(
                name: "FK_TransferItems_Users_CreatedByUserID",
                table: "TransferItems",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_TransferItems_Users_UpdatedByUserID",
                table: "TransferItems",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Transfers_BinLocations_FromBinID",
                table: "Transfers",
                column: "FromBinID",
                principalTable: "BinLocations",
                principalColumn: "BinID");

            migrationBuilder.AddForeignKey(
                name: "FK_Transfers_BranchRequests_RequestID",
                table: "Transfers",
                column: "RequestID",
                principalTable: "BranchRequests",
                principalColumn: "RequestID");

            migrationBuilder.AddForeignKey(
                name: "FK_Transfers_Users_CreatedByUserID",
                table: "Transfers",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Transfers_Users_UpdatedByUserID",
                table: "Transfers",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Branches_BranchID",
                table: "Users",
                column: "BranchID",
                principalTable: "Branches",
                principalColumn: "BranchID");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Roles_RoleID",
                table: "Users",
                column: "RoleID",
                principalTable: "Roles",
                principalColumn: "RoleID");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Users_CreatedByUserID",
                table: "Users",
                column: "CreatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Users_UpdatedByUserID",
                table: "Users",
                column: "UpdatedByUserID",
                principalTable: "Users",
                principalColumn: "UserID");
        }
    }
}
