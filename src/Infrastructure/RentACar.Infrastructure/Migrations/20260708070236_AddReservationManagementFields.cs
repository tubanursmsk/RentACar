using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentACar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReservationManagementFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CancelReason",
                table: "Rentals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledDate",
                table: "Rentals",
                type: "datetime2",
                nullable: true,
                defaultValueSql: "DATEADD(HOUR, 3, GETUTCDATE())");

            migrationBuilder.AddColumn<string>(
                name: "ReservationCode",
                table: "Rentals",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CancelReason",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "CancelledDate",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "ReservationCode",
                table: "Rentals");
        }
    }
}
