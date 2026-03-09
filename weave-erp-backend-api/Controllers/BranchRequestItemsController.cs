using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    public class BranchRequestItemsController : GenericCrudController<BranchRequestItem>
    {
        public BranchRequestItemsController(AppDbContext context) : base(context, "RequestItemID")
        {
        }
    }
}
