using UserAPI_DAL.Caches.Interfaces;
using UserAPI_DAL.Repositories.Interfaces;

namespace UserAPI_DAL.Caches;

public class UserNearestNeighboursCache : IUserNearestNeighboursCache
{
    private readonly IUserToToDoListRepository _userToToDoListRepository;

    private Dictionary<long, (DateTime CachedAt, List<long> Neighbours)> _cache = new();

    public UserNearestNeighboursCache(
        IUserToToDoListRepository userToToDoListRepository)
    {
        _userToToDoListRepository = userToToDoListRepository;
    }
    
    public Task RefreshAsync(CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public async Task<List<long>> GetUserNearestNeighboursAsync(long userId, CancellationToken cancellationToken)
    {
        var cached = false;
        if (_cache.TryGetValue(userId, out var data))
        {
            cached = true;

            if (data.CachedAt.AddHours(1) > DateTime.UtcNow)
            {
                return data.Neighbours;
            }
        }
        
        var neighbours = await _userToToDoListRepository.GetUserNearestNeighboursAsync(
            userId, 
            cancellationToken);

        if (cached)
        {
            _cache[userId] = (DateTime.Now, neighbours);
        }
        else
        {
            _cache.TryAdd(userId, (DateTime.Now, neighbours));
        }
        
        return neighbours;
    }
}