using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/notification")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationService _notificationService;
        private readonly AppDbContext _context;

        public NotificationController(NotificationService notificationService, AppDbContext context)
        {
            _notificationService = notificationService;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _notificationService.GetNotificationsAsync();
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Notification model)
        {
            model.CreatedAt = model.CreatedAt == default ? DateTime.UtcNow : model.CreatedAt;
            var created = await _notificationService.CreateAsync(model);
            return Ok(created);
        }

        [HttpPatch("{id:int}/read")]
        public async Task<IActionResult> MarkRead(int id)
        {
            var item = await _context.Notifications.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.IsRead = true;
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
