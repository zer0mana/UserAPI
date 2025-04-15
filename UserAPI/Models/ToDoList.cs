namespace UserAPI.Models;

public class ToDoList
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public long UserId { get; set; }
    public List<ToDoTask> ToDoTasks { get; set; } = new();
    public int TaskCount => ToDoTasks.Count;
    public int RequiredPoints { get; set; } = 0;
    public int TotalPoints => ToDoTasks.Where(t => t.Completed).Sum(t => t.Points);
    public bool IsCompleted => TotalPoints >= RequiredPoints;
}