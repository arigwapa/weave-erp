using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    public class TransfersController : GenericCrudController<Transfer>
    {
        public TransfersController(AppDbContext context) : base(context, "TransferID")
        {
        }
    }
}
