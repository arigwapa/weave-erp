using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin,SuperAdmin,QAManager,PQA")]
    [Route("api/analytics")]
    public class AnalyticsController : ControllerBase
    {
        private readonly GeminiReportService _geminiReportService;

        public AnalyticsController(GeminiReportService geminiReportService)
        {
            _geminiReportService = geminiReportService;
        }

        [HttpPost("executive-report")]
        public async Task<IActionResult> GenerateExecutiveReport([FromBody] ExecutiveReportRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var reportText = await _geminiReportService.GenerateExecutiveReportAsync(
                    request.From,
                    request.To,
                    request.Focus,
                    cancellationToken);

                return Ok(new ExecutiveReportResponse
                {
                    ReportText = reportText
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class ExecutiveReportRequest
    {
        public string? From { get; set; }
        public string? To { get; set; }
        public string? Focus { get; set; }
    }

    public class ExecutiveReportResponse
    {
        [JsonPropertyName("reportText")]
        public string ReportText { get; set; } = string.Empty;
    }
}
