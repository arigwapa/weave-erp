using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [Route("api/branches")]
    public class BranchesController : GenericCrudController<Branch>
    {
        private readonly AppDbContext _context;

        public BranchesController(AppDbContext context) : base(context, "BranchID")
        {
            _context = context;
        }

        [HttpGet("by-warehouse-manager")]
        public async Task<ActionResult<IEnumerable<Branch>>> GetByWarehouseManager([FromQuery] int userId)
        {
            var items = await _context.Branches
                .Where(x => x.WarehouseManagerUserID == userId)
                .ToListAsync();
            return Ok(items);
        }
    }
}
