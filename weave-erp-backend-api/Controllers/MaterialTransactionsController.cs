using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    public class MaterialTransactionsController : GenericCrudController<MaterialTransaction>
    {
        public MaterialTransactionsController(AppDbContext context) : base(context, "MatTransID")
        {
        }
    }
}
