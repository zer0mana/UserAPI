namespace UserAPI_DAL.Caches.Interfaces;

public interface ITitleWordsCache : ICache
{
    void AddTitleWord(long toDoListId, string[] words);
    
    List<long> GetMatchedToDoLists(string[] words);
}