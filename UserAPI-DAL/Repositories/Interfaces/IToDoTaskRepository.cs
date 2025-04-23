using UserAPI_DAL.Models;

namespace UserAPI_DAL.Repositories.Interfaces;

public interface IToDoTaskRepository
{
    Task<List<ToDoTask>> GetByToDoListIdAsync(long toDoListId, CancellationToken cancellationToken);

    Task<long> CreateAsync(ToDoTask toDoTask, CancellationToken cancellationToken);
}