using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Models;

namespace weave_erp_backend_api.Services
{
    public class InventoryService
    {
        private readonly AppDbContext _context;

        public InventoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MaterialInventory>> GetMaterialInventoriesAsync()
        {
            return await _context.MaterialInventories.AsNoTracking().ToListAsync();
        }

        public async Task<List<ProductionInventory>> GetProductionInventoriesAsync()
        {
            return await _context.ProductionInventories.AsNoTracking().ToListAsync();
        }
    }
}
