using LinqToDB.Mapping;

namespace UserAPI_DAL.Models;

[Table("to_do_list")]
public class ToDoList
{
    [PrimaryKey]
    [Identity]
    [Column("id")]
    public long Id { get; set; }
    
    [Column("author_id")]
    [NotNull]
    public long AuthorId { get; set; }
    
    [Column("title")]
    [NotNull]
    public string Title { get; set; } = string.Empty;
    
    [Column("description")]
    [Nullable]
    public string? Description { get; set; }
    
    [Column("created_at")]
    [NotNull]
    public DateTime CreatedAt { get; set; }
    
    [Column("required_points")]
    [NotNull]
    public int RequiredPoints { get; set; } = 0;
    
    [Column("image_data")]
    [Nullable]
    public byte[]? ImageData { get; set; }
    
    [Column("image_mime_type")]
    [Nullable]
    public string? ImageMimeType { get; set; }
    
    [Column("publication_status")]
    [NotNull]
    public string PublicationStatus { get; set; } = "None"; // None, Pending, Published, Rejected
    
    [Column("rejection_reason")]
    [Nullable]
    public string? RejectionReason { get; set; }

    public List<ToDoTask> ToDoTasks { get; set; }
    
    public long UserId { get; set; }
    
    public int Streak { get; set; }
}