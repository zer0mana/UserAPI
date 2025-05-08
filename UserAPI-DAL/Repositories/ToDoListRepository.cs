using LinqToDB;
using LinqToDB.Tools;
using UserAPI_DAL.LinqToDb;
using UserAPI_DAL.Models;
using UserAPI_DAL.Repositories.Interfaces;

namespace UserAPI_DAL.Repositories;

public class ToDoListRepository : IToDoListRepository
{
    private readonly ApplicationDbContext _context;

    public ToDoListRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<ToDoList>> GetAsync(long[] ids, CancellationToken cancellationToken)
    {
        return await _context.ToDoListQuery
            .Where(t => t.Id.In(ids))
            .ToListAsync(cancellationToken);
    }

    public async Task<ToDoList?> GetAsync(long id, CancellationToken cancellationToken)
    {
        return await _context.ToDoListQuery
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }
    
    public async Task<List<ToDoList>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.ToDoListQuery.ToListAsync(cancellationToken);
    }

    public async Task<List<long>> GetMostPopularExceptUsersAsync(long userId, CancellationToken cancellationToken)
    {
        var userToDoListIds = await _context.UserToToDoListQuery
            .Where(ut => ut.UserId == userId)
            .Select(ut => ut.ToDoListId)
            .ToListAsync(cancellationToken);
        
        var popularListIds = await _context.UserToToDoListQuery
            .GroupBy(ut => ut.ToDoListId)
            .Where(g => !userToDoListIds.Contains(g.Key))
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .Take(10)
            .ToListAsync(cancellationToken);

        return popularListIds;
    }

    public async Task<List<long>> GetNewestExceptUsersAsync(long userId, CancellationToken cancellationToken)
    {
        var userToDoListIds = await _context.UserToToDoListQuery
            .Where(ut => ut.UserId == userId)
            .Select(ut => ut.ToDoListId)
            .ToListAsync(cancellationToken);
        
        var newestToDoListIds = await _context.ToDoListQuery
            .Where(tl => !userToDoListIds.Contains(tl.Id))
            .OrderByDescending(tl => tl.CreatedAt)
            .Select(tl => tl.Id)
            .Take(10)
            .ToListAsync(cancellationToken);

        return newestToDoListIds;
    }

    public async Task<long> CreateAsync(ToDoList toDoList, CancellationToken cancellationToken)
    {
        var id = await _context.ToDoListQuery.InsertWithInt64IdentityAsync(
            () => new ToDoList
            {
                AuthorId = toDoList.AuthorId,
                Title = toDoList.Title,
                Description = toDoList.Description,
                CreatedAt = toDoList.CreatedAt,
                RequiredPoints = toDoList.RequiredPoints,
                ImageData = toDoList.ImageData,
                ImageMimeType = toDoList.ImageMimeType,
                PublicationStatus = toDoList.PublicationStatus,
                RejectionReason = toDoList.RejectionReason
            }, 
            cancellationToken);
        
        return id;
    }

    public async Task<int> UpdateAsync(ToDoList toDoList, CancellationToken cancellationToken)
    {
        var count = await _context.ToDoListQuery
            .Where(t => t.Id == toDoList.Id)
            .Set(t => t.Title, t => toDoList.Title)
            .Set(t => t.Description, t => toDoList.Description)
            .Set(t => t.RequiredPoints, t => toDoList.RequiredPoints)
            .Set(t => t.ImageData, t => toDoList.ImageData)
            .Set(t => t.ImageMimeType, t => toDoList.ImageMimeType)
            .UpdateAsync(cancellationToken);
            
        return count;
    }
}