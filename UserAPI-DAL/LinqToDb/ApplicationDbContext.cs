using LinqToDB;
using LinqToDB.Data;
using UserAPI_DAL.Models;

namespace UserAPI_DAL.LinqToDb;

public class ApplicationDbContext : DataConnection
{
    public ApplicationDbContext() : base(new DataOptions()
        .UsePostgreSQL("User ID=postgres;Password=123456;Host=localhost;Port=15432;Database=user-api;Pooling=true;"))
    {
    }

    public ITable<User> UserQuery => this.GetTable<User>();
        
    public ITable<ToDoList> ToDoListQuery => this.GetTable<ToDoList>();
        
    public ITable<ToDoTask> ToDoTaskQuery => this.GetTable<ToDoTask>();
    
    public ITable<UserToToDoList> UserToToDoListQuery => this.GetTable<UserToToDoList>();

    public ITable<UserToDoTaskEvent> UserToDoTaskEventQuery => this.GetTable<UserToDoTaskEvent>();
}