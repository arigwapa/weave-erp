using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/capa")]
    public class CapaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CapaController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<CapaDto>> Create([FromBody] CreateCapaRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var inspectionExists = await _context.Inspections.AnyAsync(x => x.InspectionID == request.InspectionID);
            if (!inspectionExists)
            {
                return BadRequest("InspectionID does not exist.");
            }

            var now = DateTime.UtcNow;
            var userId = TryGetCurrentUserId();
            var entity = new CAPA
            {
                InspectionID = request.InspectionID,
                IssueTitle = request.IssueTitle.Trim(),
                RootCause = string.IsNullOrWhiteSpace(request.RootCause) ? null : request.RootCause.Trim(),
                CorrectiveAction = string.IsNullOrWhiteSpace(request.CorrectiveAction) ? null : request.CorrectiveAction.Trim(),
                PreventiveAction = string.IsNullOrWhiteSpace(request.PreventiveAction) ? null : request.PreventiveAction.Trim(),
                ResponsibleDepartment = string.IsNullOrWhiteSpace(request.ResponsibleDepartment) ? null : request.ResponsibleDepartment.Trim(),
                ResponsibleUserID = request.ResponsibleUserID,
                DueDate = request.DueDate,
                Status = NormalizeStatus(request.Status),
                CreatedByUserID = userId,
                CreatedAt = now,
                UpdatedByUserID = userId,
                UpdatedAt = now
            };

            _context.CAPAs.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(ToDto(entity));
        }

        [HttpGet("by-inspection/{inspectionId:int}")]
        public async Task<ActionResult<IEnumerable<CapaDto>>> ByInspection(int inspectionId)
        {
            var rows = await _context.CAPAs
                .AsNoTracking()
                .Where(x => x.InspectionID == inspectionId)
                .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt)
                .Select(x => ToDto(x))
                .ToListAsync();

            return Ok(rows);
        }

        private int? TryGetCurrentUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(raw, out var parsed) ? parsed : null;
        }

        private static string NormalizeStatus(string? status)
        {
            var value = (status ?? string.Empty).Trim().ToLowerInvariant();
            return value switch
            {
                "open" => "Open",
                "in progress" => "In Progress",
                "resolved" => "Resolved",
                "closed" => "Closed",
                _ => "Open"
            };
        }

        private static CapaDto ToDto(CAPA entity)
        {
            return new CapaDto
            {
                CAPAID = entity.CAPAID,
                InspectionID = entity.InspectionID,
                IssueTitle = entity.IssueTitle,
                RootCause = entity.RootCause,
                CorrectiveAction = entity.CorrectiveAction,
                PreventiveAction = entity.PreventiveAction,
                ResponsibleDepartment = entity.ResponsibleDepartment,
                ResponsibleUserID = entity.ResponsibleUserID,
                DueDate = entity.DueDate,
                Status = entity.Status,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }
    }
}
