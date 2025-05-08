namespace UserAPI_BLL.Services.Interfaces;

public interface IRecommendationService
{
    Task<List<long>> GetUserRecommendationAsync(
        long userId,
        CancellationToken cancellationToken);
}