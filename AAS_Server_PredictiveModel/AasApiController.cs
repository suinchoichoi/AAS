using System;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

[ApiController]
[Route("/download_file")]
public class FileDownloadController : ControllerBase
{
    [HttpGet("{filename}")]
    public IActionResult DownloadFile(string filename)
    {
        try
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), filename);
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { error = "File not found" });
            }

            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            return File(fileBytes, "application/octet-stream", filename);
        }
        catch (Exception e)
        {
            return StatusCode(500, new { error = e.Message });
        }
    }
}

