using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    public class BudgetReservationsController : GenericCrudController<BudgetReservation>
    {
        public BudgetReservationsController(AppDbContext context) : base(context, "BudgetReservationID")
        {
        }
    }
}
