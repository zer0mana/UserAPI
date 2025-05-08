using UserAPI_BLL.Services.Interfaces;
using UserAPI_DAL.Caches.Interfaces;
using UserAPI_DAL.Repositories.Interfaces;

namespace UserAPI_BLL.Services;

public class RecommendationService : IRecommendationService
{
    private readonly IUserNearestNeighboursCache _userNearestNeighboursCache;
    private readonly IToDoListRepository _toDoListRepository;
    private readonly IUserToToDoListRepository _userToToDoListRepository;

    public RecommendationService(
        IUserNearestNeighboursCache userNearestNeighboursCache,
        IToDoListRepository toDoListRepository,
        IUserToToDoListRepository userToToDoListRepository)
    {
        _userNearestNeighboursCache = userNearestNeighboursCache;
        _toDoListRepository = toDoListRepository;
        _userToToDoListRepository = userToToDoListRepository;
    }

    public async Task<List<long>> GetUserRecommendationAsync(long userId, CancellationToken cancellationToken)
    {
        var recommendations = new List<long>();
        
        recommendations.AddRange(await RecommendByNearestNeighbourAsync(userId, cancellationToken));
        recommendations.AddRange(await RecommendByMostPopularToDoListsAsync(userId, cancellationToken));
        recommendations.AddRange(await RecommendByNewestToDoListsAsync(userId, cancellationToken));
        
        recommendations = recommendations.Distinct().ToList();
        
        return recommendations;
    }

    private async Task<List<long>> RecommendByNearestNeighbourAsync(
        long userId,
        CancellationToken cancellationToken)
    {
        var neighbours = await _userNearestNeighboursCache.GetUserNearestNeighboursAsync(
            userId, 
            cancellationToken);

        return new List<long>();
    }

    private Task<List<long>> RecommendByMostPopularToDoListsAsync(
        long userId,
        CancellationToken cancellationToken)
    {
        return _toDoListRepository.GetMostPopularExceptUsersAsync(userId, cancellationToken);
    }

    private Task<List<long>> RecommendByNewestToDoListsAsync(
        long userId,
        CancellationToken cancellationToken)
    {
        return _toDoListRepository.GetNewestExceptUsersAsync(userId, cancellationToken);
    }
}