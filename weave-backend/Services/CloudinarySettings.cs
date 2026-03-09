namespace weave_erp_backend_api.Services
{
    public class CloudinarySettings
    {
        public string ApiKeyName { get; set; } = string.Empty;
        public string CloudName { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string ApiSecret { get; set; } = string.Empty;
        public string ProductImageFolder { get; set; } = "weave-erp/products";
    }
}
