using UserAPI_DAL.Models;

namespace UserAPI_DAL.Repositories.Interfaces;

public interface IUserToDoTaskEventRepository
{
    Task<int> CreateOrUpdateAsync(UserToDoTaskEvent toDoTaskEvent, CancellationToken cancellationToken);

    Task<List<UserToDoTaskEvent>> GetAsync(
        long userId,
        long toDoListId,
        int dayNumber,
        CancellationToken cancellationToken);
}