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

        public async Task<int> NotifyAdminsAsync(string message, string type = "Alert", int? createdByUserId = null)
        {
            var adminRoleIds = await _context.Roles
                .AsNoTracking()
                .Where(role =>
                    role.DisplayName.ToLower() == "admin" ||
                    role.DisplayName.ToLower() == "branchadmin" ||
                    role.DisplayName.ToLower() == "superadmin")
                .Select(role => role.RoleID)
                .ToListAsync();

            if (adminRoleIds.Count == 0)
            {
                return 0;
            }

            var adminUsers = await _context.Users
                .AsNoTracking()
                .Where(user => user.IsActive && adminRoleIds.Contains(user.RoleID))
                .Select(user => user.UserID)
                .Distinct()
                .ToListAsync();

            if (adminUsers.Count == 0)
            {
                return 0;
            }

            var now = DateTime.UtcNow;
            var notifications = adminUsers.Select(userId => new Notification
            {
                UserID = userId,
                Type = string.IsNullOrWhiteSpace(type) ? "Alert" : type.Trim(),
                Message = message,
                IsRead = false,
                CreatedByUserID = createdByUserId,
                CreatedAt = now
            }).ToList();

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();

            foreach (var notification in notifications)
            {
                await _hubContext.Clients.Group($"user-{notification.UserID!.Value}")
                    .SendAsync("notify", notification);
            }

            return notifications.Count;
        }
    }
}
