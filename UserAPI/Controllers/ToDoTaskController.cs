using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Linq;

namespace UserAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ToDoTaskController : ControllerBase
    {
        private readonly IToDoTaskService _taskService;
        private readonly IWebHostEnvironment _environment;

        public ToDoTaskController(IToDoTaskService taskService, IWebHostEnvironment environment)
        {
            _taskService = taskService;
            _environment = environment;
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
        
        [HttpGet("lists/search")]
        public async Task<IActionResult> SearchTaskLists([FromQuery] string query)
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var taskLists = await _taskService.GetTaskListsAsync(userId);
            
            Console.WriteLine(taskLists.Count);
            return Ok(taskLists);
        }

        [HttpPost("lists")]
        public async Task<IActionResult> CreateTaskList([FromForm] CreateTaskListRequest request)
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            byte[]? imageData = null;
            string? imageMimeType = null; // Переменная для mime type

            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var extension = Path.GetExtension(request.ImageFile.FileName).ToLowerInvariant();
                imageMimeType = request.ImageFile.ContentType; // Получаем mime type

                // Проверка на поддерживаемый mime type (опционально, но рекомендуется)
                if (!imageMimeType.StartsWith("image/"))
                {
                     return BadRequest("Недопустимый тип файла изображения.");
                }
                // Можно добавить более строгую проверку mime type, если нужно

                using (var memoryStream = new MemoryStream())
                {
                    await request.ImageFile.CopyToAsync(memoryStream);
                    imageData = memoryStream.ToArray();
                }
            }

            var taskList = await _taskService.CreateTaskListAsync(userId, request.Title, request.Description, request.RequiredPoints, imageData, imageMimeType);
            return CreatedAtAction(nameof(GetTaskList), new { taskListId = taskList.Id }, taskList);
        }

        [HttpPut("lists/{taskListId}")]
        public async Task<IActionResult> UpdateTaskList(long taskListId, [FromForm] UpdateTaskListRequest request)
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var taskList = await _taskService.GetTaskListAsync(taskListId, 0);
            if (taskList == null || taskList.UserId != userId)
            {
                return NotFound();
            }

            byte[]? imageData = taskList.ImageData; 
            string? imageMimeType = taskList.ImageMimeType; // Сохраняем старый mime type

            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                imageMimeType = request.ImageFile.ContentType; // Получаем новый mime type
                if (!imageMimeType.StartsWith("image/"))
                {
                     return BadRequest("Недопустимый тип файла изображения.");
                }

                using (var memoryStream = new MemoryStream())
                {
                    await request.ImageFile.CopyToAsync(memoryStream);
                    imageData = memoryStream.ToArray(); // Обновляем данные
                }
            }

            var updatedTaskList = await _taskService.UpdateTaskListAsync(taskListId, request.Title, request.Description, request.RequiredPoints, imageData, imageMimeType);
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
        public async Task<IActionResult> CreateTask(long taskListId, [FromForm] CreateTaskRequest request)
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var taskList = await _taskService.GetTaskListAsync(taskListId, 0);
            if (taskList == null || taskList.UserId != userId)
            {
                return NotFound();
            }

            byte[]? imageData = null;
            string? imageMimeType = null;

            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                imageMimeType = request.ImageFile.ContentType;
                if (!imageMimeType.StartsWith("image/"))
                {
                     return BadRequest("Недопустимый тип файла изображения.");
                }
                using (var memoryStream = new MemoryStream())
                {
                    await request.ImageFile.CopyToAsync(memoryStream);
                    imageData = memoryStream.ToArray();
                }
            }
            
            Console.WriteLine($"Creating task: Title={request.Title}, Desc={request.Description}, Points={request.Points}, HasImage={imageData != null}");

            var task = await _taskService.CreateTaskAsync(taskListId, request.Title, request.Description, request.Priority, request.DueDate, request.Points, request.IsPenalty, imageData, imageMimeType);
            return CreatedAtAction(nameof(GetTaskList), new { taskListId }, task);
        }

        [HttpPut("lists/{taskListId}/tasks/{taskId}")]
        public async Task<IActionResult> UpdateTask(long taskListId, long taskId, [FromForm] UpdateTaskRequest request)
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var taskList = await _taskService.GetTaskListAsync(taskListId, 0);
            if (taskList == null || taskList.UserId != userId)
            {
                return NotFound();
            }
            
            // Получаем текущую задачу, чтобы знать, было ли у нее изображение
            var currentTask = taskList.ToDoTasks.FirstOrDefault(t => t.Id == taskId);
            if (currentTask == null) {
                return NotFound("Задача не найдена в этом списке.");
            }

            byte[]? imageData = currentTask.ImageData;
            string? imageMimeType = currentTask.ImageMimeType;

            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                imageMimeType = request.ImageFile.ContentType;
                if (!imageMimeType.StartsWith("image/"))
                {
                     return BadRequest("Недопустимый тип файла изображения.");
                }
                using (var memoryStream = new MemoryStream())
                {
                    await request.ImageFile.CopyToAsync(memoryStream);
                    imageData = memoryStream.ToArray();
                }
            }
            // TODO: Возможно, нужна логика для удаления изображения, если файл не пришел, а он был?
            
            Console.WriteLine($"Updating task {taskId}: Title={request.Title}, Desc={request.Description}, Points={request.Points}, HasImage={imageData != null}");

            var task = await _taskService.UpdateTaskAsync(
                taskListId,
                taskId,
                request.Title,
                request.Description,
                request.Priority,
                request.DueDate,
                request.Points,
                request.IsPenalty,
                imageData, 
                imageMimeType);
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
        
        [HttpPut("lists/{taskListId}/subscribe")]
        public async Task<IActionResult> SubscribeToDoList(long taskListId)
        {
            var userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            Console.WriteLine($"Пользователь {userId} подписался на список дел {taskListId}");
            return Ok();
        }
        
        [HttpGet("lists/analytics")]
        public async Task<IActionResult> GetTaskAnalytics()
        {
            // Здесь мы возвращаем фиктивные данные для аналитики
            var analyticsData = new {
                TotalPoints = 100,
                AveragePointsPerDay = 10,
                MaxPointsPerDay = 50,
                TotalTasks = 100,
                CompletedTasks = 75,
                PendingTasks = 25,
                OverdueTasks = 5,
                DailyPoints = new[] {
                    new { Date = "2023-10-01", Points = 10 },
                    new { Date = "2023-10-02", Points = 15 },
                    new { Date = "2023-10-03", Points = 20 },
                    new { Date = "2023-10-04", Points = 15 },
                    new { Date = "2023-10-05", Points = 12 }
                },
                DailyPenalties = new[] {
                    new { Date = "2023-10-01", Points = 1 },
                    new { Date = "2023-10-02", Points = 5 },
                    new { Date = "2023-10-03", Points = 2 },
                    new { Date = "2023-10-04", Points = 5 },
                    new { Date = "2023-10-05", Points = 2 }
                },
                DailyTasksCompleted = new[] {
                    new { Date = "2023-10-01", Count = 3 },
                    new { Date = "2023-10-02", Count = 5 },
                    new { Date = "2023-10-03", Count = 4 },
                    new { Date = "2025-02-04", Count = 6 },
                    new { Date = "2023-02-05", Count = 2 }
                }
            };
            return Ok(analyticsData);
        }
    }

    public class CreateTaskListRequest
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        
        public int RequiredPoints { get; set; }
        public IFormFile? ImageFile { get; set; }
    }

    public class UpdateTaskListRequest
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        
        public int RequiredPoints { get; set; }
        public IFormFile? ImageFile { get; set; }
    }

    public class CreateTaskRequest
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        public string Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public int Points { get; set; }
        public bool IsPenalty { get; set; }
        public IFormFile? ImageFile { get; set; }
    }

    public class UpdateTaskRequest
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        public string Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public int Points { get; set; }
        public bool IsPenalty { get; set; }
        public IFormFile? ImageFile { get; set; }
    }
} 