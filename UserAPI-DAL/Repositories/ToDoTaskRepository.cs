using LinqToDB;
using UserAPI_DAL.LinqToDb;
using UserAPI_DAL.Models;
using UserAPI_DAL.Repositories.Interfaces;

namespace UserAPI_DAL.Repositories;

public class ToDoTaskRepository : IToDoTaskRepository
{
    private readonly ApplicationDbContext _context;

    public ToDoTaskRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<ToDoTask>> GetByToDoListIdAsync(long toDoListId, CancellationToken cancellationToken)
    {
        return await _context.ToDoTaskQuery
            .Where(t => t.ToDoTaskListId == toDoListId)
            .ToListAsync(cancellationToken);
    }

    public async Task<long> CreateAsync(ToDoTask toDoTask, CancellationToken cancellationToken)
    {
        var id = await _context.ToDoTaskQuery.InsertWithInt64IdentityAsync(
            () => new ToDoTask
            {
                ToDoTaskListId = toDoTask.ToDoTaskListId,
                Title = toDoTask.Title,
                Description = toDoTask.Description,
                Priority = toDoTask.Priority,
                DueDate = toDoTask.DueDate,
                Points = toDoTask.Points,
                IsPenalty = toDoTask.IsPenalty,
                ImageData = toDoTask.ImageData,
                ImageMimeType = toDoTask.ImageMimeType
            }, 
            cancellationToken);
        
        return id;
    }
}