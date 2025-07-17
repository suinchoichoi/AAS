using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();  // ✅ 컨트롤러 활성화
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseRouting();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();  // ✅ 컨트롤러 매핑
            endpoints.MapGet("/", async context =>  // ✅ 루트 URL("/")에 기본 응답 추가
            {
                await context.Response.WriteAsync("Server is running! Try accessing /GTSU_10");
            });
        });
    }
}
