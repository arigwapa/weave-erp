using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/budgets")]
    public class BudgetsController : GenericCrudController<Budget>
    {
        private readonly AppDbContext _context;

        public BudgetsController(AppDbContext context) : base(context, "BudgetID")
        {
            _context = context;
        }

        [HttpGet("approved")]
        public async Task<ActionResult<IEnumerable<Budget>>> GetApproved()
        {
            var items = await _context.Budgets
                .AsNoTracking()
                .Where(x => x.Status == "Approved")
                .ToListAsync();
            return Ok(items);
        }

        [HttpGet("approvals")]
        public async Task<ActionResult<IEnumerable<Budget>>> GetApprovals([FromQuery] string? status = null)
        {
            var items = await _context.Budgets.AsNoTracking().ToListAsync();
            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalized = NormalizeBudgetStatus(status);
                items = items
                    .Where(x => NormalizeBudgetStatus(x.Status) == normalized)
                    .ToList();
            }

            return Ok(items);
        }

        [HttpPost("{id:int}/submit")]
        public async Task<ActionResult<Budget>> Submit(int id)
        {
            var item = await _context.Budgets.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            var status = NormalizeBudgetStatus(item.Status);
            if (status != "Draft" && status != "Revised")
            {
                return BadRequest($"Budget cannot be submitted from status '{item.Status}'.");
            }

            item.Status = "Submitted";
            item.SubmittedAt = DateTime.UtcNow;
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        [HttpPost("{id:int}/approve")]
        public async Task<ActionResult<Budget>> Approve(int id)
        {
            var item = await _context.Budgets.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            var status = NormalizeBudgetStatus(item.Status);
            if (status != "Submitted")
            {
                return BadRequest($"Budget cannot be approved from status '{item.Status}'.");
            }

            item.Status = "Approved";
            item.ApprovedAt = DateTime.UtcNow;
            item.RejectionReason = null;
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        [HttpPost("{id:int}/reject")]
        public async Task<ActionResult<Budget>> Reject(int id, [FromBody] RejectBudgetDto dto)
        {
            var reason = (dto?.Reason ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(reason))
            {
                return BadRequest("Rejection reason is required.");
            }

            var item = await _context.Budgets.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            var status = NormalizeBudgetStatus(item.Status);
            if (status != "Submitted")
            {
                return BadRequest($"Budget cannot be rejected from status '{item.Status}'.");
            }

            item.Status = "Rejected";
            item.RejectionReason = reason;
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        [HttpPost("{id:int}/revise")]
        public async Task<ActionResult<Budget>> Revise(int id)
        {
            var item = await _context.Budgets.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            var status = NormalizeBudgetStatus(item.Status);
            if (status != "Rejected")
            {
                return BadRequest($"Budget cannot be revised from status '{item.Status}'.");
            }

            item.Status = "Revised";
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        private static string NormalizeBudgetStatus(string? status)
        {
            var key = (status ?? string.Empty).Trim().Replace(" ", string.Empty).ToLowerInvariant();
            return key switch
            {
                "draft" => "Draft",
                "submitted" => "Submitted",
                "pendingapproval" => "Submitted",
                "rejected" => "Rejected",
                "revised" => "Revised",
                "approved" => "Approved",
                _ => status?.Trim() ?? string.Empty
            };
        }
    }

    public class RejectBudgetDto
    {
        public string? Reason { get; set; }
    }
}
