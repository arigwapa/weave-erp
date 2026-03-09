using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    public class NotificationsController : GenericCrudController<Notification>
    {
        public NotificationsController(AppDbContext context) : base(context, "NotificationID")
        {
        }
    }
}
