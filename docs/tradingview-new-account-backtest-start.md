# TradingView 新账号回测起步流程

本文不是 skill 说明，而是给刚注册完 TradingView 账号的人看的实操流程：先把浏览器、图表、策略、Strategy Tester、结果记录和复盘闭环跑稳定，再谈把真实策略迭代到年化收益率 20%。

这里的截图来自一次 `backtest-skill` smoke fixture 跑通记录。它只用于说明操作链路，不代表有效策略，也不能作为收益优化对象。

## 目标顺序

主目标是稳定操作闭环：

1. 打开已登录 TradingView 图表。
2. 确认品种、交易所、周期和图表类型。
3. 准备一个能添加策略的布局。
4. 把已给定的 Pine `strategy()` 加到图表。
5. 让 Strategy Tester 出现可审计指标。
6. 记录证据、完成 run record、写复盘结论。

次目标才是收益率：

- 只有当上面的闭环可重复时，才比较真实策略版本或用户提供的参数集。
- 20% 年化收益率不是第一轮浏览器操作的成功标准。
- 如果只有 smoke fixture，必须停止并请求真实策略或真实参数集。

## 0. 新账号先准备什么

刚注册完账号后，不需要先连接券商，也不需要先配置 webhook。第一轮只需要：

![新账号第一轮先打开图表并确认页面可用](./assets/tradingview-new-account-backtest-start/01-logged-in-chart-with-report.png)

- 一个已登录的 Chrome / TradingView 页面。
- 一个测试品种，例如 `BTCUSDT`。
- 一个周期，例如 `5m`。
- 一个可执行 Pine `strategy()`，或者一个已经保存在账号里的策略。
- 一份记录结果的 run record。

不要一开始就追求收益率。先确认 TradingView 能稳定完成一次回测。

## 1. 打开已登录图表

进入 TradingView 后，先打开图表页。新账号常见起点是空白图表、默认布局，或者之前留下了一堆指标。

![已登录图表与 Strategy Tester 面板](./assets/tradingview-new-account-backtest-start/01-logged-in-chart-with-report.png)

要点：

- 地址栏应在 `tradingview.com/chart/...` 或 `cn.tradingview.com/chart/...`。
- 顶部能看到当前品种、周期、指标、警报、回放等控件。
- 右上角账号状态应是已登录状态。
- 不要刷新正在操作的图表，除非你明确要重置布局。

## 2. 确认品种、交易所和周期

先固定测试环境，再运行策略。否则不同品种、周期和数据源会让结果不可比较。

![确认 BTCUSDT、OKX、5m 周期](./assets/tradingview-new-account-backtest-start/02-confirm-symbol-timeframe.png)

截图中的环境是：

- 品种：`BTCUSDT`
- 交易所：`OKX`
- 周期：`5m`
- 图表类型：K 线图

记录这些字段是为了后续复盘能回答一个基础问题：这次结果到底是在什么市场条件下跑出来的。

## 3. 先清理布局阻塞

新账号或免费账号可能遇到指标数量限制。策略 `strategy()` 加到图表时也会占用一个指标槽位。如果图表上已经堆了很多指标，Strategy Tester 可能无法正常工作。

![指标过多且回测面板无数据的起点](./assets/tradingview-new-account-backtest-start/00-crowded-layout-no-report.png)

处理顺序：

1. 优先新建空白布局。
2. 如果必须复用当前布局，只移除明确无关的指标。
3. 移除前先备份指标名称或截图。
4. 不要删除用户未确认要删的指标。

这张图里下方面板显示“没有数据”，说明这还不是可复盘结果，只是一个需要整理的起点。

## 4. 添加已给定的 Pine strategy

`backtest-skill` 不负责发明策略。它只接受已经给出的 Pine `strategy()`、已保存策略、Strategy Tester 结果，或明确的参数集。

策略加到图表后，至少要能看到策略名称和订单标记。

![策略已添加到图表并出现订单标记](./assets/tradingview-new-account-backtest-start/03-strategy-on-chart.png)

判断标准：

- 图表左上角出现策略名称。
- 图表上出现买入、卖出、平仓等订单标记。
- 代码必须是 `strategy()`，不能只是 `indicator()`。

注意：订单标记只证明策略被加到图表，不证明回测指标已经可用。真正的证据来自 Strategy Tester。

## 5. 打开 Strategy Tester 并捕获关键统计

策略添加成功后，打开 Strategy Tester 或 Strategy Report。第一眼先看关键统计。

![Strategy Tester 关键统计](./assets/tradingview-new-account-backtest-start/04-strategy-tester-key-stats.png)

这次 smoke fixture 的结果很差：

- 总损益：`-2,590.25 USDT / -25.90%`
- 最大回撤：`2,599.21 USDT / 25.98%`
- 盈利交易：`16.15% / 21 of 130`
- 盈利因子：`0.289`

这个结果说明浏览器回测链路跑通了，但策略质量不合格。不要为了演示而把它解释成可交易策略。

## 6. 看权益曲线和回撤形态

关键统计之外，还要看权益曲线。它能快速暴露策略是否持续失血、是否靠少数交易撑住结果，或者是否完全没有稳定性。

![权益曲线与回撤走势](./assets/tradingview-new-account-backtest-start/05-equity-curve-drawdown.png)

截图中累计收益曲线持续向下，这种结果不能进入收益率优化阶段。正确动作是：

- 记录为失败样例。
- 确认操作链路有效。
- 请求真实策略或下一组用户提供的参数。

## 7. 打开回报详情做复盘

Strategy Tester 的“回报详情”用于补充关键统计看不到的信息，例如买入持有对比、策略表现优异度、夏普比率、利润结构等。

![回报详情与基准对比](./assets/tradingview-new-account-backtest-start/06-report-detail-section.png)

复盘时至少写清楚：

- 本轮是 smoke fixture 还是真实策略。
- 是否拿到了 Strategy Tester 指标。
- 是否有截图、导出或复制表格作为证据。
- 结果是通过、观察、继续迭代，还是直接拒绝。
- 下一轮允许改什么：只允许改用户给定的版本或参数，不允许现场发明交易逻辑。

## 8. 写 run record

每一轮回测都要留下结构化记录。最小字段如下：

![从 Strategy Tester 关键统计抄录 run record](./assets/tradingview-new-account-backtest-start/04-strategy-tester-key-stats.png)

```json
{
  "strategy": {
    "name": "TV Backtest Skill Fixture EMA Cross v1",
    "version": "smoke-v1",
    "fixture_only": true
  },
  "market": {
    "symbol": "BTCUSDT",
    "exchange": "OKX",
    "timeframe": "5m",
    "date_range": "2026-06-08 to 2026-07-01"
  },
  "metrics": {
    "net_profit_pct": -25.9,
    "max_drawdown_pct": 25.98,
    "win_rate_pct": 16.15,
    "profit_factor": 0.289,
    "total_trades": 130
  },
  "decision": "reject_fixture_for_target_iteration",
  "next_step": "request a real Pine strategy, saved TradingView strategy, tester artifact, or supplied parameter set"
}
```

如果 Strategy Tester 没有数据，就不要补猜指标。记录为 blocked run，并说明阻塞点。

## 9. 决定下一轮怎么迭代

本流程跑通后，才进入收益目标阶段。判断顺序是：

![用权益曲线和回报详情决定下一轮](./assets/tradingview-new-account-backtest-start/06-report-detail-section.png)

1. 操作链路是否稳定？
2. 证据是否完整？
3. 当前策略是否是真实策略，而不是 smoke fixture？
4. 是否有用户提供的下一组参数或版本？
5. 年化收益、最大回撤、交易数、盈利因子是否同时可接受？

如果答案 1 和 2 是“否”，继续修浏览器和结果采集。

如果答案 3 或 4 是“否”，请求真实策略或参数。

只有全部满足后，才讨论年化收益率是否能逐步逼近或超过 20%。

## 常见阻塞与处理

| 阻塞 | 现象 | 处理 |
| --- | --- | --- |
| 指标槽位不足 | 策略无法添加到图表 | 新建空白布局，或在备份后移除明确无关指标 |
| 只有订单标记 | 图表有箭头，但 Strategy Tester 无指标 | 不算完成，必须继续打开报表或记录 blocked run |
| Pine 是 `indicator()` | 无法产生策略交易 | 请求 `strategy()` 版本，不在本流程里发明交易规则 |
| 报表空白 | 下方面板显示无数据 | 记录截图、刷新报表、检查日期范围和计划限制 |
| 只有 smoke fixture | 能出报告但不是用户真实策略 | 只证明链路可用，不能进入收益率优化 |

## 附录：如何理解本次截图

你看到的完成态截图属于“前期进展”：TradingView 浏览器操作、策略上图、Strategy Tester 出数和关键指标读取已经跑通。

![用户观察到的 Strategy Tester 完成态](./assets/tradingview-new-account-backtest-start/01-user-observed-report.png)

但这不是收益目标达成。图里的策略是 smoke fixture，结果为负，所以它的价值是证明操作链路可用，并把下一步明确为：提供真实 Pine `strategy()`、已保存 TradingView 策略、Strategy Tester artifact，或用户指定的参数/版本集合。

## 完成标准

一次“刚注册后开始回测”的流程完成，必须满足：

- 已登录图表可访问。
- 品种、交易所、周期和日期范围已记录。
- 可执行策略已添加到图表。
- Strategy Tester 指标已截图或导出。
- run record 已写入。
- 复盘结论已明确。
- 下一轮请求已明确。

完成这些之前，不要把年化 20% 当作当前阶段目标。
