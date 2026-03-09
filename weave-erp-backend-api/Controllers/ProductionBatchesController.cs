using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    public class ProductionBatchesController : GenericCrudController<ProductionBatch>
    {
        public ProductionBatchesController(AppDbContext context) : base(context, "BatchID")
        {
        }
    }
}
