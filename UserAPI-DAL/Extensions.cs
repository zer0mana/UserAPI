using FluentMigrator.Runner;
using Microsoft.Extensions.DependencyInjection;
using UserAPI_DAL.LinqToDb;
using UserAPI_DAL.Repositories;
using UserAPI_DAL.Repositories.Interfaces;

namespace UserAPI_DAL;

public static class Extensions
{
    public static IServiceCollection AddDal(this IServiceCollection services)
    {
        services.AddSingleton<ApplicationDbContext>();
        services.AddSingleton<IToDoListRepository, ToDoListRepository>();
        services.AddSingleton<IToDoTaskRepository, ToDoTaskRepository>();
        services.AddSingleton<IUserRepository, UserRepository>();
        services.AddSingleton<IUserToToDoListRepository, UserToToDoListRepository>();
        services.AddSingleton<IUserToDoTaskEventRepository, UserToDoTaskEventRepository>();
        
        services.AddFluentMigratorCore()
            .ConfigureRunner(rb => rb.AddPostgres()
                .WithGlobalConnectionString(s =>
                    "User ID=postgres;Password=123456;Host=localhost;Port=15432;Database=user-api;Pooling=true;")
                .ScanIn(typeof(Extensions).Assembly).For.Migrations()
            )
            .AddLogging(lb => lb.AddFluentMigratorConsole());

        return services;
    }
}