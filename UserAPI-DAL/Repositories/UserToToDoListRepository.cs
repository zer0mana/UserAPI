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
}