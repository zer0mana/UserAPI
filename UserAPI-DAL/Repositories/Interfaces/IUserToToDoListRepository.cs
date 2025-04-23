using UserAPI_DAL.Models;

namespace UserAPI_DAL.Repositories.Interfaces;

public interface IUserToToDoListRepository
{
    Task<long> Create(long userId, long taskId, CancellationToken cancellationToken);
    
    Task<List<UserToToDoList>> GetByUserId(long userId, CancellationToken cancellationToken);
}