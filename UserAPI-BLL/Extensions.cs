using Microsoft.Extensions.DependencyInjection;
using UserAPI_BLL.Services;
using UserAPI_BLL.Services.Interfaces;

namespace UserAPI_BLL;

public static class Extensions
{
    public static IServiceCollection AddBll(this IServiceCollection services)
    {
        services.AddSingleton<IAuthService, AuthService>();
        services.AddSingleton<IToDoTaskService, ToDoTaskService>();
        services.AddSingleton<IRecommendationService, RecommendationService>();

        return services;
    }
}