using Microsoft.AspNetCore.Mvc;
using UserAPI.Models;
using UserAPI.Services;

namespace UserAPI.Controllers;

[ApiController]
[Route("pyd-user-api-handler")]
public class UserAPIHandlerController : ControllerBase
{
    private readonly IToDoTaskService _taskService;

    public UserAPIHandlerController(IToDoTaskService taskService)
    {
        _taskService = taskService;
    }

    // 8) Просмотр задачника
    [HttpGet("view-pyd/{pydId}")]
    public async Task<IActionResult> ViewPYD(long pydId, int userDayNumber)
    {
        var taskList = await _taskService.GetTaskListAsync(pydId, userDayNumber);
        if (taskList == null)
        {
            return NotFound($"TaskList with ID {pydId} not found");
        }
        return Ok(taskList);
    }

    // 9) Просмотр списка задачников
    [HttpGet("view-pyd-list")]
    public async Task<IActionResult> ViewPYDList(long userId)
    {
        var taskLists = await _taskService.GetTaskListsAsync(userId);
        return Ok(taskLists);
    }

    // 10) Получение списка задачников из ленты рекомендаций
    [HttpGet("recommended-pyd-list")]
    public async Task<IActionResult> GetRecommendedPYDList(long userId)
    {
        var recommendedTaskLists = await _taskService.GetRecommendedTaskListsAsync(userId);
        return Ok(recommendedTaskLists);
    }

    [HttpPost("create-pyd")]
    public async Task<IActionResult> CreatePYD([FromQuery] long userId, [FromBody] CreateTaskListRequest request)
    {
        var taskList = await _taskService.CreateTaskListAsync(userId, request.Title, request.Description);
        return CreatedAtAction(nameof(ViewPYD), new { pydId = taskList.Id, userDayNumber = 1 }, taskList);
    }

    // 12) Изменение задачника
    [HttpPut("update-pyd-template/{templateId}")]
    public async Task<IActionResult> UpdatePYDTemplate(long templateId, [FromBody] UpdateTaskListRequest request)
    {
        try
        {
            var taskList = await _taskService.UpdateTaskListAsync(templateId, request.Title, request.Description);
            return Ok(taskList);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"TaskList with ID {templateId} not found");
        }
    }

    // 14) Отметка о выполнении части задачника
    [HttpPost("mark-pyd-task-completed")]
    public async Task<IActionResult> MarkPYDTaskCompleted(long pydId, long taskId)
    {
        var result = await _taskService.MarkTaskCompletedAsync(pydId, taskId);
        if (!result)
        {
            return NotFound($"Task with ID {taskId} in TaskList {pydId} not found");
        }
        return Ok();
    }

    // Создание задачи в списке
    [HttpPost("create-task")]
    public async Task<IActionResult> CreateTask([FromQuery] long pydId, [FromBody] CreateTaskRequest request)
    {
        var task = await _taskService.CreateTaskAsync(pydId, request.Title, request.Description, request.Priority, request.DueDate);
        return CreatedAtAction(nameof(ViewPYD), new { pydId, userDayNumber = 1 }, task);
    }

    // Удаление списка задач
    [HttpDelete("delete-pyd")]
    public async Task<IActionResult> DeletePYD([FromQuery] long pydId, [FromQuery] long userDayNumber)
    {
        var result = await _taskService.DeleteTaskListAsync(pydId);
        if (!result)
        {
            return NotFound($"TaskList with ID {pydId} not found");
        }
        return Ok();
    }

    // Удаление задачи
    [HttpDelete("delete-task")]
    public async Task<IActionResult> DeleteTask([FromQuery] long pydId, [FromQuery] long taskId)
    {
        var result = await _taskService.DeleteTaskAsync(pydId, taskId);
        if (!result)
        {
            return NotFound($"Task with ID {taskId} in TaskList {pydId} not found");
        }
        return Ok();
    }

    // Редактирование задачи
    [HttpPut("update-task")]
    public async Task<IActionResult> UpdateTask([FromQuery] long pydId, [FromQuery] long taskId, [FromBody] UpdateTaskRequest request)
    {
        var task = await _taskService.UpdateTaskAsync(pydId, taskId, request.Title, request.Description, request.Priority, request.DueDate);
        if (task == null)
        {
            return NotFound($"Task with ID {taskId} in TaskList {pydId} not found");
        }
        return Ok(task);
    }
}

public class CreateTaskListRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateTaskListRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class CreateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "medium";
    public DateTime? DueDate { get; set; }
}

public class UpdateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "medium";
    public DateTime? DueDate { get; set; }
}