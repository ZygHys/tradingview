# Alerts and Webhooks

Use this reference when creating TradingView alert messages or webhook payloads.

## Purpose

TradingView alerts can send strategy or indicator events to an external URL. The receiver should be user-owned infrastructure such as a paper-trading service, Freqtrade webhook endpoint, broker bridge, or custom relay.

## Alert Message Principles

- Use JSON when downstream systems expect structured data.
- Include a strategy id, symbol, timeframe, action, quantity or sizing mode, order id, and timestamp placeholder when available.
- Do not include secrets in TradingView alert text.
- Keep alert payloads deterministic and versioned.

## Example Payload

```json
{
  "source": "tradingview",
  "strategy": "example-breakout-v1",
  "symbol": "{{ticker}}",
  "exchange": "{{exchange}}",
  "timeframe": "{{interval}}",
  "action": "{{strategy.order.action}}",
  "order_id": "{{strategy.order.id}}",
  "position_size": "{{strategy.position_size}}",
  "price": "{{close}}",
  "time": "{{time}}"
}
```

## Pine Integration

Use `alert_message` on order functions when a strategy needs per-order payloads:

```pine
strategy.entry("Long", strategy.long, alert_message = longMessage)
strategy.exit("Long Exit", "Long", stop = stopPrice, limit = targetPrice, alert_message = exitMessage)
```

## Safety

- Treat alerts as signal transport, not as proof of profitability.
- Test with paper trading first.
- Validate retries, timeouts, duplicate events, and idempotency in the receiver.
- Keep broker or exchange credentials outside TradingView.

