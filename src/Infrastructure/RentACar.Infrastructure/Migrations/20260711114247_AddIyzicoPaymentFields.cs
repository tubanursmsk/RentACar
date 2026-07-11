using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentACar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIyzicoPaymentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ResponseJson",
                table: "Payments",
                newName: "PaymentTransactionId");

            migrationBuilder.RenameColumn(
                name: "PaidAt",
                table: "Payments",
                newName: "RefundedDate");

            migrationBuilder.RenameColumn(
                name: "FailureReason",
                table: "Payments",
                newName: "MaskedCardNumber");

            migrationBuilder.RenameColumn(
                name: "CardLastFourDigits",
                table: "Payments",
                newName: "ErrorMessage");

            migrationBuilder.RenameColumn(
                name: "BinNumber",
                table: "Payments",
                newName: "ErrorCode");

            migrationBuilder.AddColumn<string>(
                name: "CardType",
                table: "Payments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedDate",
                table: "Payments",
                type: "datetime2",
                nullable: true,
                defaultValueSql: "DATEADD(HOUR, 3, GETUTCDATE())");

            migrationBuilder.AddColumn<string>(
                name: "ConversationId",
                table: "Payments",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CardType",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "CompletedDate",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "ConversationId",
                table: "Payments");

            migrationBuilder.RenameColumn(
                name: "RefundedDate",
                table: "Payments",
                newName: "PaidAt");

            migrationBuilder.RenameColumn(
                name: "PaymentTransactionId",
                table: "Payments",
                newName: "ResponseJson");

            migrationBuilder.RenameColumn(
                name: "MaskedCardNumber",
                table: "Payments",
                newName: "FailureReason");

            migrationBuilder.RenameColumn(
                name: "ErrorMessage",
                table: "Payments",
                newName: "CardLastFourDigits");

            migrationBuilder.RenameColumn(
                name: "ErrorCode",
                table: "Payments",
                newName: "BinNumber");
        }
    }
}
