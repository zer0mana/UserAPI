using UserAPI_DAL.Models;
using UserAPI_DAL.Repositories.Interfaces;

namespace UserAPI_BLL.Services;

public interface IToDoTaskService
{
    Task<List<ToDoList>> GetTaskListsAsync(long[] ids);
    Task<List<ToDoList>> GetTaskListsAsync(long userId);
    Task<ToDoList?> GetTaskListAsync(long userId, long taskListId, int userDayNumber);
    Task<List<ToDoList>> GetRecommendedTaskListsAsync(long userId);
    Task<ToDoList> CreateTaskListAsync(long userId, string title, string? description, int requiredPoints, byte[]? imageData, string? imageMimeType);
    Task<ToDoList> UpdateTaskListAsync(long taskListId, string title, string? description, int requiredPoints, byte[]? imageData, string? imageMimeType);
    Task<bool> DeleteTaskListAsync(long taskListId);
    Task<bool> MarkTaskCompletedAsync(long userId, long taskListId, long taskId);
    Task<ToDoTask> CreateTaskAsync(long taskListId, string title, string? description, string priority, DateTime? dueDate, int points, bool isPenalty, byte[]? imageData, string? imageMimeType);
    Task<bool> DeleteTaskAsync(long taskListId, long taskId);
    Task<ToDoTask?> UpdateTaskAsync(long taskListId, long taskId, string title, string? description, string priority, DateTime? dueDate, int points, bool isPenalty, byte[]? imageData, string? imageMimeType);
    Task<bool> RequestPublicationAsync(long taskListId, long userId);
    Task<bool> UnpublishTaskListAsync(long taskListId, long userId);
}

public class ToDoTaskService : IToDoTaskService
{
    private readonly IToDoListRepository _toDoListRepository;
    private readonly IToDoTaskRepository _toDoTaskRepository;
    private readonly IUserToToDoListRepository _userToToDoListRepository;
    private readonly IUserToDoTaskEventRepository _userToDoTaskEventRepository;

    public ToDoTaskService(
        IToDoListRepository toDoListRepository,
        IToDoTaskRepository toDoTaskRepository,
        IUserToToDoListRepository userToToDoListRepository,
        IUserToDoTaskEventRepository userToDoTaskEventRepository)
    {
        _toDoListRepository = toDoListRepository;
        _toDoTaskRepository = toDoTaskRepository;
        _userToToDoListRepository = userToToDoListRepository;
        _userToDoTaskEventRepository = userToDoTaskEventRepository;
    }

    public async Task<List<ToDoList>> GetTaskListsAsync(long[] ids)
    {
        return await _toDoListRepository.GetAsync(ids, CancellationToken.None);
    }

    public async Task<List<ToDoList>> GetTaskListsAsync(long userId)
    {
        var toDoListIds = await _userToToDoListRepository.GetByUserId(
            userId,
            CancellationToken.None);
        
        var userToDoLists = await _toDoListRepository.GetAsync(
                toDoListIds.Select(x => x.ToDoListId).ToArray(),
                CancellationToken.None);

        foreach (var userToDoList in userToDoLists)
        {
            userToDoList.Streak = toDoListIds.First(x => x.ToDoListId == userToDoList.Id).Streak;
        }
        
        return userToDoLists;
    }

    public async Task<ToDoList?> GetTaskListAsync(long userId, long taskListId, int userDayNumber)
    {
        var taskList = await _toDoListRepository.GetAsync(
            taskListId,
            CancellationToken.None);
        
        if (taskList != null)
        {
            taskList.ToDoTasks = await _toDoTaskRepository.GetByToDoListIdAsync(
                taskListId,
                CancellationToken.None);

            var toDoTaskEvents = await _userToDoTaskEventRepository.GetAsync(
                userId,
                taskListId,
                userDayNumber,
                CancellationToken.None);

            foreach (var toDoTaskEvent in toDoTaskEvents)
            {
                var task = taskList.ToDoTasks.FirstOrDefault(x => x.Id == toDoTaskEvent.ToDoTaskId);
                if (task != null)
                {
                    Console.WriteLine(toDoTaskEvent.IsCompleted);
                    task.Completed = toDoTaskEvent.IsCompleted;   
                }
            }
        }

        return taskList;
    }

    public Task<List<ToDoList>> GetRecommendedTaskListsAsync(long userId)
    {
        throw new NotImplementedException();
    }

    public async Task<ToDoList> CreateTaskListAsync(long userId, string title, string? description, int requiredPoints, byte[]? imageData, string? imageMimeType)
    {
        var taskList = new ToDoList
        {
            AuthorId = userId,
            Title = title,
            Description = description,
            CreatedAt = DateTime.UtcNow,
            RequiredPoints = requiredPoints,
            ImageData = imageData,
            ImageMimeType = imageMimeType,
            PublicationStatus = "None"
        };
        
        var toDoTaskId = await _toDoListRepository.CreateAsync(taskList, CancellationToken.None);
        taskList.Id = toDoTaskId;

        await _userToToDoListRepository.Create(userId, toDoTaskId, CancellationToken.None);
        
        return taskList;
    }

    public async Task<ToDoList> UpdateTaskListAsync(long taskListId, string title, string? description, int requiredPoints, byte[]? imageData, string? imageMimeType)
    {
        var taskList = await _toDoListRepository.GetAsync(taskListId, CancellationToken.None);
        if (taskList == null)
        {
            throw new KeyNotFoundException($"TaskList with ID {taskListId} not found");
        }
        
        taskList.Title = title;
        taskList.Description = description;
        taskList.RequiredPoints = requiredPoints;
        taskList.ImageData = imageData;
        taskList.ImageMimeType = imageMimeType;

        await _toDoListRepository.UpdateAsync(taskList, CancellationToken.None);

        return taskList;
    }
    
    public async Task<bool> DeleteTaskListAsync(long taskListId)
    {
        throw new NotImplementedException();
        var taskList = await _toDoListRepository.GetAsync(taskListId, CancellationToken.None);
        if (taskList == null)
        {
            return false;
        }

        // _taskLists.Remove(taskList);
        // _tasks.RemoveAll(t => t.ToDoTaskListId == taskListId);
        return true;
    }

    public async Task<bool> MarkTaskCompletedAsync(long userId, long taskListId, long taskId)
    {
        await _userToDoTaskEventRepository.CreateOrUpdateAsync(
            new UserToDoTaskEvent
            {
                UserId = userId,
                ToDoListId = taskListId,
                ToDoTaskId = taskId,
                DayNumber = 0,
                IsCompleted = true
            },
            CancellationToken.None);
        
        return true;
    }

    public async Task<ToDoTask> CreateTaskAsync(long taskListId, string title, string? description, string priority, DateTime? dueDate, int points, bool isPenalty, byte[]? imageData, string? imageMimeType)
    {
        var task = new ToDoTask
        {
            Title = title,
            Description = description,
            Priority = priority,
            DueDate = dueDate,
            ToDoTaskListId = taskListId,
            Points = points,
            IsPenalty = isPenalty,
            ImageData = imageData,
            ImageMimeType = imageMimeType
        };
        
        var taskId = await _toDoTaskRepository.CreateAsync(task, CancellationToken.None);
        task.Id = taskId;
        
        return task;
    }
    
    public Task<bool> DeleteTaskAsync(long taskListId, long taskId)
    {
        throw new NotImplementedException();
    }

    public Task<ToDoTask?> UpdateTaskAsync(long taskListId, long taskId, string title, string? description, string priority, DateTime? dueDate, int points, bool isPenalty, byte[]? imageData, string? imageMimeType)
    {
        throw new NotImplementedException();
        
        var task = new ToDoTask();
        if (task == null)
        {
            return Task.FromResult<ToDoTask?>(null);
        }

        task.Title = title;
        task.Description = description;
        task.Priority = priority;
        task.DueDate = dueDate;
        task.Points = points;
        task.IsPenalty = isPenalty;
        if (imageData != null) 
        {
             task.ImageData = imageData;
             task.ImageMimeType = imageMimeType;
        }

        return Task.FromResult<ToDoTask?>(task);
    }

    public async Task<bool> RequestPublicationAsync(long taskListId, long userId)
    {
        throw new NotImplementedException();
        
        var taskList = await _toDoListRepository.GetAsync(taskListId, CancellationToken.None);
        // Проверяем, что список существует и принадлежит пользователю
        if (taskList == null)
        {
            return false;
        }
        // Запросить публикацию можно только если статус None или Rejected
        if (taskList.PublicationStatus == "None" || taskList.PublicationStatus == "Rejected")
        {
            taskList.PublicationStatus = "Pending";
            taskList.RejectionReason = null; // Сбрасываем причину отклонения
            Console.WriteLine($"Task list {taskListId} publication requested.");
            return true;
        }
        return false; // Нельзя запросить публикацию в других статусах
    }

    public async Task<bool> UnpublishTaskListAsync(long taskListId, long userId)
    {
        throw new NotImplementedException();
        
        var taskList = await _toDoListRepository.GetAsync(taskListId, CancellationToken.None);
        if (taskList == null)
        {
            return false;
        }
        // Снять с публикации можно только если статус Published
        if (taskList.PublicationStatus == "Published")
        {
            taskList.PublicationStatus = "None";
            Console.WriteLine($"Task list {taskListId} unpublished.");
            return true;
        }
        return false; // Нельзя снять с публикации в других статусах
    }
} 