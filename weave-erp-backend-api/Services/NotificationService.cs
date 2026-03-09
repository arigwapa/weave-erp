using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Hubs;
using weave_erp_backend_api.Models;

namespace weave_erp_backend_api.Services
{
    public class NotificationService
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(AppDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<List<Notification>> GetNotificationsAsync()
        {
            return await _context.Notifications.AsNoTracking().OrderByDescending(x => x.CreatedAt).ToListAsync();
        }

        public async Task<Notification> CreateAsync(Notification notification)
        {
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            if (notification.UserID.HasValue)
            {
                await _hubContext.Clients.Group($"user-{notification.UserID.Value}")
                    .SendAsync("notify", notification);
            }

            if (notification.RegionID.HasValue)
            {
                await _hubContext.Clients.Group($"region-{notification.RegionID.Value}")
                    .SendAsync("notify", notification);
            }

            return notification;
        }
    }
}
