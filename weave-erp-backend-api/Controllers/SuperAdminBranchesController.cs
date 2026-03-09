using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/superadmin/branches")]
    public class SuperAdminBranchesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SuperAdminBranchesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var items = await _context.Branches
                .AsNoTracking()
                .OrderBy(x => x.BranchID)
                .Select(x => new
                {
                    id = x.BranchID,
                    name = x.BranchName,
                    status = x.IsActive ? "Active" : "Inactive",
                    warehouse = x.BranchName,
                    contact = string.Empty,
                    region = "Luzon"
                })
                .ToListAsync();
            return Ok(items);
        }
    }
}
