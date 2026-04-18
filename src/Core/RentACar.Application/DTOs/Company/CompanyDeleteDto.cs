using System;
using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Company;

    public class CompanyDeleteDto
    {
        [Required]
        public int Id { get; set; }

        public bool IsDeleted { get; set; } = true;
    }

