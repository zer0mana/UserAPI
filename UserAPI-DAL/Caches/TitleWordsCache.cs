using UserAPI_DAL.Caches.Interfaces;

namespace UserAPI_DAL.Caches;

public class TitleWordsCache : ITitleWordsCache
{
    private Dictionary<string, Stack<long>> _titleWordsCache = new();
    
    public Task RefreshAsync(CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public void AddTitleWord(long toDoListId, string[] words)
    {
        foreach (var word in words)
        {
            if (_titleWordsCache.TryGetValue(word, out var currentValue))
            {
                currentValue.Push(toDoListId);
            }
            else
            {
                var stack = new Stack<long>();
                stack.Push(toDoListId);
                _titleWordsCache[word] = stack;
            }
        }
        
        Console.WriteLine($"cache {_titleWordsCache.Count}");
    }

    public List<long> GetMatchedToDoLists(string[] words)
    {
        var matchedToDoLists = new Dictionary<long, int>();

        foreach (var word in words)
        {
            if (_titleWordsCache.TryGetValue(word, out var toDoLists))
            {
                foreach (var toDoList in toDoLists)
                {
                    if (matchedToDoLists.TryGetValue(toDoList, out int currentValue))
                    {
                        matchedToDoLists[toDoList] = currentValue + 1;
                    }
                    else
                    {
                        matchedToDoLists[toDoList] = 1;
                    }
                }
            }
        }
        
        var sortedToDoLists = matchedToDoLists
            .OrderByDescending(kvp => kvp.Value)
            .Select(kvp => kvp.Key)
            .ToList();
        
        return sortedToDoLists.Take(15).ToList();
    }
}