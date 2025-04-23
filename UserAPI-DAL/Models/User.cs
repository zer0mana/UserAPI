using System.ComponentModel.DataAnnotations;
using LinqToDB.Mapping;

namespace UserAPI_DAL.Models
{
    [Table("user")]
    public class User
    {
        [PrimaryKey]
        [Identity]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [EmailAddress]
        [Column("email")]
        [NotNull]
        public string Email { get; set; }

        [Required]
        [Column("password_hash")]
        [NotNull]
        public string PasswordHash { get; set; }

        [Column("first_name")]
        public string? FirstName { get; set; }
        
        [Column("last_name")]
        public string? LastName { get; set; }
    }
} 