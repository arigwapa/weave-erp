using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Models;

namespace weave_erp_backend_api.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users.AsNoTracking().ToListAsync();
        }

        public async Task<(User user, string roleName, string branchName)?> ValidateLoginAsync(string username, string password)
        {
            var data = await (from u in _context.Users
                              join r in _context.Roles on u.RoleID equals r.RoleID
                              where u.Username == username && u.IsActive
                              select new { User = u, RoleName = r.DisplayName, BranchName = string.Empty })
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (data == null)
            {
                return null;
            }

            var incomingHash = HashPassword(password);
            if (!string.Equals(data.User.PasswordHash, incomingHash, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            return (data.User, data.RoleName, data.BranchName);
        }

        private static string HashPassword(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return Convert.ToHexString(bytes);
        }
    }
}
