namespace UserAPI_DAL.Caches.Interfaces;

public interface IUserNearestNeighboursCache : ICache
{
    Task<List<long>> GetUserNearestNeighboursAsync(
        long userId,
        CancellationToken cancellationToken);
}