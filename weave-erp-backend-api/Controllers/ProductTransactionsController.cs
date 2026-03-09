using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    public class ProductTransactionsController : GenericCrudController<ProductTransaction>
    {
        public ProductTransactionsController(AppDbContext context) : base(context, "ProdTransID")
        {
        }
    }
}
