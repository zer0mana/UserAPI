namespace UserAPI.Models;

public class ToDoTask
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool Completed { get; set; }
    public string Priority { get; set; } = "medium";
    public DateTime? DueDate { get; set; }
    public long ToDoTaskListId { get; set; }
}