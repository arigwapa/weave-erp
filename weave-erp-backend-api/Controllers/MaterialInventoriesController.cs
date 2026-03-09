using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    public class MaterialInventoriesController : GenericCrudController<MaterialInventory>
    {
        public MaterialInventoriesController(AppDbContext context) : base(context, "MatInvID")
        {
        }
    }
}
