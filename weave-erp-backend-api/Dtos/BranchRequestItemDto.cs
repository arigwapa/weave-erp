using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class BranchRequestItemDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Request ID must be greater than 0.")]
        public int RequestID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Version ID must be greater than 0.")]
        public int VersionID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Requested quantity must be greater than 0.")]
        public int QtyRequested { get; set; }
    }
}
