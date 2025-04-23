using LinqToDB.Mapping;

namespace UserAPI_DAL.Models;

[Table("user_to_to_do_list")]
public class UserToToDoList
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

    [Column("streak")]
    [NotNull]
    public int Streak { get; set; }
}