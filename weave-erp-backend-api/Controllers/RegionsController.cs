using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    public class RegionsController : GenericCrudController<Region>
    {
        public RegionsController(AppDbContext context) : base(context, "RegionID")
        {
        }
    }
}
