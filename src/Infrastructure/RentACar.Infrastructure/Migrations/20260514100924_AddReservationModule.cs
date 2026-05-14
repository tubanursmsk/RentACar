using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentACar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReservationModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AdditionalProductsTotal",
                table: "Rentals",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "DriverAddress",
                table: "Rentals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DriverBirthDate",
                table: "Rentals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DriverEmail",
                table: "Rentals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DriverFirstName",
                table: "Rentals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DriverIdentityNumber",
                table: "Rentals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DriverLastName",
                table: "Rentals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DriverLicenseNumber",
                table: "Rentals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DriverPhone",
                table: "Rentals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "InsurancePackageId",
                table: "Rentals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "InsuranceTotal",
                table: "Rentals",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SubTotal",
                table: "Rentals",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "AdditionalProducts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DailyPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IconName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsQuantityBased = table.Column<bool>(type: "bit", nullable: false),
                    MaxQuantity = table.Column<int>(type: "int", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "DATEADD(HOUR, 3, GETUTCDATE())"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "DATEADD(HOUR, 3, GETUTCDATE())"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdditionalProducts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InsurancePackages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DailyPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsRecommended = table.Column<bool>(type: "bit", nullable: false),
                    FeaturesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "DATEADD(HOUR, 3, GETUTCDATE())"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "DATEADD(HOUR, 3, GETUTCDATE())"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InsurancePackages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RentalId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Method = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    IyzicoPaymentId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IyzicoConversationId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CardLastFourDigits = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CardHolderName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CardAssociation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CardFamily = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BinNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FailureReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "DATEADD(HOUR, 3, GETUTCDATE())"),
                    ResponseJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "DATEADD(HOUR, 3, GETUTCDATE())"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "DATEADD(HOUR, 3, GETUTCDATE())"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Rentals_RentalId",
                        column: x => x.RentalId,
                        principalTable: "Rentals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RentalAdditionalProducts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RentalId = table.Column<int>(type: "int", nullable: false),
                    AdditionalProductId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "DATEADD(HOUR, 3, GETUTCDATE())"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "DATEADD(HOUR, 3, GETUTCDATE())"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalAdditionalProducts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RentalAdditionalProducts_AdditionalProducts_AdditionalProductId",
                        column: x => x.AdditionalProductId,
                        principalTable: "AdditionalProducts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RentalAdditionalProducts_Rentals_RentalId",
                        column: x => x.RentalId,
                        principalTable: "Rentals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Rentals_InsurancePackageId",
                table: "Rentals",
                column: "InsurancePackageId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_RentalId",
                table: "Payments",
                column: "RentalId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalAdditionalProducts_AdditionalProductId",
                table: "RentalAdditionalProducts",
                column: "AdditionalProductId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalAdditionalProducts_RentalId",
                table: "RentalAdditionalProducts",
                column: "RentalId");

            migrationBuilder.AddForeignKey(
                name: "FK_Rentals_InsurancePackages_InsurancePackageId",
                table: "Rentals",
                column: "InsurancePackageId",
                principalTable: "InsurancePackages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rentals_InsurancePackages_InsurancePackageId",
                table: "Rentals");

            migrationBuilder.DropTable(
                name: "InsurancePackages");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "RentalAdditionalProducts");

            migrationBuilder.DropTable(
                name: "AdditionalProducts");

            migrationBuilder.DropIndex(
                name: "IX_Rentals_InsurancePackageId",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "AdditionalProductsTotal",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "DriverAddress",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "DriverBirthDate",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "DriverEmail",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "DriverFirstName",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "DriverIdentityNumber",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "DriverLastName",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "DriverLicenseNumber",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "DriverPhone",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "InsurancePackageId",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "InsuranceTotal",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "SubTotal",
                table: "Rentals");
        }
    }
}
