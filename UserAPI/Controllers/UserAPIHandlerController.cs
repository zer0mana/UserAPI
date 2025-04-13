using Microsoft.AspNetCore.Mvc;

namespace UserAPI.Controllers;

[ApiController]
[Route("pyd-user-api-handler")]
public class UserAPIHandlerController : ControllerBase
{
    // 8) Просмотр задачника
    [HttpGet("view-pyd/{pydId}")]
    public async Task<IActionResult> ViewPYD(long pydId, int userDayNumber)
    {
        throw new NotImplementedException();
    }

    // 9) Просмотр списка задачников
    [HttpGet("view-pyd-list")]
    public async Task<IActionResult> ViewPYDList(long userId)
    {
        throw new NotImplementedException();
    }

    // 10) Получение списка задачников из ленты рекомендаций
    [HttpGet("recommended-pyd-list")]
    public async Task<IActionResult> GetRecommendedPYDList(long userId)
    {
        throw new NotImplementedException();
    }

    [HttpPost("create-pyd")]
    public async Task<IActionResult> CreatePYD(long pydId)
    {
        throw new NotImplementedException();
    }

    // 12) Изменение задачника
    [HttpPut("update-pyd-template/{templateId}")]
    public async Task<IActionResult> UpdatePYDTemplate(long pydId)
    {
        throw new NotImplementedException();
    }

    // 14) Отметка о выполнении части задачника
    [HttpPost("mark-pyd-task-completed")]
    public async Task<IActionResult> MarkPYDTaskCompleted(long pydId, long taskId)
    {
        throw new NotImplementedException();
    }
}