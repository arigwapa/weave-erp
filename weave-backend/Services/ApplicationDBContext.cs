using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Models;

namespace weave_erp_backend_api.Services
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Branch> Branches => Set<Branch>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Material> Materials => Set<Material>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Collection> Collections => Set<Collection>();
        public DbSet<CollectionBudgetPlan> CollectionBudgetPlans => Set<CollectionBudgetPlan>();
        public DbSet<ProductionVersion> ProductionVersions => Set<ProductionVersion>();
        public DbSet<BillOfMaterials> BillOfMaterials => Set<BillOfMaterials>();
        public DbSet<Budget> Budgets => Set<Budget>();
        public DbSet<BinLocation> BinLocations => Set<BinLocation>();
        public DbSet<ProductionInventory> ProductionInventories => Set<ProductionInventory>();
        public DbSet<ProductionOrder> ProductionOrders => Set<ProductionOrder>();
        public DbSet<Inspection> Inspections => Set<Inspection>();
        public DbSet<InspectionChecklistTemplate> InspectionChecklistTemplates => Set<InspectionChecklistTemplate>();
        public DbSet<InspectionChecklistResult> InspectionChecklistResults => Set<InspectionChecklistResult>();
        public DbSet<InspectionDefect> InspectionDefects => Set<InspectionDefect>();
        public DbSet<CAPA> CAPAs => Set<CAPA>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<RunSchedule> RunSchedules => Set<RunSchedule>();
        public DbSet<ProductionBatchBoardItem> ProductionBatchBoardItems => Set<ProductionBatchBoardItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            ConfigureTableNames(modelBuilder);

            modelBuilder.Entity<User>().HasIndex(x => x.Username).IsUnique();
            modelBuilder.Entity<Product>().HasIndex(x => x.SKU).IsUnique();
            modelBuilder.Entity<Collection>().HasIndex(x => x.CollectionCode).IsUnique();
            modelBuilder.Entity<CollectionBudgetPlan>().HasIndex(x => x.CollectionID).IsUnique();
            modelBuilder.Entity<Budget>().HasIndex(x => x.BudgetCode).IsUnique();
            modelBuilder.Entity<BinLocation>().HasIndex(x => x.BinLocationName).IsUnique();
            modelBuilder.Entity<RunSchedule>().HasIndex(x => x.ScheduleKey).IsUnique();
            modelBuilder.Entity<ProductionBatchBoardItem>().HasIndex(x => x.Code).IsUnique();
            modelBuilder.Entity<InspectionChecklistTemplate>().HasIndex(x => x.ChecklistCode).IsUnique();
            modelBuilder.Entity<ProductionVersion>().HasIndex(x => new { x.ProductID, x.VersionNumber }).IsUnique();
            modelBuilder.Entity<ProductionVersion>().HasIndex(x => new { x.OrderID, x.VersionNumber }).IsUnique();
            modelBuilder.Entity<ProductionOrder>().Property(x => x.OrderID).ValueGeneratedOnAdd();

            ConfigureForeignKeys(modelBuilder);
            ConfigureDecimalPrecision(modelBuilder);

            foreach (var foreignKey in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                foreignKey.DeleteBehavior = DeleteBehavior.NoAction;
            }
        }

        private static void ConfigureTableNames(ModelBuilder modelBuilder)
        {
            // Map EF entities to existing SQL table names.
            modelBuilder.Entity<Branch>().ToTable("Branch");
            modelBuilder.Entity<Role>().ToTable("Role");
            modelBuilder.Entity<User>().ToTable("User");
            modelBuilder.Entity<Material>().ToTable("Material");
            modelBuilder.Entity<Product>().ToTable("Product");
            modelBuilder.Entity<Collection>().ToTable("Collection");
            modelBuilder.Entity<CollectionBudgetPlan>().ToTable("CollectionBudgetPlan");
            modelBuilder.Entity<ProductionVersion>().ToTable("ProductionVersion");
            modelBuilder.Entity<BillOfMaterials>().ToTable("BillOfMaterials");
            modelBuilder.Entity<Budget>().ToTable("Budget");
            modelBuilder.Entity<BinLocation>().ToTable("BinLocation");
            modelBuilder.Entity<ProductionInventory>().ToTable("ProductionInventory");
            modelBuilder.Entity<ProductionOrder>().ToTable("ProductionOrder");
            modelBuilder.Entity<Inspection>().ToTable("Inspection");
            modelBuilder.Entity<InspectionChecklistTemplate>().ToTable("InspectionChecklistTemplate");
            modelBuilder.Entity<InspectionChecklistResult>().ToTable("InspectionChecklistResult");
            modelBuilder.Entity<InspectionDefect>().ToTable("InspectionDefect");
            modelBuilder.Entity<CAPA>().ToTable("CAPA");
            modelBuilder.Entity<Notification>().ToTable("Notification");
            modelBuilder.Entity<RunSchedule>().ToTable("RunSchedule");
            modelBuilder.Entity<ProductionBatchBoardItem>().ToTable("ProductionBatchBoardItem");
        }

        private static void ConfigureDecimalPrecision(ModelBuilder modelBuilder)
        {
            foreach (var property in modelBuilder.Model
                .GetEntityTypes()
                .SelectMany(entityType => entityType.GetProperties())
                .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
            {
                property.SetPrecision(10);
                property.SetScale(2);
            }

            // Budget-related columns need larger limits for enterprise-level caps.
            modelBuilder.Entity<CollectionBudgetPlan>().Property(x => x.BudgetCap).HasPrecision(16, 2);

            modelBuilder.Entity<Budget>().Property(x => x.MaterialsBudget).HasPrecision(16, 2);
            modelBuilder.Entity<Budget>().Property(x => x.WasteAllowanceBudget).HasPrecision(16, 2);
            modelBuilder.Entity<Budget>().Property(x => x.TotalBudget).HasPrecision(16, 2);
            modelBuilder.Entity<Budget>().Property(x => x.ReservedAmount).HasPrecision(16, 2);
            modelBuilder.Entity<Budget>().Property(x => x.SpentAmount).HasPrecision(16, 2);
            modelBuilder.Entity<Budget>().Property(x => x.RemainingAmount).HasPrecision(16, 2);
        }

        private static void ConfigureForeignKeys(ModelBuilder modelBuilder)
        {
            // Organization and access
            modelBuilder.Entity<User>().HasOne<Branch>().WithMany().HasForeignKey(x => x.BranchID);
            modelBuilder.Entity<User>().HasOne<Role>().WithMany().HasForeignKey(x => x.RoleID);
            modelBuilder.Entity<Branch>().HasOne<User>().WithMany().HasForeignKey(x => x.WarehouseManagerUserID);

            // PLM
            modelBuilder.Entity<Collection>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<Collection>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);
            modelBuilder.Entity<CollectionBudgetPlan>().HasOne<Collection>().WithMany().HasForeignKey(x => x.CollectionID);
            modelBuilder.Entity<ProductionVersion>().HasOne<Product>().WithMany().HasForeignKey(x => x.ProductID);
            modelBuilder.Entity<ProductionVersion>().HasOne<ProductionOrder>().WithMany().HasForeignKey(x => x.OrderID);
            modelBuilder.Entity<ProductionVersion>().HasOne<Collection>().WithMany().HasForeignKey(x => x.CollectionID);
            modelBuilder.Entity<BillOfMaterials>().HasOne<Product>().WithMany().HasForeignKey(x => x.ProductID);

            // Finance
            modelBuilder.Entity<Budget>().HasOne<Collection>().WithMany().HasForeignKey(x => x.CollectionID);
            modelBuilder.Entity<Budget>().HasOne<User>().WithMany().HasForeignKey(x => x.SubmittedByUserID);
            modelBuilder.Entity<Budget>().HasOne<User>().WithMany().HasForeignKey(x => x.ApprovedByUserID);

            // Warehouse and production
            modelBuilder.Entity<ProductionInventory>().HasOne<BinLocation>().WithMany().HasForeignKey(x => x.BinID);
            modelBuilder.Entity<ProductionInventory>().HasOne<ProductionVersion>().WithMany().HasForeignKey(x => x.VersionID);
            modelBuilder.Entity<ProductionInventory>().HasOne<Product>().WithMany().HasForeignKey(x => x.ProductID);
            modelBuilder.Entity<ProductionInventory>().HasOne<Inspection>().WithMany().HasForeignKey(x => x.SourceInspectionID);
            modelBuilder.Entity<ProductionInventory>().HasOne<ProductionBatchBoardItem>().WithMany().HasForeignKey(x => x.BatchBoardID);

            modelBuilder.Entity<ProductionOrder>()
                .HasOne<ProductionVersion>()
                .WithMany()
                .HasForeignKey(x => new { x.OrderID, x.VersionNumber })
                .HasPrincipalKey(x => new { x.OrderID, x.VersionNumber });
            modelBuilder.Entity<Inspection>().HasOne<ProductionBatchBoardItem>().WithMany().HasForeignKey(x => x.BatchBoardID);
            modelBuilder.Entity<Inspection>().HasOne<User>().WithMany().HasForeignKey(x => x.UserID);
            modelBuilder.Entity<ProductionBatchBoardItem>().HasOne<User>().WithMany().HasForeignKey(x => x.QAStartedByUserID);
            modelBuilder.Entity<InspectionChecklistResult>().HasOne<Inspection>().WithMany().HasForeignKey(x => x.InspectionID);
            modelBuilder.Entity<InspectionChecklistResult>().HasOne<InspectionChecklistTemplate>().WithMany().HasForeignKey(x => x.ChecklistTemplateID);
            modelBuilder.Entity<InspectionDefect>().HasOne<Inspection>().WithMany().HasForeignKey(x => x.InspectionID);
            modelBuilder.Entity<CAPA>().HasOne<Inspection>().WithMany().HasForeignKey(x => x.InspectionID);
            modelBuilder.Entity<CAPA>().HasOne<User>().WithMany().HasForeignKey(x => x.ResponsibleUserID);

            // Notifications
            modelBuilder.Entity<Notification>().HasOne<User>().WithMany().HasForeignKey(x => x.UserID);

            modelBuilder.Entity<Branch>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<Branch>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);

            modelBuilder.Entity<Role>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<Role>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);

            modelBuilder.Entity<User>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<User>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);

            modelBuilder.Entity<Material>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<Material>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);

            modelBuilder.Entity<Product>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<Product>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);

            modelBuilder.Entity<CollectionBudgetPlan>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<CollectionBudgetPlan>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);

            modelBuilder.Entity<BillOfMaterials>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<BillOfMaterials>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);

            modelBuilder.Entity<Budget>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<Budget>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);

            modelBuilder.Entity<ProductionInventory>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<ProductionInventory>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);

            modelBuilder.Entity<Inspection>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<Inspection>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);
            modelBuilder.Entity<InspectionChecklistTemplate>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<InspectionChecklistTemplate>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);
            modelBuilder.Entity<InspectionChecklistResult>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<InspectionChecklistResult>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);
            modelBuilder.Entity<InspectionDefect>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<InspectionDefect>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);
            modelBuilder.Entity<CAPA>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<CAPA>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);

            modelBuilder.Entity<Notification>().HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserID);
            modelBuilder.Entity<Notification>().HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserID);

            modelBuilder.Entity<InspectionChecklistTemplate>().HasData(
                new InspectionChecklistTemplate { ChecklistTemplateID = 1, ChecklistCode = "CHK-STITCH", ChecklistName = "Stitching quality", Category = "Construction", SequenceNo = 1, IsRequired = true, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new InspectionChecklistTemplate { ChecklistTemplateID = 2, ChecklistCode = "CHK-FABRIC", ChecklistName = "Fabric quality", Category = "Material", SequenceNo = 2, IsRequired = true, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new InspectionChecklistTemplate { ChecklistTemplateID = 3, ChecklistCode = "CHK-COLOR", ChecklistName = "Color consistency", Category = "Visual", SequenceNo = 3, IsRequired = true, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new InspectionChecklistTemplate { ChecklistTemplateID = 4, ChecklistCode = "CHK-MEASURE", ChecklistName = "Measurement accuracy", Category = "Specification", SequenceNo = 4, IsRequired = true, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new InspectionChecklistTemplate { ChecklistTemplateID = 5, ChecklistCode = "CHK-LABEL", ChecklistName = "Label and tag placement", Category = "Trims", SequenceNo = 5, IsRequired = true, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new InspectionChecklistTemplate { ChecklistTemplateID = 6, ChecklistCode = "CHK-BUTTON", ChecklistName = "Button quality", Category = "Trims", SequenceNo = 6, IsRequired = true, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new InspectionChecklistTemplate { ChecklistTemplateID = 7, ChecklistCode = "CHK-ZIPPER", ChecklistName = "Zipper functionality", Category = "Trims", SequenceNo = 7, IsRequired = true, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new InspectionChecklistTemplate { ChecklistTemplateID = 8, ChecklistCode = "CHK-PRINT", ChecklistName = "Print/embroidery quality", Category = "Decoration", SequenceNo = 8, IsRequired = true, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new InspectionChecklistTemplate { ChecklistTemplateID = 9, ChecklistCode = "CHK-CLEAN", ChecklistName = "Cleanliness of garment", Category = "Finishing", SequenceNo = 9, IsRequired = true, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new InspectionChecklistTemplate { ChecklistTemplateID = 10, ChecklistCode = "CHK-THREAD", ChecklistName = "Thread trimming", Category = "Finishing", SequenceNo = 10, IsRequired = true, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new InspectionChecklistTemplate { ChecklistTemplateID = 11, ChecklistCode = "CHK-OVERALL", ChecklistName = "Overall appearance", Category = "Final", SequenceNo = 11, IsRequired = true, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            );
        }
    }
}
