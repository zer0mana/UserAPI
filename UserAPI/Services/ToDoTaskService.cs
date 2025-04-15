using UserAPI.Models;

namespace UserAPI.Services;

public interface IToDoTaskService
{
    Task<List<ToDoList>> GetTaskListsAsync(long userId);
    Task<ToDoList?> GetTaskListAsync(long taskListId, int userDayNumber);
    Task<List<ToDoList>> GetRecommendedTaskListsAsync(long userId);
    Task<ToDoList> CreateTaskListAsync(long userId, string title, string? description, int requiredPoints);
    Task<ToDoList> UpdateTaskListAsync(long taskListId, string title, string? description, int requiredPoints);
    Task<bool> DeleteTaskListAsync(long taskListId);
    Task<bool> MarkTaskCompletedAsync(long taskListId, long taskId);
    Task<ToDoTask> CreateTaskAsync(long taskListId, string title, string? description, string priority, DateTime? dueDate, int points);
    Task<bool> DeleteTaskAsync(long taskListId, long taskId);
    Task<ToDoTask?> UpdateTaskAsync(long taskListId, long taskId, string title, string? description, string priority, DateTime? dueDate, int points);
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
        var userTaskLists = _taskLists
            //.Where(tl => tl.UserId == userId)
            .ToList();
        
        foreach (var taskList in userTaskLists)
        {
            taskList.ToDoTasks = _tasks.Where(t => t.ToDoTaskListId == taskList.Id).ToList();
        }
        Console.WriteLine("get task lists");
        return Task.FromResult(userTaskLists);
    }

    public Task<ToDoList?> GetTaskListAsync(long taskListId, int userDayNumber)
    {
        var taskList = _taskLists.FirstOrDefault(tl => tl.Id == taskListId);
        if (taskList != null)
        {
            taskList.ToDoTasks = _tasks.Where(t => t.ToDoTaskListId == taskListId).ToList();
        }
        Console.WriteLine("get task list");
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

    public Task<ToDoList> CreateTaskListAsync(long userId, string title, string? description, int requiredPoints)
    {
        var taskList = new ToDoList
        {
            Id = _nextTaskListId++,
            Title = title,
            Description = description,
            CreatedAt = DateTime.UtcNow,
            UserId = userId,
            RequiredPoints = requiredPoints
        };
        _taskLists.Add(taskList);
        Console.WriteLine("create task list");
        return Task.FromResult(taskList);
    }

    public Task<ToDoList> UpdateTaskListAsync(long taskListId, string title, string? description, int requiredPoints)
    {
        var taskList = _taskLists.FirstOrDefault(tl => tl.Id == taskListId);
        if (taskList == null)
        {
            throw new KeyNotFoundException($"TaskList with ID {taskListId} not found");
        }

        taskList.Title = title;
        taskList.Description = description;
        taskList.RequiredPoints = requiredPoints;
        return Task.FromResult(taskList);
    }
    
    public Task<bool> DeleteTaskListAsync(long taskListId)
    {
        var taskList = _taskLists.FirstOrDefault(tl => tl.Id == taskListId);
        if (taskList == null)
        {
            return Task.FromResult(false);
        }

        _taskLists.Remove(taskList);
        _tasks.RemoveAll(t => t.ToDoTaskListId == taskListId);
        return Task.FromResult(true);
    }

    public Task<bool> MarkTaskCompletedAsync(long taskListId, long taskId)
    {
        var task = _tasks.FirstOrDefault(t => t.ToDoTaskListId == taskListId && t.Id == taskId);
        if (task == null)
        {
            return Task.FromResult(false);
        }

        task.Completed = !task.Completed;
        Console.WriteLine($"task completed {task.Completed}");
        return Task.FromResult(true);
    }

    public Task<ToDoTask> CreateTaskAsync(long taskListId, string title, string? description, string priority, DateTime? dueDate, int points)
    {
        var task = new ToDoTask
        {
            Id = _nextTaskId++,
            Title = title,
            Description = description,
            Priority = priority,
            DueDate = dueDate,
            ToDoTaskListId = taskListId,
            Points = points
        };
        _tasks.Add(task);
        Console.WriteLine("create task");
        return Task.FromResult(task);
    }
    
    public Task<bool> DeleteTaskAsync(long taskListId, long taskId)
    {
        var task = _tasks.FirstOrDefault(t => t.ToDoTaskListId == taskListId && t.Id == taskId);
        if (task == null)
        {
            return Task.FromResult(false);
        }

        _tasks.Remove(task);
        return Task.FromResult(true);
    }

    public Task<ToDoTask?> UpdateTaskAsync(long taskListId, long taskId, string title, string? description, string priority, DateTime? dueDate, int points)
    {
        var task = _tasks.FirstOrDefault(t => t.ToDoTaskListId == taskListId && t.Id == taskId);
        if (task == null)
        {
            return Task.FromResult<ToDoTask?>(null);
        }

        task.Title = title;
        task.Description = description;
        task.Priority = priority;
        task.DueDate = dueDate;
        task.Points = points;

        return Task.FromResult<ToDoTask?>(task);
    }
} 