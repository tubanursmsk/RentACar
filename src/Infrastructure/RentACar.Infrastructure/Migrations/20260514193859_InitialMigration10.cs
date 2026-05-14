using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentACar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration10 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_AdditionalServices",
                table: "AdditionalServices");

            migrationBuilder.RenameTable(
                name: "AdditionalServices",
                newName: "AdditionalService");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AdditionalService",
                table: "AdditionalService",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_AdditionalService",
                table: "AdditionalService");

            migrationBuilder.RenameTable(
                name: "AdditionalService",
                newName: "AdditionalServices");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AdditionalServices",
                table: "AdditionalServices",
                column: "Id");
        }
    }
}
