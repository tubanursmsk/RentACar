using System;
using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.User;

    public class UserDeleteDto
    {
        [Required]
        public int Id { get; set; }

        public bool IsDeleted { get; set; } = true;
    }

