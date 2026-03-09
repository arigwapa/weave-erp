using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Models;

namespace weave_erp_backend_api.Services
{
    public class ProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Product>> GetAllProductsAsync()
        {
            return await _context.Products.AsNoTracking().ToListAsync();
        }
    }
}
