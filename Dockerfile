# Этап сборки
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /source

# Копируем .sln и .csproj файлы для всех проектов
COPY *.sln .
COPY UserAPI/*.csproj ./UserAPI/
COPY UserAPI-BLL/*.csproj ./UserAPI-BLL/
COPY UserAPI-DAL/*.csproj ./UserAPI-DAL/
# Добавьте сюда копирование .csproj для других проектов, если они есть

# Восстанавливаем зависимости для всех проектов
RUN dotnet restore

# Копируем весь остальной исходный код
COPY . .

# Публикуем основной проект UserAPI
WORKDIR /source/UserAPI
RUN dotnet publish -c Release -o /app

# Этап выполнения
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS final
WORKDIR /app
COPY --from=build /app .

# Указываем порт, который слушает приложение (стандартный для ASP.NET Core Kestrel)
EXPOSE 8081
# Если ваше приложение слушает другой порт, измените EXPOSE и ASPNETCORE_URLS

# Устанавливаем URL для Kestrel, чтобы он слушал на всех интерфейсах внутри контейнера
ENV ASPNETCORE_URLS=http://+:8081

# Точка входа - запуск приложения
ENTRYPOINT ["dotnet", "UserAPI.dll"] 