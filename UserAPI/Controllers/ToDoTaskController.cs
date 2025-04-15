using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserAPI.Services;

namespace UserAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ToDoTaskController : ControllerBase
    {
        private readonly IToDoTaskService _taskService;

        public ToDoTaskController(IToDoTaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet("lists")]
        public async Task<IActionResult> GetTaskLists()
        {
            Console.WriteLine("get tasks");
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var taskLists = await _taskService.GetTaskListsAsync(userId);
            return Ok(taskLists);
        }

        [HttpGet("lists/{taskListId}")]
        public async Task<IActionResult> GetTaskList(long taskListId)
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var taskList = await _taskService.GetTaskListAsync(taskListId, 0);
            if (taskList == null)
                // || taskList.UserId != userId)
            {
                return NotFound();
            }
            return Ok(taskList);
        }

        [HttpGet("lists/recommended")]
        public async Task<IActionResult> GetRecommendedTaskLists()
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var taskLists = await _taskService.GetRecommendedTaskListsAsync(userId);
            return Ok(taskLists);
        }

        [HttpPost("lists")]
        public async Task<IActionResult> CreateTaskList([FromBody] CreateTaskListRequest request)
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var taskList = await _taskService.CreateTaskListAsync(userId, request.Title, request.Description, request.RequiredPoints);
            return CreatedAtAction(nameof(GetTaskList), new { taskListId = taskList.Id }, taskList);
        }

        [HttpPut("lists/{taskListId}")]
        public async Task<IActionResult> UpdateTaskList(long taskListId, [FromBody] UpdateTaskListRequest request)
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var taskList = await _taskService.GetTaskListAsync(taskListId, 0);
            if (taskList == null || taskList.UserId != userId)
            {
                return NotFound();
            }

            var updatedTaskList = await _taskService.UpdateTaskListAsync(taskListId, request.Title, request.Description, request.RequiredPoints);
            return Ok(updatedTaskList);
        }

        [HttpDelete("lists/{taskListId}")]
        public async Task<IActionResult> DeleteTaskList(long taskListId)
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var taskList = await _taskService.GetTaskListAsync(taskListId, 0);
            if (taskList == null || taskList.UserId != userId)
            {
                return NotFound();
            }

            var result = await _taskService.DeleteTaskListAsync(taskListId);
            return result ? NoContent() : NotFound();
        }

        [HttpPost("lists/{taskListId}/tasks")]
        public async Task<IActionResult> CreateTask(long taskListId, [FromBody] CreateTaskRequest request)
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var taskList = await _taskService.GetTaskListAsync(taskListId, 0);
            if (taskList == null || taskList.UserId != userId)
            {
                return NotFound();
            }

            var task = await _taskService.CreateTaskAsync(taskListId, request.Title, request.Description, request.Priority, request.DueDate, request.Points);
            return CreatedAtAction(nameof(GetTaskList), new { taskListId }, task);
        }

        [HttpPut("lists/{taskListId}/tasks/{taskId}")]
        public async Task<IActionResult> UpdateTask(long taskListId, long taskId, [FromBody] UpdateTaskRequest request)
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var taskList = await _taskService.GetTaskListAsync(taskListId, 0);
            if (taskList == null || taskList.UserId != userId)
            {
                return NotFound();
            }

            var task = await _taskService.UpdateTaskAsync(
                taskListId,
                taskId,
                request.Title,
                request.Description,
                request.Priority,
                request.DueDate,
                request.Points);
            return task != null ? Ok(task) : NotFound();
        }

        [HttpDelete("lists/{taskListId}/tasks/{taskId}")]
        public async Task<IActionResult> DeleteTask(long taskListId, long taskId)
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var taskList = await _taskService.GetTaskListAsync(taskListId, 0);
            if (taskList == null || taskList.UserId != userId)
            {
                return NotFound();
            }

            var result = await _taskService.DeleteTaskAsync(taskListId, taskId);
            return result ? NoContent() : NotFound();
        }

        [HttpPut("lists/{taskListId}/tasks/{taskId}/complete")]
        public async Task<IActionResult> MarkTaskCompleted(long taskListId, long taskId)
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var taskList = await _taskService.GetTaskListAsync(taskListId, 0);
            if (taskList == null || taskList.UserId != userId)
            {
                return NotFound();
            }

            var result = await _taskService.MarkTaskCompletedAsync(taskListId, taskId);
            return result ? NoContent() : NotFound();
        }
    }

    public class CreateTaskListRequest
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        
        public int RequiredPoints { get; set; }
    }

    public class UpdateTaskListRequest
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        
        public int RequiredPoints { get; set; }
    }

    public class CreateTaskRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public int Points { get; set; }
    }

    public class UpdateTaskRequest
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        public string Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public int Points { get; set; }
    }
} 