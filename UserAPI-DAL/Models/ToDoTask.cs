using LinqToDB.Mapping;

namespace UserAPI_DAL.Models;

[Table("to_do_task")]
public class ToDoTask
{
    [PrimaryKey]
    [Identity]
    [Column("id")]
    public long Id { get; set; }
    
    [Column("to_do_task_list_id")]
    [NotNull]
    public long ToDoTaskListId { get; set; }
    
    [Column("title")]
    [NotNull]
    public string Title { get; set; } = string.Empty;
    
    [Column("description")]
    [Nullable]
    public string? Description { get; set; }
    
    [Column("priority")]
    [NotNull]
    public string Priority { get; set; } = "medium";
    
    [Column("due_date")]
    [Nullable]
    public DateTime? DueDate { get; set; }
    
    [Column("points")]
    [NotNull]
    public int Points { get; set; } = 0;
    
    [Column("is_penalty")]
    [NotNull]
    public bool IsPenalty { get; set; } = true;
    
    [Column("image_data")]
    [Nullable]
    public byte[]? ImageData { get; set; }
    
    [Column("image_mime_type")]
    [Nullable]
    public string? ImageMimeType { get; set; }
    
    public bool Completed { get; set; }
}