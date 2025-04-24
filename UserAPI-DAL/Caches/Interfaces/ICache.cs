namespace UserAPI_DAL.Caches.Interfaces;

public interface ICache
{
    Task RefreshAsync(CancellationToken cancellationToken);
}