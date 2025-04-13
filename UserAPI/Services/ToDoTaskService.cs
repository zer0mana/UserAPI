using UserAPI.Models;

namespace UserAPI.Services;

public interface IToDoTaskService
{
    Task<List<ToDoList>> GetTaskListsAsync(long userId);
    Task<ToDoList?> GetTaskListAsync(long taskListId, int userDayNumber);
    Task<List<ToDoList>> GetRecommendedTaskListsAsync(long userId);
    Task<ToDoList> CreateTaskListAsync(long userId, string title, string? description);
    Task<ToDoList> UpdateTaskListAsync(long taskListId, string title, string? description);
    Task<bool> MarkTaskCompletedAsync(long taskListId, long taskId);
    Task<ToDoTask> CreateTaskAsync(long taskListId, string title, string? description, string priority, DateTime? dueDate);
}

public class ToDoTaskService : IToDoTaskService
{
    // В реальном приложении здесь будет доступ к базе данных
    private static readonly List<ToDoList> _taskLists = new();
    private static readonly List<ToDoTask> _tasks = new();
    private static long _nextTaskListId = 1;
    private static long _nextTaskId = 1;

    public Task<List<ToDoList>> GetTaskListsAsync(long userId)
    {
        var userTaskLists = _taskLists.Where(tl => tl.UserId == userId).ToList();
        return Task.FromResult(userTaskLists);
    }

    public Task<ToDoList?> GetTaskListAsync(long taskListId, int userDayNumber)
    {
        var taskList = _taskLists.FirstOrDefault(tl => tl.Id == taskListId);
        if (taskList != null)
        {
            taskList.ToDoTasks = _tasks.Where(t => t.ToDoTaskListId == taskListId).ToList();
        }
        return Task.FromResult(taskList);
    }

    public Task<List<ToDoList>> GetRecommendedTaskListsAsync(long userId)
    {
        // В реальном приложении здесь будет логика рекомендаций
        var recommendedTaskLists = _taskLists
            .Where(tl => tl.UserId != userId)
            .Take(5)
            .ToList();
        return Task.FromResult(recommendedTaskLists);
    }

    public Task<ToDoList> CreateTaskListAsync(long userId, string title, string? description)
    {
        var taskList = new ToDoList
        {
            Id = _nextTaskListId++,
            Title = title,
            Description = description,
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        };
        _taskLists.Add(taskList);
        return Task.FromResult(taskList);
    }

    public Task<ToDoList> UpdateTaskListAsync(long taskListId, string title, string? description)
    {
        var taskList = _taskLists.FirstOrDefault(tl => tl.Id == taskListId);
        if (taskList == null)
        {
            throw new KeyNotFoundException($"TaskList with ID {taskListId} not found");
        }

        taskList.Title = title;
        taskList.Description = description;
        return Task.FromResult(taskList);
    }

    public Task<bool> MarkTaskCompletedAsync(long taskListId, long taskId)
    {
        var task = _tasks.FirstOrDefault(t => t.ToDoTaskListId == taskListId && t.Id == taskId);
        if (task == null)
        {
            return Task.FromResult(false);
        }

        task.Completed = !task.Completed;
        return Task.FromResult(true);
    }

    public Task<ToDoTask> CreateTaskAsync(long taskListId, string title, string? description, string priority, DateTime? dueDate)
    {
        var task = new ToDoTask
        {
            Id = _nextTaskId++,
            Title = title,
            Description = description,
            Priority = priority,
            DueDate = dueDate,
            ToDoTaskListId = taskListId
        };
        _tasks.Add(task);
        return Task.FromResult(task);
    }
} 