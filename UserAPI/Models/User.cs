using System.ComponentModel.DataAnnotations;

namespace UserAPI.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }
} 