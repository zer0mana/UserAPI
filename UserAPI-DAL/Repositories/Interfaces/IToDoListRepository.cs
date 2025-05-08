using UserAPI_DAL.Models;

namespace UserAPI_DAL.Repositories.Interfaces;

public interface IToDoListRepository
{
    Task<List<ToDoList>> GetAsync(long[] ids, CancellationToken cancellationToken);

    Task<ToDoList?> GetAsync(long id, CancellationToken cancellationToken);

    Task<long> CreateAsync(ToDoList toDoList, CancellationToken cancellationToken);

    Task<int> UpdateAsync(ToDoList toDoList, CancellationToken cancellationToken);

    Task<List<ToDoList>> GetAllAsync(CancellationToken cancellationToken);

    Task<List<long>> GetMostPopularExceptUsersAsync(long userId, CancellationToken cancellationToken);
    
    Task<List<long>> GetNewestExceptUsersAsync(long userId, CancellationToken cancellationToken);
}