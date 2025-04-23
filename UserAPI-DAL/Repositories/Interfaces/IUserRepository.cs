using UserAPI_DAL.Models;

namespace UserAPI_DAL.Repositories.Interfaces;

public interface IUserRepository
{
    Task<long> CreateAsync(User user, CancellationToken cancellationToken);

    Task<User?> GetAsync(string email, CancellationToken cancellationToken);
}