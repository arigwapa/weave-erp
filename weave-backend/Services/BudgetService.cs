using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Models;

namespace weave_erp_backend_api.Services
{
    public class BudgetService
    {
        private readonly AppDbContext _context;

        public BudgetService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Budget>> GetBudgetsAsync()
        {
            return await _context.Budgets.AsNoTracking().ToListAsync();
        }
    }
}
