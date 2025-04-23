using FluentMigrator;

namespace UserAPI_DAL.Migrations;

[Migration(002, TransactionBehavior.None)]
public class InitSchema : Migration {
    public override void Up()
    {
        Create.Table("to_do_list")
            .WithColumn("id").AsInt64().PrimaryKey("to_do_list_pk").Identity() // Первичный ключ с автоинкрементом
            .WithColumn("author_id").AsInt64().NotNullable() // ID автора
            .WithColumn("title").AsString().NotNullable() // Название списка
            .WithColumn("description").AsString().Nullable() // Описание (опционально)
            .WithColumn("created_at").AsDateTimeOffset().NotNullable() // Дата создания
            .WithColumn("required_points").AsInt32().NotNullable().WithDefaultValue(0) // Необходимые баллы
            .WithColumn("image_data").AsBinary().Nullable() // Данные изображения (опционально)
            .WithColumn("image_mime_type").AsString().Nullable() // MIME-тип изображения (опционально)
            .WithColumn("publication_status").AsString().NotNullable().WithDefaultValue("None") // Статус публикации
            .WithColumn("rejection_reason").AsString().Nullable();
        
        Create.Table("to_do_task")
            .WithColumn("id").AsInt64().PrimaryKey("to_do_task_pk").Identity() // Первичный ключ с автоинкрементом
            .WithColumn("to_do_task_list_id").AsInt64().NotNullable() // Ссылка на список задач
            .WithColumn("title").AsString().NotNullable() // Название задачи
            .WithColumn("description").AsString().Nullable() // Описание задачи (опционально)
            .WithColumn("priority").AsString().NotNullable().WithDefaultValue("medium") // Приоритет (по умолчанию "medium")
            .WithColumn("due_date").AsDateTime().Nullable() // Дата выполнения (опционально)
            .WithColumn("points").AsInt32().NotNullable().WithDefaultValue(0) // Количество баллов
            .WithColumn("is_penalty").AsBoolean().NotNullable().WithDefaultValue(true) // Является ли штрафом
            .WithColumn("image_data").AsBinary().Nullable() // Данные изображения (опционально)
            .WithColumn("image_mime_type").AsString().Nullable(); // MIME-тип изображения (опционально)
        
        Create.Table("user")
            .WithColumn("id").AsInt64().PrimaryKey("user_pk").Identity() // Первичный ключ с автоинкрементом
            .WithColumn("email").AsString().NotNullable() // Email пользователя
            .WithColumn("password_hash").AsString().NotNullable() // Хэш пароля
            .WithColumn("first_name").AsString().Nullable() // Имя (опционально)
            .WithColumn("last_name").AsString().Nullable(); // Фамилия (опционально)
        
        Create.Table("user_to_do_task_event")
            .WithColumn("id").AsInt64().PrimaryKey("user_to_do_task_event_pk").Identity() // Первичный ключ с автоинкрементом
            .WithColumn("user_id").AsInt64().NotNullable() // ID пользователя
            .WithColumn("to_do_list_id").AsInt64().NotNullable() // ID списка задач
            .WithColumn("to_do_task_id").AsInt64().NotNullable() // ID задачи
            .WithColumn("day_number").AsInt32().NotNullable() // Номер дня
            .WithColumn("is_completed").AsBoolean().NotNullable();
        
        Create.Table("user_to_to_do_list")
            .WithColumn("id").AsInt64().PrimaryKey("user_to_to_do_list_pk").Identity() // Первичный ключ с автоинкрементом
            .WithColumn("user_id").AsInt64().NotNullable() // ID пользователя
            .WithColumn("to_do_list_id").AsInt64().NotNullable() // ID списка задач
            .WithColumn("streak").AsInt32().NotNullable().WithDefaultValue(0); // Серия выполнения задач
        
        Create.Index("ix_user_email").OnTable("user").OnColumn("email").Unique();
        
        Create.Index("ix_user_to_do_task_event_unique")
            .OnTable("user_to_do_task_event")
            .OnColumn("user_id").Ascending()
            .OnColumn("to_do_task_id").Ascending()
            .OnColumn("day_number").Ascending()
            .WithOptions().Unique();
    }

    public override void Down()
    {
        Delete.Index("ix_user_email").OnTable("user");
        Delete.Index("ix_user_to_do_task_event_unique").OnTable("user_to_do_task_event");
        
        Delete.Table("to_do_list");
        Delete.Table("to_do_task");
        Delete.Table("user");
        Delete.Table("user_to_do_task_event");
        Delete.Table("user_to_to_do_list");
    }
}