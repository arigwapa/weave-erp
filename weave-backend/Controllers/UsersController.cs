using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : GenericCrudController<User>
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context) : base(context, "UserID")
        {
            _context = context;
        }

        [HttpGet]
        public override async Task<ActionResult<IEnumerable<User>>> GetAll()
        {
            var items = await (from u in _context.Users
                               join r in _context.Roles on u.RoleID equals r.RoleID
                               where u.IsActive
                               select new
                               {
                                   u.UserID,
                                   BranchName = _context.Branches
                                       .Where(b => b.WarehouseManagerUserID == u.UserID)
                                       .OrderBy(b => b.BranchID)
                                       .Select(b => b.BranchName)
                                       .FirstOrDefault(),
                                   WarehouseID = _context.Branches
                                       .Where(b => b.WarehouseManagerUserID == u.UserID)
                                       .OrderBy(b => b.BranchID)
                                       .Select(b => (int?)b.BranchID)
                                       .FirstOrDefault(),
                                   WarehouseName = _context.Branches
                                       .Where(b => b.WarehouseManagerUserID == u.UserID)
                                       .OrderBy(b => b.BranchID)
                                       .Select(b => b.BranchName)
                                       .FirstOrDefault(),
                                   u.RoleID,
                                   RoleName = r.DisplayName,
                                   u.Username,
                                   u.Fullname,
                                   u.Email,
                                   ContactNumber = u.ContactNumber,
                                   Mobile = u.ContactNumber,
                                   u.IsActive,
                                   Status = u.IsActive ? "Active" : "Inactive",
                                   u.CreatedByUserID,
                                   CreatedBy = _context.Users
                                       .Where(actor => actor.UserID == u.CreatedByUserID)
                                       .Select(actor => actor.Fullname)
                                       .FirstOrDefault(),
                                   u.CreatedAt,
                                   u.UpdatedByUserID,
                                   u.UpdatedAt
                               })
                .AsNoTracking()
                .OrderByDescending(x => x.UserID)
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("archived")]
        public async Task<ActionResult<IEnumerable<object>>> GetArchived()
        {
            var items = await (from u in _context.Users
                               join r in _context.Roles on u.RoleID equals r.RoleID
                               where !u.IsActive
                               select new
                               {
                                   u.UserID,
                                   BranchName = _context.Branches
                                       .Where(b => b.WarehouseManagerUserID == u.UserID)
                                       .OrderBy(b => b.BranchID)
                                       .Select(b => b.BranchName)
                                       .FirstOrDefault(),
                                   WarehouseID = _context.Branches
                                       .Where(b => b.WarehouseManagerUserID == u.UserID)
                                       .OrderBy(b => b.BranchID)
                                       .Select(b => (int?)b.BranchID)
                                       .FirstOrDefault(),
                                   WarehouseName = _context.Branches
                                       .Where(b => b.WarehouseManagerUserID == u.UserID)
                                       .OrderBy(b => b.BranchID)
                                       .Select(b => b.BranchName)
                                       .FirstOrDefault(),
                                   u.RoleID,
                                   RoleName = r.DisplayName,
                                   u.Username,
                                   u.Fullname,
                                   u.Email,
                                   ContactNumber = u.ContactNumber,
                                   Mobile = u.ContactNumber,
                                   u.IsActive,
                                   Status = "Inactive",
                                   u.CreatedByUserID,
                                   CreatedBy = _context.Users
                                       .Where(actor => actor.UserID == u.CreatedByUserID)
                                       .Select(actor => actor.Fullname)
                                       .FirstOrDefault(),
                                   u.CreatedAt,
                                   u.UpdatedByUserID,
                                   u.UpdatedAt
                               })
                .AsNoTracking()
                .OrderByDescending(x => x.UserID)
                .ToListAsync();
            return Ok(items);
        }

        [HttpPost("manage")]
        public async Task<ActionResult<object>> CreateUser([FromBody] CreateUserRequest request)
        {
            var username = request.Username.Trim();
            var existing = await _context.Users.AnyAsync(x => x.Username == username);
            if (existing)
            {
                ModelState.AddModelError(nameof(request.Username), "Username already exists.");
                return Conflict(new ValidationProblemDetails(ModelState)
                {
                    Status = 409,
                    Title = "Validation failed."
                });
            }

            var normalizedRole = NormalizeRoleName(request.RoleName);
            var actorRole = GetActorRoleName();
            if (!CanAssignRole(actorRole, normalizedRole))
            {
                ModelState.AddModelError(nameof(request.RoleName), "You are not allowed to assign this role.");
                return ValidationProblem(ModelState);
            }
            var roleId = await ResolveRoleIdAsync(normalizedRole);
            if (roleId <= 0)
            {
                ModelState.AddModelError(nameof(request.RoleName), "Invalid role.");
                return ValidationProblem(ModelState);
            }

            var isWarehouseManager = IsWarehouseManagerRole(normalizedRole);
            var resolvedWarehouse = isWarehouseManager
                ? await ResolveWarehouseAssignmentAsync(request.WarehouseID, request.WarehouseName)
                : null;
            if (isWarehouseManager && resolvedWarehouse == null)
            {
                ModelState.AddModelError(nameof(request.WarehouseName), "Warehouse Manager role requires a valid warehouse assignment.");
                return ValidationProblem(ModelState);
            }

            var fullName = request.Fullname.Trim();
            var email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
            var contactNumberInput = request.ContactNumber ?? request.Mobile;
            var contactNumber = string.IsNullOrWhiteSpace(contactNumberInput) ? null : contactNumberInput.Trim();
            var passwordHash = HashPassword(request.Password);
            var userDto = new UserDto
            {
                RoleID = roleId,
                Username = username,
                Fullname = fullName,
                Email = email,
                ContactNumber = contactNumber,
                PasswordHash = passwordHash
            };
            if (!TryValidateUserDto(userDto))
            {
                return ValidationProblem(ModelState);
            }

            var actorUserId = GetActorUserId() ?? 1;
            var user = new User
            {
                RoleID = userDto.RoleID,
                Username = userDto.Username,
                Fullname = userDto.Fullname,
                Email = userDto.Email,
                ContactNumber = userDto.ContactNumber,
                PasswordHash = userDto.PasswordHash,
                IsActive = true,
                CreatedByUserID = actorUserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (isWarehouseManager && resolvedWarehouse != null)
            {
                var previousBranches = await _context.Branches
                    .Where(x => x.WarehouseManagerUserID == user.UserID)
                    .ToListAsync();
                foreach (var branch in previousBranches)
                {
                    branch.WarehouseManagerUserID = null;
                    branch.UpdatedAt = DateTime.UtcNow;
                }

                var assignedBranch = await _context.Branches.FirstOrDefaultAsync(x => x.BranchID == resolvedWarehouse.WarehouseID);
                if (assignedBranch != null)
                {
                    assignedBranch.WarehouseManagerUserID = user.UserID;
                    assignedBranch.UpdatedAt = DateTime.UtcNow;
                }
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetById), new { id = user.UserID }, new
            {
                user.UserID,
                WarehouseID = resolvedWarehouse?.WarehouseID,
                WarehouseName = resolvedWarehouse?.WarehouseName,
                BranchName = resolvedWarehouse?.WarehouseName,
                RoleName = normalizedRole,
                user.Username,
                user.Fullname,
                user.Email,
                ContactNumber = user.ContactNumber,
                Mobile = user.ContactNumber,
                user.IsActive,
                Status = user.IsActive ? "Active" : "Inactive",
                user.CreatedByUserID,
                CreatedBy = _context.Users
                    .Where(x => x.UserID == user.CreatedByUserID)
                    .Select(x => x.Fullname)
                    .FirstOrDefault(),
                user.CreatedAt
            });
        }

        [HttpPut("{id:int}/manage")]
        public async Task<ActionResult<object>> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.UserID == id);
            if (user == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrWhiteSpace(request.Username))
            {
                var username = request.Username.Trim();
                var duplicate = await _context.Users.AnyAsync(x => x.UserID != id && x.Username == username);
                if (duplicate)
                {
                    ModelState.AddModelError(nameof(request.Username), "Username already exists.");
                    return Conflict(new ValidationProblemDetails(ModelState)
                    {
                        Status = 409,
                        Title = "Validation failed."
                    });
                }
                user.Username = username;
            }

            if (!string.IsNullOrWhiteSpace(request.Fullname))
            {
                user.Fullname = request.Fullname.Trim();
            }

            if (request.Email != null)
            {
                user.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
            }

            var inputContact = request.ContactNumber ?? request.Mobile;
            if (inputContact != null)
            {
                user.ContactNumber = string.IsNullOrWhiteSpace(inputContact) ? null : inputContact.Trim();
            }

            var effectiveRoleName = request.RoleName;
            if (!string.IsNullOrWhiteSpace(request.RoleName))
            {
                var normalizedRole = NormalizeRoleName(request.RoleName);
                var actorRole = GetActorRoleName();
                if (!CanAssignRole(actorRole, normalizedRole))
                {
                    ModelState.AddModelError(nameof(request.RoleName), "You are not allowed to assign this role.");
                    return ValidationProblem(ModelState);
                }
                var roleId = await ResolveRoleIdAsync(normalizedRole);
                if (roleId <= 0)
                {
                    ModelState.AddModelError(nameof(request.RoleName), "Invalid role.");
                    return ValidationProblem(ModelState);
                }
                user.RoleID = roleId;
                effectiveRoleName = normalizedRole;
            }

            var isWarehouseManagerForUpdate = IsWarehouseManagerRole(effectiveRoleName ?? string.Empty);
            WarehouseAssignment? resolvedWarehouseForUpdate = null;
            if (isWarehouseManagerForUpdate)
            {
                resolvedWarehouseForUpdate = await ResolveWarehouseAssignmentAsync(request.WarehouseID, request.WarehouseName);
                if (resolvedWarehouseForUpdate == null)
                {
                    ModelState.AddModelError(nameof(request.WarehouseName), "Warehouse Manager role requires a valid warehouse assignment.");
                    return ValidationProblem(ModelState);
                }
            }

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                user.PasswordHash = HashPassword(request.Password);
            }

            if (request.IsActive.HasValue)
            {
                user.IsActive = request.IsActive.Value;
            }

            var updateDto = new UserDto
            {
                RoleID = user.RoleID,
                Username = user.Username,
                Fullname = user.Fullname,
                Email = user.Email,
                ContactNumber = user.ContactNumber,
                PasswordHash = user.PasswordHash
            };
            if (!TryValidateUserDto(updateDto))
            {
                return ValidationProblem(ModelState);
            }

            user.UpdatedByUserID = GetActorUserId();
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            if (isWarehouseManagerForUpdate && resolvedWarehouseForUpdate != null)
            {
                var previousBranches = await _context.Branches
                    .Where(x => x.WarehouseManagerUserID == user.UserID)
                    .ToListAsync();
                foreach (var branch in previousBranches)
                {
                    branch.WarehouseManagerUserID = null;
                    branch.UpdatedAt = DateTime.UtcNow;
                }

                var assignedBranch = await _context.Branches.FirstOrDefaultAsync(x => x.BranchID == resolvedWarehouseForUpdate.WarehouseID);
                if (assignedBranch != null)
                {
                    assignedBranch.WarehouseManagerUserID = user.UserID;
                    assignedBranch.UpdatedAt = DateTime.UtcNow;
                }
                await _context.SaveChangesAsync();
            }
            else
            {
                var previousBranches = await _context.Branches
                    .Where(x => x.WarehouseManagerUserID == user.UserID)
                    .ToListAsync();
                if (previousBranches.Count > 0)
                {
                    foreach (var branch in previousBranches)
                    {
                        branch.WarehouseManagerUserID = null;
                        branch.UpdatedAt = DateTime.UtcNow;
                    }
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new
            {
                user.UserID,
                WarehouseID = resolvedWarehouseForUpdate?.WarehouseID,
                WarehouseName = resolvedWarehouseForUpdate?.WarehouseName
                    ?? _context.Branches.Where(x => x.WarehouseManagerUserID == user.UserID).Select(x => x.BranchName).FirstOrDefault(),
                BranchName = resolvedWarehouseForUpdate?.WarehouseName
                    ?? _context.Branches.Where(x => x.WarehouseManagerUserID == user.UserID).Select(x => x.BranchName).FirstOrDefault(),
                user.Username,
                user.Fullname,
                user.Email,
                ContactNumber = user.ContactNumber,
                Mobile = user.ContactNumber,
                user.IsActive,
                Status = user.IsActive ? "Active" : "Inactive",
                user.CreatedByUserID,
                CreatedBy = _context.Users
                    .Where(x => x.UserID == user.CreatedByUserID)
                    .Select(x => x.Fullname)
                    .FirstOrDefault(),
                user.CreatedAt
            });
        }

        [HttpPut("{id:int}/archive")]
        public async Task<IActionResult> Archive(int id)
        {
            var item = await _context.Users.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.IsActive = false;
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id:int}/restore")]
        public async Task<IActionResult> Restore(int id)
        {
            var item = await _context.Users.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.IsActive = true;
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static string HashPassword(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return Convert.ToHexString(bytes);
        }

        private async Task<int> ResolveRoleIdAsync(string? roleName)
        {
            var normalized = NormalizeRoleName(roleName);
            if (string.IsNullOrWhiteSpace(normalized))
            {
                return 0;
            }

            var existingRoleId = await _context.Roles
                .Where(r => r.DisplayName.ToLower() == normalized.ToLower())
                .Select(r => r.RoleID)
                .FirstOrDefaultAsync();
            if (existingRoleId > 0)
            {
                return existingRoleId;
            }

            var role = new Role
            {
                DisplayName = normalized,
                Scope = "Workflow",
                Description = "Auto-created from User Management",
                IsActive = true,
                CreatedByUserID = GetActorUserId() ?? 1,
                CreatedAt = DateTime.UtcNow
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
            return role.RoleID;
        }

        private static string NormalizeRoleName(string? roleName)
        {
            var clean = (roleName ?? string.Empty).Trim();
            return clean.ToLowerInvariant() switch
            {
                "plm manager" => "Product Manager",
                "product finance budget manager" => "Product Manager",
                "finance manager" => "Product Manager",
                "product quality manager" => "QA Manager",
                "branch manager" => "Warehouse Manager",
                _ => clean
            };
        }

        private static bool IsWarehouseManagerRole(string roleName)
        {
            return string.Equals(
                NormalizeRoleName(roleName),
                "Warehouse Manager",
                StringComparison.OrdinalIgnoreCase);
        }

        private async Task<WarehouseAssignment?> ResolveWarehouseAssignmentAsync(int? warehouseId, string? warehouseName)
        {
            if (warehouseId.HasValue && warehouseId.Value > 0)
            {
                var byId = await _context.Branches
                    .AsNoTracking()
                    .Where(x => x.BranchID == warehouseId.Value)
                    .Select(x => new WarehouseAssignment
                    {
                        WarehouseID = x.BranchID,
                        WarehouseName = x.BranchName
                    })
                    .FirstOrDefaultAsync();
                if (byId != null)
                {
                    return byId;
                }
            }

            var cleanWarehouseName = (warehouseName ?? string.Empty).Trim();
            if (!string.IsNullOrWhiteSpace(cleanWarehouseName))
            {
                return await _context.Branches
                    .AsNoTracking()
                    .Where(x => x.BranchName.ToLower() == cleanWarehouseName.ToLower())
                    .OrderBy(x => x.BranchID)
                    .Select(x => new WarehouseAssignment
                    {
                        WarehouseID = x.BranchID,
                        WarehouseName = x.BranchName
                    })
                    .FirstOrDefaultAsync();
            }

            return null;
        }

        private int? GetActorUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(raw, out var id) ? id : null;
        }

        private string GetActorRoleName()
        {
            return NormalizeRoleName(User.FindFirstValue(ClaimTypes.Role));
        }

        private static bool CanAssignRole(string actorRole, string targetRole)
        {
            var normalizedActor = NormalizeRoleName(actorRole);
            var normalizedTarget = NormalizeRoleName(targetRole);

            if (string.Equals(normalizedActor, "SuperAdmin", StringComparison.OrdinalIgnoreCase))
            {
                var superAdminAssignableRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                {
                    "Admin",
                    "Warehouse Manager",
                    "QA Manager",
                    "Product Manager",
                    "Production Manager",
                };
                return superAdminAssignableRoles.Contains(normalizedTarget);
            }

            if (string.Equals(normalizedActor, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                var adminAssignableRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                {
                    "Warehouse Manager",
                    "QA Manager",
                    "Product Manager",
                    "Production Manager",
                };
                return adminAssignableRoles.Contains(normalizedTarget);
            }

            return false;
        }

        private bool TryValidateUserDto(UserDto dto)
        {
            var results = new List<ValidationResult>();
            var context = new ValidationContext(dto);
            var isValid = Validator.TryValidateObject(dto, context, results, validateAllProperties: true);
            if (isValid)
            {
                return true;
            }

            foreach (var result in results)
            {
                var members = result.MemberNames?.Any() == true
                    ? result.MemberNames
                    : new[] { string.Empty };
                foreach (var member in members)
                {
                    ModelState.AddModelError(member, result.ErrorMessage ?? "Invalid value.");
                }
            }

            return false;
        }
    }

    public class CreateUserRequest
    {
        public int? WarehouseID { get; set; }
        [StringLength(80, ErrorMessage = "Warehouse name must be at most 80 characters.")]
        public string? WarehouseName { get; set; }
        [Required(ErrorMessage = "Role is required.")]
        [StringLength(120, ErrorMessage = "Role must be at most 120 characters.")]
        public string RoleName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(160, ErrorMessage = "Full name must be at most 160 characters.")]
        public string Fullname { get; set; } = string.Empty;
        [Required(ErrorMessage = "Username is required.")]
        [StringLength(100, ErrorMessage = "Username must be at most 100 characters.")]
        public string Username { get; set; } = string.Empty;
        [EmailAddress(ErrorMessage = "Email format is invalid.")]
        [StringLength(120, ErrorMessage = "Email must be at most 120 characters.")]
        public string? Email { get; set; }
        [StringLength(30, ErrorMessage = "Contact number must be at most 30 characters.")]
        public string? ContactNumber { get; set; }
        [StringLength(30, ErrorMessage = "Mobile must be at most 30 characters.")]
        public string? Mobile { get; set; }
        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters.")]
        public string Password { get; set; } = string.Empty;
    }

    public class UpdateUserRequest
    {
        public int? WarehouseID { get; set; }
        [StringLength(80, ErrorMessage = "Warehouse name must be at most 80 characters.")]
        public string? WarehouseName { get; set; }
        [StringLength(120, ErrorMessage = "Role must be at most 120 characters.")]
        public string? RoleName { get; set; }
        [StringLength(160, ErrorMessage = "Full name must be at most 160 characters.")]
        public string? Fullname { get; set; }
        [StringLength(100, ErrorMessage = "Username must be at most 100 characters.")]
        public string? Username { get; set; }
        [EmailAddress(ErrorMessage = "Email format is invalid.")]
        [StringLength(120, ErrorMessage = "Email must be at most 120 characters.")]
        public string? Email { get; set; }
        [StringLength(30, ErrorMessage = "Contact number must be at most 30 characters.")]
        public string? ContactNumber { get; set; }
        [StringLength(30, ErrorMessage = "Mobile must be at most 30 characters.")]
        public string? Mobile { get; set; }
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters.")]
        public string? Password { get; set; }
        public bool? IsActive { get; set; }
    }

    public class WarehouseAssignment
    {
        public int WarehouseID { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
    }
}
