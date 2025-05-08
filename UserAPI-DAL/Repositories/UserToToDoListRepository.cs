using LinqToDB;
using UserAPI_DAL.LinqToDb;
using UserAPI_DAL.Models;
using UserAPI_DAL.Repositories.Interfaces;

namespace UserAPI_DAL.Repositories;

public class UserToToDoListRepository : IUserToToDoListRepository
{
    private readonly ApplicationDbContext _context;

    public UserToToDoListRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<long> Create(long userId, long taskId, CancellationToken cancellationToken)
    {
        var id = await _context.UserToToDoListQuery.InsertWithInt64IdentityAsync(
            () => new UserToToDoList
            {
                UserId = userId,
                ToDoListId = taskId,
                Streak = 0
            }, 
            cancellationToken);
        
        return id;
    }

    public async Task<List<UserToToDoList>> GetByUserId(long userId, CancellationToken cancellationToken)
    {
        return await _context.UserToToDoListQuery
            .Where(ut => ut.UserId == userId)
            .ToListAsync(cancellationToken);
    }
    
    public async Task<List<long>> GetUserNearestNeighboursAsync(long userId, CancellationToken cancellationToken)
    {
        var userToDoListIds = await _context.UserToToDoListQuery
            .Where(ut => ut.UserId == userId)
            .Select(ut => ut.ToDoListId)
            .ToListAsync(cancellationToken);

        if (!userToDoListIds.Any())
            return new List<long>();
        
        var neighbours = await _context.UserToToDoListQuery
            .Where(ut => ut.UserId != userId)
            .GroupBy(ut => ut.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                CommonLists = g.Count(ut => userToDoListIds.Contains(ut.ToDoListId)),
                TotalUserLists = g.Count(),
                UniqueDifference = userToDoListIds.Count - g.Count(ut => userToDoListIds.Contains(ut.ToDoListId))
            })
            .Select(x => new
            {
                x.UserId,
                Score = x.CommonLists - 0.5 * x.UniqueDifference
            })
            .OrderByDescending(x => x.Score)
            .Take(10)
            .Select(x => x.UserId)
            .ToListAsync(cancellationToken);

        return neighbours;
    }
}