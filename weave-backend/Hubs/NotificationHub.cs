using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace weave_erp_backend_api.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public async Task JoinUserGroup(int userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
        }

        public async Task JoinRegionGroup(int regionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"region-{regionId}");
        }

        public async Task JoinRoleGroup(string roleName)
        {
            var cleanRole = (roleName ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(cleanRole))
            {
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"role-{cleanRole.ToLowerInvariant()}");
        }

        public async Task SendNotification(string message)
        {
            await Clients.All.SendAsync("ReceiveNotification", message);
        }
    }
}
