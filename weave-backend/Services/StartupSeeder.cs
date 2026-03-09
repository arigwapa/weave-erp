using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Models;

namespace weave_erp_backend_api.Services
{
    public static class StartupSeeder
    {
        private sealed record SeedAccount(string RoleName, string Username, string Password, string Fullname, string Email);

        private static readonly SeedAccount[] SeedAccounts =
        {
            new("SuperAdmin", "superadmin", "superadmin123", "Super Admin", "superadmin@local"),
            new("Admin", "admin", "admin123", "Admin", "admin@local"),
            new("ProductionManager", "productionmanager", "productionmanager123", "Production Manager", "productionmanager@local"),
            new("ProductManager", "prodmanager", "prodmanager123", "Product Manager", "prodmanager@local"),
            new("QAManager", "qamanager", "qamanager123", "QA Manager", "qamanager@local"),
        };

        public static async Task SeedAsync(WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var logger = scope.ServiceProvider
                .GetRequiredService<ILoggerFactory>()
                .CreateLogger("StartupSeeder");
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            try
            {
                await context.Database.MigrateAsync();
                var hasUsers = await context.Users.AnyAsync();
                if (!hasUsers)
                {
                    await BootstrapInitialSuperAdminAsync(context);
                }

                var actorUserId = await context.Users
                    .OrderBy(x => x.UserID)
                    .Select(x => x.UserID)
                    .FirstAsync();
                var branchId = await EnsureBranchAsync(context, actorUserId);
                await EnsureRequiredRolesAndUsersAsync(context, branchId, actorUserId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed while seeding startup data.");
            }
        }

        private static async Task<int> EnsureBranchAsync(AppDbContext context, int actorUserId)
        {
            var branchId = await context.Branches
                .OrderBy(x => x.BranchID)
                .Select(x => x.BranchID)
                .FirstOrDefaultAsync();

            if (branchId > 0)
            {
                return branchId;
            }

            var branch = new Branch
            {
                BranchName = "Main Branch",
                Address = "System seeded branch",
                Capacity = 0,
                IsActive = true,
                CreatedByUserID = actorUserId,
                CreatedAt = DateTime.UtcNow
            };

            context.Branches.Add(branch);
            await context.SaveChangesAsync();
            return branch.BranchID;
        }

        private static async Task<int> EnsureRoleAsync(AppDbContext context, string roleName, int actorUserId)
        {
            var role = await context.Roles
                .FirstOrDefaultAsync(x => x.DisplayName.ToLower() == roleName.ToLower());

            if (role != null)
            {
                return role.RoleID;
            }

            role = new Role
            {
                DisplayName = roleName,
                Scope = "System",
                Description = $"{roleName} role (startup seeded)",
                IsActive = true,
                CreatedByUserID = actorUserId,
                CreatedAt = DateTime.UtcNow
            };

            context.Roles.Add(role);
            await context.SaveChangesAsync();
            return role.RoleID;
        }

        private static async Task EnsureRequiredRolesAndUsersAsync(AppDbContext context, int branchId, int actorUserId)
        {
            foreach (var account in SeedAccounts)
            {
                var roleId = await EnsureRoleAsync(context, account.RoleName, actorUserId);
                var user = await context.Users
                    .FirstOrDefaultAsync(x => x.Username.ToLower() == account.Username.ToLower());
                var passwordHash = HashPassword(account.Password);

                if (user == null)
                {
                    user = new User
                    {
                        BranchID = branchId,
                        RoleID = roleId,
                        Username = account.Username,
                        Fullname = account.Fullname,
                        Email = account.Email,
                        ContactNumber = null,
                        PasswordHash = passwordHash,
                        IsActive = true,
                        CreatedByUserID = actorUserId,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Users.Add(user);
                    await context.SaveChangesAsync();
                    continue;
                }

                user.BranchID = branchId;
                user.RoleID = roleId;
                user.PasswordHash = passwordHash;
                user.IsActive = true;
                user.UpdatedByUserID = actorUserId;
                user.UpdatedAt = DateTime.UtcNow;
                await context.SaveChangesAsync();
            }
        }

        private static async Task BootstrapInitialSuperAdminAsync(AppDbContext context)
        {
            var superAdmin = SeedAccounts[0];
            var passwordHash = HashPassword(superAdmin.Password);
            var now = DateTime.UtcNow;

            var existingBranchId = await context.Branches
                .OrderBy(x => x.BranchID)
                .Select(x => x.BranchID)
                .FirstOrDefaultAsync();
            var existingRoleId = await context.Roles
                .Where(x => x.DisplayName.ToLower() == superAdmin.RoleName.ToLower())
                .Select(x => x.RoleID)
                .FirstOrDefaultAsync();
            var existingSuperAdminId = await context.Users
                .Where(x => x.Username.ToLower() == superAdmin.Username.ToLower())
                .Select(x => x.UserID)
                .FirstOrDefaultAsync();

            var newUserId = existingSuperAdminId > 0
                ? existingSuperAdminId
                : (await context.Users.Select(x => (int?)x.UserID).MaxAsync() ?? 0) + 1;
            var branchId = existingBranchId > 0
                ? existingBranchId
                : (await context.Branches.Select(x => (int?)x.BranchID).MaxAsync() ?? 0) + 1;
            var roleId = existingRoleId > 0
                ? existingRoleId
                : (await context.Roles.Select(x => (int?)x.RoleID).MaxAsync() ?? 0) + 1;

            await using var tx = await context.Database.BeginTransactionAsync();
            await context.Database.ExecuteSqlRawAsync(
                "ALTER TABLE [Branch] NOCHECK CONSTRAINT ALL; " +
                "ALTER TABLE [Role] NOCHECK CONSTRAINT ALL; " +
                "ALTER TABLE [User] NOCHECK CONSTRAINT ALL;");

            try
            {
                if (existingBranchId <= 0)
                {
                    await context.Database.ExecuteSqlInterpolatedAsync($@"
SET IDENTITY_INSERT [Branch] ON;
INSERT INTO [Branch] ([BranchID], [BranchName], [Address], [Capacity], [WarehouseManagerUserID], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedByUserID], [UpdatedAt])
VALUES ({branchId}, {"Main Branch"}, {"System seeded branch"}, {0}, {null}, {true}, {newUserId}, {now}, {null}, {null});
SET IDENTITY_INSERT [Branch] OFF;");
                }

                if (existingRoleId <= 0)
                {
                    await context.Database.ExecuteSqlInterpolatedAsync($@"
SET IDENTITY_INSERT [Role] ON;
INSERT INTO [Role] ([RoleID], [DisplayName], [Scope], [Description], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedByUserID], [UpdatedAt])
VALUES ({roleId}, {superAdmin.RoleName}, {"System"}, {"System-level administrator role"}, {true}, {newUserId}, {now}, {null}, {null});
SET IDENTITY_INSERT [Role] OFF;");
                }

                if (existingSuperAdminId <= 0)
                {
                    await context.Database.ExecuteSqlInterpolatedAsync($@"
SET IDENTITY_INSERT [User] ON;
INSERT INTO [User] ([UserID], [BranchID], [RoleID], [Username], [Fullname], [Email], [ContactNumber], [PasswordHash], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedByUserID], [UpdatedAt])
VALUES ({newUserId}, {branchId}, {roleId}, {superAdmin.Username}, {superAdmin.Fullname}, {superAdmin.Email}, {null}, {passwordHash}, {true}, {newUserId}, {now}, {null}, {null});
SET IDENTITY_INSERT [User] OFF;");
                }
                else
                {
                    await context.Database.ExecuteSqlInterpolatedAsync($@"
UPDATE [User]
SET [BranchID] = {branchId},
    [RoleID] = {roleId},
    [PasswordHash] = {passwordHash},
    [IsActive] = {true},
    [UpdatedByUserID] = {newUserId},
    [UpdatedAt] = {now}
WHERE [UserID] = {existingSuperAdminId};");
                }

                await context.Database.ExecuteSqlRawAsync(
                    "ALTER TABLE [Branch] WITH CHECK CHECK CONSTRAINT ALL; " +
                    "ALTER TABLE [Role] WITH CHECK CHECK CONSTRAINT ALL; " +
                    "ALTER TABLE [User] WITH CHECK CHECK CONSTRAINT ALL;");
                await tx.CommitAsync();
            }
            catch
            {
                await context.Database.ExecuteSqlRawAsync(
                    "ALTER TABLE [Branch] CHECK CONSTRAINT ALL; " +
                    "ALTER TABLE [Role] CHECK CONSTRAINT ALL; " +
                    "ALTER TABLE [User] CHECK CONSTRAINT ALL;");
                await tx.RollbackAsync();
                throw;
            }
        }

        private static string HashPassword(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return Convert.ToHexString(bytes);
        }
    }
}
