using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/uploads")]
    public class UploadsController : ControllerBase
    {
        private readonly CloudinarySettings _cloudinary;

        public UploadsController(IOptions<CloudinarySettings> cloudinaryOptions)
        {
            _cloudinary = cloudinaryOptions.Value;
        }

        [HttpPost("cloudinary-signature")]
        public ActionResult<CloudinarySignatureResponseDto> CreateCloudinarySignature([FromBody] CloudinarySignatureRequestDto? request)
        {
            if (string.IsNullOrWhiteSpace(_cloudinary.CloudName) ||
                string.IsNullOrWhiteSpace(_cloudinary.ApiKey) ||
                string.IsNullOrWhiteSpace(_cloudinary.ApiSecret))
            {
                return StatusCode(500, new { message = "Cloudinary is not configured on the server." });
            }

            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var folder = string.IsNullOrWhiteSpace(request?.Folder)
                ? _cloudinary.ProductImageFolder
                : request!.Folder!.Trim();

            var toSign = new SortedDictionary<string, string>
            {
                ["folder"] = folder,
                ["timestamp"] = timestamp.ToString()
            };

            if (!string.IsNullOrWhiteSpace(request?.PublicId))
            {
                toSign["public_id"] = request!.PublicId!.Trim();
            }

            var signaturePayload = string.Join("&", toSign.Select(kv => $"{kv.Key}={kv.Value}"));
            var signature = ComputeSha1Hex($"{signaturePayload}{_cloudinary.ApiSecret}");

            return Ok(new CloudinarySignatureResponseDto
            {
                CloudName = _cloudinary.CloudName,
                ApiKey = _cloudinary.ApiKey,
                Timestamp = timestamp,
                Folder = folder,
                PublicId = toSign.TryGetValue("public_id", out var value) ? value : null,
                Signature = signature
            });
        }

        private static string ComputeSha1Hex(string input)
        {
            var bytes = Encoding.UTF8.GetBytes(input);
            using var sha1 = SHA1.Create();
            var hash = sha1.ComputeHash(bytes);
            return Convert.ToHexString(hash).ToLowerInvariant();
        }
    }

    public class CloudinarySignatureRequestDto
    {
        public string? Folder { get; set; }
        public string? PublicId { get; set; }
    }

    public class CloudinarySignatureResponseDto
    {
        public string CloudName { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public long Timestamp { get; set; }
        public string Folder { get; set; } = string.Empty;
        public string? PublicId { get; set; }
        public string Signature { get; set; } = string.Empty;
    }
}
