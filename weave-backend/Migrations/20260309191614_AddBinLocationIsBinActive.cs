using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace weave_erp_backend_api.Migrations
{
    /// <inheritdoc />
    public partial class AddBinLocationIsBinActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsBinActive",
                table: "BinLocation",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsBinActive",
                table: "BinLocation");
        }
    }
}
