using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserService _userService;
        private readonly IConfiguration _configuration;
        private readonly AuditLogService _auditLogService;

        public AuthController(
            AppDbContext context,
            UserService userService,
            IConfiguration configuration,
            AuditLogService auditLogService)
        {
            _context = context;
            _userService = userService;
            _configuration = configuration;
            _auditLogService = auditLogService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var login = await _userService.ValidateLoginAsync(request.Username, request.Password);
            if (login == null)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            var (user, roleName, _) = login.Value;
            var token = GenerateToken(user, roleName);
            await _auditLogService.WriteAsync(
                performedBy: user.Fullname?.Trim().Length > 0 ? user.Fullname : user.Username,
                roleName: roleName,
                action: "LOGIN",
                description: $"User login successful for {user.Username}",
                module: "Auth",
                ipAgent: $"{HttpContext.Connection.RemoteIpAddress?.ToString() ?? "N/A"} / {Request.Headers.UserAgent}");

            return Ok(new
            {
                AccessToken = token,
                UserID = user.UserID,
                BranchID = await ResolveBranchIdForUserAsync(user.UserID),
                RoleName = roleName,
                Username = user.Username,
                user.Fullname,
                MustChangePassword = false
            });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var me = await (from u in _context.Users
                            join r in _context.Roles on u.RoleID equals r.RoleID
                            where u.UserID == userId
                            select new
                            {
                                u.UserID,
                                BranchID = _context.Branches
                                    .Where(b => b.WarehouseManagerUserID == u.UserID)
                                    .Select(b => (int?)b.BranchID)
                                    .FirstOrDefault() ?? 0,
                                BranchName = _context.Branches
                                    .Where(b => b.WarehouseManagerUserID == u.UserID)
                                    .Select(b => b.BranchName)
                                    .FirstOrDefault(),
                                RoleName = r.DisplayName,
                                u.Username,
                                u.Fullname,
                                IsActive = u.IsActive,
                                Status = u.IsActive ? "Active" : "Inactive",
                                MustChangePassword = false
                            }).AsNoTracking().FirstOrDefaultAsync();

            if (me == null)
            {
                return NotFound();
            }

            return Ok(me);
        }

        [HttpPost("change-password")]
        [Authorize]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { message = "New password is required." });
            }

            // Placeholder implementation.
            return Ok(new { message = "Password change endpoint is ready." });
        }

        private string GenerateToken(Models.User user, string roleName)
        {
            var jwtSection = _configuration.GetSection("Jwt");
            var key = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt key missing.");
            var issuer = jwtSection["Issuer"];
            var audience = jwtSection["Audience"];
            var expireMinutes = int.TryParse(jwtSection["ExpireMinutes"], out var minutes) ? minutes : 120;

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                new(ClaimTypes.Name, user.Username),
                new(ClaimTypes.Role, roleName),
                new("branchId", "0")
            };

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<int> ResolveBranchIdForUserAsync(int userId)
        {
            return await _context.Branches
                .Where(b => b.WarehouseManagerUserID == userId)
                .Select(b => (int?)b.BranchID)
                .FirstOrDefaultAsync() ?? 0;
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
