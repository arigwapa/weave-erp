using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    public class TransferItemsController : GenericCrudController<TransferItem>
    {
        public TransferItemsController(AppDbContext context) : base(context, "TransferItemID")
        {
        }
    }
}
