
using Data;
using Entities;
using Models;
using Moq;
using Moq.EntityFrameworkCore;
using Services;

namespace Tests;

public class ReportServiceTests
{
    public static IEnumerable<object[]> GetTestCases()
    {
        yield return new object[]
        {
        new decimal[] {50, -25, 150, -150},
        new BudgetReport(25, -175, 200, 4, 2, 2)
        };

        yield return new object[]
        {
        new decimal[] {0, 0, 0,50, -50},
        new BudgetReport(0, -50, 50, 5, 1, 1)
        };

        yield return new object[]
        {
        new decimal[] {0.5m, -5.5m, 100.25m},
        new BudgetReport(95.25m, -5.5m, 100.75m, 3, 1, 2)
        };

        yield return new object[]
        {
        Array.Empty<decimal>(),
        new BudgetReport(0, 0, 0, 0, 0, 0),
        };
    }


    [Theory]
    [MemberData(nameof(GetTestCases))] // Add test cases
    public async Task ShouldGenerateReportCorrectly(decimal[] values, BudgetReport expectedReport)
    {
        var credentialId = Guid.NewGuid();

        var transactions = values.Select(value => new Transaction
        {
            Id = Guid.Empty,
            Category = string.Empty,
            CredentialId = credentialId,
            Description = string.Empty,
            Timestamp = DateTimeOffset.MinValue,
            Value = value
        });

        var mockDbContext = new Mock<DatabaseContext>();
        mockDbContext.Setup(x => x.Transactions).ReturnsDbSet(transactions);

        var service = new ReportService(mockDbContext.Object);

        var report = await service.GenerateReportAsync(credentialId, null, null, null);

        Assert.Equal(expectedReport, report);
    }
}