import os

file_path = r'C:\Users\SREENAND PK\Desktop\Trading\AI-Service\src\agent3_graph.py'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

target = '''    if not has_candles:
        try:
            # Fallback: Fetch raw market data for ticker
            logger.info(f"Market scan candles missing for {ticker}. Running fetch_market_data fallback.")
            raw_candles = fetch_market_data(ticker)
            if isinstance(raw_candles, list) and len(raw_candles) > 0:
                market_scan = {
                    "symbol": ticker,
                    "candles": raw_candles,
                    "breakout_detected": False,
                    "volume_surge": False
                }
            else:
                errors.append(f"Market data fetch returned zero candles for {ticker}.")
                market_scan = {"symbol": ticker, "candles": [], "breakout_detected": False, "volume_surge": False}'''

replacement = '''    if not has_candles:
        try:
            # Fallback: Fetch raw market data for ticker
            logger.info(f"Market scan candles missing for {ticker}. Running fetch_market_data fallback.")
            fetched_data = fetch_market_data(ticker)
            raw_candles = []
            if isinstance(fetched_data, list):
                raw_candles = fetched_data
            elif isinstance(fetched_data, dict):
                raw_candles = fetched_data.get("ohlcv_candles") or fetched_data.get("candles") or []

            if len(raw_candles) > 0:
                market_scan = {
                    "symbol": ticker,
                    "candles": raw_candles,
                    "breakout_detected": False,
                    "volume_surge": False
                }
            else:
                errors.append(f"Market data fetch returned zero candles for {ticker}.")
                market_scan = {"symbol": ticker, "candles": [], "breakout_detected": False, "volume_surge": False}'''

if target in code:
    code = code.replace(target, replacement, 1)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print('Fixed fallback market data parsing in agent3_graph.py')
else:
    print('Target code block not found in agent3_graph.py')
