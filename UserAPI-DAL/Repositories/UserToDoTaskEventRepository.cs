using LinqToDB;
using UserAPI_DAL.LinqToDb;
using UserAPI_DAL.Models;
using UserAPI_DAL.Repositories.Interfaces;

namespace UserAPI_DAL.Repositories;

public class UserToDoTaskEventRepository : IUserToDoTaskEventRepository
{
    private readonly ApplicationDbContext _context;

    public UserToDoTaskEventRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<int> CreateOrUpdateAsync(UserToDoTaskEvent toDoTaskEvent, CancellationToken cancellationToken)
    {
        var id = await _context.UserToDoTaskEventQuery.Merge()
            .Using(new[] { toDoTaskEvent })
            .On((target, source) => 
                target.UserId == source.UserId 
                && target.ToDoTaskId == source.ToDoTaskId 
                && target.DayNumber == source.DayNumber)
            .InsertWhenNotMatched(source => new UserToDoTaskEvent
            {
                UserId = source.UserId,
                ToDoListId = source.ToDoListId,
                ToDoTaskId = source.ToDoTaskId,
                DayNumber = source.DayNumber,
                IsCompleted = source.IsCompleted
            })
            .UpdateWhenMatched((target, source) => new UserToDoTaskEvent
            {
                UserId = target.UserId,
                ToDoListId = target.ToDoListId,
                ToDoTaskId = target.ToDoTaskId,
                DayNumber = target.DayNumber,
                IsCompleted = !target.IsCompleted
            })
            .MergeAsync(cancellationToken);
        
        return id;
    }

    public async Task<List<UserToDoTaskEvent>> GetAsync(
        long userId,
        long toDoListId,
        int dayNumber,
        CancellationToken cancellationToken)
    {
        return await _context.UserToDoTaskEventQuery
            .Where(t => 
                t.UserId == userId 
                && t.ToDoListId == toDoListId 
                && t.DayNumber == dayNumber)
            .ToListAsync(cancellationToken);
    }
}