import React, { useState, useEffect } from 'react';
import '@/styles/components/live-market.css';

export const LiveMarketDashboard: React.FC = () => {
    const [marketData, setMarketData] = useState({ gainers: [], losers: [] });
    const [activeTab, setActiveTab] = useState('Stocks');

    useEffect(() => {
        // 1. Connect to the FastAPI WebSocket Bridge
        const ws = new WebSocket("ws://localhost:8000/dashboard/ws/market");

        // 2. Listen for live updates being pushed from FastAPI
        ws.onmessage = (event) => {
            try {
                const liveData = JSON.parse(event.data);
                console.log("Live Update Received:", liveData);
                // Instantly update the React state
                setMarketData(liveData);
            } catch (err) {
                console.error("Error parsing websocket message", err);
            }
        };

        // 3. Clean up the connection if the user leaves the page
        return () => ws.close();
    }, []);

    const formatPrice = (price: number) => {
        if (!price) return "0.00";
        if (price < 0.01) {
            return price.toExponential(5);
        }
        return price.toFixed(2);
    };

    const getInitials = (symbol: string) => {
        return symbol.substring(0, 2).toUpperCase();
    };

    return (
        <div className="market-dashboard">
            <div className="top-nav">
                <div className="nav-pills">
                    {['Stocks', 'Crypto', 'Futures', 'Forex', 'Economy', 'Brokers'].map(tab => (
                        <button
                            key={tab}
                            className={`nav-pill ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="market-sections">
                {/* Gainers */}
                <div className="market-list-section">
                    <div className="section-header">
                        <h2>
                            {activeTab === 'Stocks' ? 'Stock' : activeTab} gainers
                            <span className="heading-arrow">&gt;</span>
                        </h2>
                    </div>

                    <div className="stock-list">
                        {marketData.gainers && marketData.gainers.length > 0 ? (
                            marketData.gainers.map((stock: any) => (
                                <div className="stock-row" key={stock.symbol}>
                                    <div className="stock-left">
                                        <div className="stock-icon icon-blue">{getInitials(stock.symbol)}</div>
                                        <div className="stock-names">
                                            <div className="stock-name">{stock.symbol.split('.')[0]}</div>
                                            <div className="stock-ticker">{stock.symbol}</div>
                                        </div>
                                    </div>
                                    <div className="stock-middle">
                                        <span className="price">{formatPrice(stock.price)}</span>
                                        <span className="currency">{stock.currency || 'USD'}</span>
                                    </div>
                                    <div className="stock-right">
                                        <div className="pill-gain">+{Math.abs(stock.percent_change).toFixed(2)}%</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="loading-state">Waiting for data...</div>
                        )}
                    </div>
                </div>

                {/* Losers */}
                <div className="market-list-section">
                    <div className="section-header">
                        <h2>
                            {activeTab === 'Stocks' ? 'Stock' : activeTab} losers
                            <span className="heading-arrow">&gt;</span>
                        </h2>
                    </div>

                    <div className="stock-list">
                        {marketData.losers && marketData.losers.length > 0 ? (
                            marketData.losers.map((stock: any) => (
                                <div className="stock-row" key={stock.symbol}>
                                    <div className="stock-left">
                                        <div className="stock-icon icon-purple">{getInitials(stock.symbol)}</div>
                                        <div className="stock-names">
                                            <div className="stock-name">{stock.symbol.split('.')[0]}</div>
                                            <div className="stock-ticker">{stock.symbol}</div>
                                        </div>
                                    </div>
                                    <div className="stock-middle">
                                        <span className="price">{formatPrice(stock.price)}</span>
                                        <span className="currency">{stock.currency || 'USD'}</span>
                                    </div>
                                    <div className="stock-right">
                                        <div className="pill-loss">
                                            -{Math.abs(stock.percent_change).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="loading-state">Waiting for data...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
