using System.Text;
using System.Text.Json;
using System.Net.Http.Json;

namespace weave_erp_backend_api.Services
{
    public class GeminiReportService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public GeminiReportService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<string> GenerateExecutiveReportAsync(string? from, string? to, string? focus, CancellationToken cancellationToken)
        {
            var apiKey = _configuration["Gemini:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException("Gemini API key is not configured. Set Gemini:ApiKey in appsettings or environment variables.");
            }

            var prompt = BuildPrompt(from, to, focus);
            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.35,
                    topP = 0.9,
                    maxOutputTokens = 1200
                }
            };

            var configuredModel = NormalizeModelName(_configuration["Gemini:Model"]);
            var candidateModels = BuildCandidateModels(configuredModel);
            string? lastError = null;

            foreach (var model in candidateModels)
            {
                var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
                var response = await _httpClient.PostAsJsonAsync(endpoint, payload, cancellationToken);
                var raw = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    var text = ExtractText(raw);
                    if (string.IsNullOrWhiteSpace(text))
                    {
                        throw new InvalidOperationException("Gemini returned an empty report.");
                    }

                    return text.Trim();
                }

                lastError = $"Gemini request failed for model '{model}': {(int)response.StatusCode} {response.ReasonPhrase}. {raw}";
                if ((int)response.StatusCode == 429)
                {
                    return BuildQuotaFallbackSummary(from, to, focus);
                }

                // If model is not found, try next fallback; otherwise stop and return the upstream error.
                if ((int)response.StatusCode != 404)
                {
                    break;
                }
            }

            throw new InvalidOperationException(lastError ?? "Gemini request failed.");
        }

        private static string BuildQuotaFallbackSummary(string? from, string? to, string? focus)
        {
            var period = !string.IsNullOrWhiteSpace(from) || !string.IsNullOrWhiteSpace(to)
                ? $"{from ?? "N/A"} to {to ?? "N/A"}"
                : "current reporting window";

            var context = string.IsNullOrWhiteSpace(focus) ? "No additional context provided." : focus.Trim();
            if (context.Length > 500)
            {
                context = context[..500] + "...";
            }

            return string.Join(Environment.NewLine, new[]
            {
                "AI quota notice: Gemini usage limit has been reached, so this report is generated using a local fallback template.",
                "",
                $"Reporting Period: {period}",
                "",
                "Highlights",
                "- Core approval and inventory metrics were captured from the live dashboard snapshot.",
                "- Queue health should be reviewed with focus on BOM, budget, and QA pending counts.",
                "",
                "Risks",
                "- SLA breaches and low-stock rows (if present) may impact release timelines.",
                "- In-production stock movement should be tracked against approval bottlenecks.",
                "",
                "Recommended Actions",
                "- Re-run AI summary after quota resets or billing is updated.",
                "- Prioritize aged approvals and low-stock items for immediate triage.",
                "- Export this report snapshot for audit/governance trail.",
                "",
                $"Captured Context: {context}",
            });
        }

        private static string BuildPrompt(string? from, string? to, string? focus)
        {
            var builder = new StringBuilder();
            builder.AppendLine("You are an ERP reporting analyst.");
            builder.AppendLine("Generate a concise executive report summary in plain text for Admin users.");
            builder.AppendLine("Use clear sections: Highlights, Risks, Trends, and Recommended Actions.");
            builder.AppendLine("Keep it actionable and professional. Avoid markdown tables.");
            if (!string.IsNullOrWhiteSpace(from) || !string.IsNullOrWhiteSpace(to))
            {
                builder.AppendLine($"Date range: {from ?? "N/A"} to {to ?? "N/A"}.");
            }

            if (!string.IsNullOrWhiteSpace(focus))
            {
                builder.AppendLine($"Input context from dashboard: {focus}");
            }

            builder.AppendLine("Limit to 6-12 short bullets total.");
            return builder.ToString();
        }

        private static string ExtractText(string raw)
        {
            using var doc = JsonDocument.Parse(raw);
            if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.ValueKind != JsonValueKind.Array)
            {
                return string.Empty;
            }

            foreach (var candidate in candidates.EnumerateArray())
            {
                if (!candidate.TryGetProperty("content", out var content))
                {
                    continue;
                }

                if (!content.TryGetProperty("parts", out var parts) || parts.ValueKind != JsonValueKind.Array)
                {
                    continue;
                }

                var chunks = new List<string>();
                foreach (var part in parts.EnumerateArray())
                {
                    if (part.TryGetProperty("text", out var textNode))
                    {
                        var chunk = textNode.GetString();
                        if (!string.IsNullOrWhiteSpace(chunk))
                        {
                            chunks.Add(chunk);
                        }
                    }
                }

                if (chunks.Count > 0)
                {
                    return string.Join(Environment.NewLine, chunks);
                }
            }

            return string.Empty;
        }

        private static string NormalizeModelName(string? model)
        {
            var value = (model ?? "").Trim();
            if (value.StartsWith("models/", StringComparison.OrdinalIgnoreCase))
            {
                return value["models/".Length..];
            }
            return value;
        }

        private static List<string> BuildCandidateModels(string configuredModel)
        {
            var candidates = new List<string>();
            if (!string.IsNullOrWhiteSpace(configuredModel))
            {
                candidates.Add(configuredModel);
            }

            var fallbacks = new[]
            {
                "gemini-2.0-flash",
                "gemini-2.0-flash-lite",
                "gemini-1.5-flash-latest",
                "gemini-1.5-flash-002",
            };

            foreach (var fallback in fallbacks)
            {
                if (!candidates.Contains(fallback, StringComparer.OrdinalIgnoreCase))
                {
                    candidates.Add(fallback);
                }
            }

            return candidates;
        }
    }
}
