using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    public class RolePermissionChangeRequestsController : GenericCrudController<RolePermissionChangeRequest>
    {
        public RolePermissionChangeRequestsController(AppDbContext context) : base(context, "RequestID")
        {
        }
    }
}
