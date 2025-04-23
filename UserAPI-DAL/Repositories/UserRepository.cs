using LinqToDB;
using UserAPI_DAL.LinqToDb;
using UserAPI_DAL.Models;
using UserAPI_DAL.Repositories.Interfaces;

namespace UserAPI_DAL.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<long> CreateAsync(User user, CancellationToken cancellationToken)
    {
        var id = await _context.UserQuery.InsertWithInt64IdentityAsync(
            () => new User
            {
                Email = user.Email,
                PasswordHash = user.PasswordHash,
                FirstName = user.FirstName,
                LastName = user.LastName
            }, 
            cancellationToken);
        return id;
    }
    
    public async Task<User?> GetAsync(string email, CancellationToken cancellationToken)
    {
        return await _context.UserQuery
            .FirstOrDefaultAsync(user => user.Email == email, cancellationToken);
    }
}