using LinqToDB.Mapping;

namespace UserAPI_DAL.Models;

[Table("user_to_do_task_event")]
public class UserToDoTaskEvent
{
    [PrimaryKey]
    [Identity]
    [Column("id")]
    public long Id { get; set; }
    
    [Column("user_id")]
    [NotNull]
    public long UserId { get; set; }
    
    [Column("to_do_list_id")]
    [NotNull]
    public long ToDoListId { get; set; }

    [Column("to_do_task_id")]
    [NotNull]
    public long ToDoTaskId { get; set; }
    
    [Column("day_number")]
    [NotNull]
    public int DayNumber { get; set; }
    
    [Column("is_completed")]
    [NotNull]
    public bool IsCompleted { get; set; }
}