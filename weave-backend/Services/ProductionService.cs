using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Models;

namespace weave_erp_backend_api.Services
{
    public class ProductionService
    {
        private readonly AppDbContext _context;

        public ProductionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductionOrder>> GetProductionOrdersAsync()
        {
            return await _context.ProductionOrders.AsNoTracking().ToListAsync();
        }
    }
}
