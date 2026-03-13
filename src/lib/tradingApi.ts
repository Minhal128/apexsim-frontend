import { apiRequest } from './api';

export interface PlaceOrderParams {
    symbol: string;
    type: 'buy' | 'sell';
    marketType: 'spot' | 'futures';
    price: number;
    amount: number;
    leverage?: number;
    marginMode?: 'cross' | 'isolated';
    orderType?: string;
}

export interface CancelOrderParams {
    orderId: string;
}

export interface BalanceData {
    balances: Array<{
        asset: string;
        amount: number;
    }>;
}

export interface TradeData {
    _id: string;
    symbol: string;
    type: 'buy' | 'sell';
    amount: number;
    price: number;
    executedPrice?: number;
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    marketType?: 'spot' | 'futures';
    createdAt: string;
}

export interface PositionData {
    symbol: string;
    quantity: number;
    avgPrice: number;
    totalCost: number;
}

// Place a new trade order
export const placeOrder = async (params: PlaceOrderParams) => {
    return apiRequest('/trading/order', {
        method: 'POST',
        body: params as any,
    });
};

// Cancel a pending order
export const cancelOrder = async (orderId: string) => {
    return apiRequest(`/trading/cancel/${orderId}`, {
        method: 'POST',
    });
};

// Get open orders
export const getOpenOrders = async () => {
    return apiRequest('/trading/open-orders');
};

// Get trade history
export const getTradeHistory = async () => {
    return apiRequest('/trading/history');
};

// Get positions
export const getPositions = async () => {
    return apiRequest('/trading/positions');
};

// Get wallet balances
export const getWalletBalance = async () => {
    return apiRequest('/wallet');
};

// Helper to get balance for specific asset
export const getAssetBalance = async (asset: string) => {
    const data = await getWalletBalance();
    const balance = data.balances?.find((b: any) => b.asset === asset);
    return balance?.amount || 0;
};

// Helper to calculate total cost for a trade
export const calculateTradeTotal = (price: number, amount: number, leverage?: number) => {
    if (leverage) {
        return (price * amount) / leverage;
    }
    return price * amount;
};

// Get position for symbol
export const getPositionBySymbol = async (symbol: string) => {
    const positions = await getPositions();
    return positions.find((p: PositionData) => p.symbol === symbol);
};
