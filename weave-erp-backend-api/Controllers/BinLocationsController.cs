using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    public class BinLocationsController : GenericCrudController<BinLocation>
    {
        public BinLocationsController(AppDbContext context) : base(context, "BinID")
        {
        }
    }
}
