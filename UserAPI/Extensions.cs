using FluentMigrator.Runner;

namespace UserAPI;

public static class Extensions
{
    public static IHost MigrateUp(this IHost app)
    {
        using var scope = app.Services.CreateScope();
        var runner = scope.ServiceProvider.GetRequiredService<IMigrationRunner>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<IHost>>();
        
        var retryCount = 0;
        while (retryCount < 10)
        {
            try
            {
                logger.LogInformation("Применение миграций...");
                runner.MigrateUp();
                logger.LogInformation("Миграции успешно применены.");
                break;
            }
            catch (Exception ex) when (ex is Npgsql.NpgsqlException || ex is TimeoutException)
            {
                retryCount++;
                Thread.Sleep(5000); // Ждем 5 секунд перед повторной попыткой
            }
        }

        if (retryCount == 10)
        {
            throw new Exception("Не удалось применить миграции: база данных недоступна.");
        }
        
        return app;
    }
}