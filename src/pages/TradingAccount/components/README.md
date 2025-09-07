# Trading Account Detail Components

This directory contains the refactored components for the TradingAccountDetail page, split into smaller, reusable components for better maintainability and organization.

## Components Structure

### Main Components

1. **TradingAccountHeader.tsx**
   - Displays the account header with status, exchange info, and action buttons
   - Props: `account`, `onBack`, `onRefresh`, `isRefreshing`

2. **TradingAccountSummaryCards.tsx**
   - Shows summary cards for balance, PnL, and position count
   - Props: `dashboardData`

3. **AccountBalanceTab.tsx**
   - Contains the balance tab content with detailed asset information
   - Props: `account`

4. **PositionsTab.tsx**
   - Main positions tab with table and position management actions
   - Props: `positions`, `isLoading`, `onRefresh`, `onOpenPosition`, `onClosePosition`, `onClosePartialPosition`

### Action Components

5. **PositionActionButtons.tsx**
   - Action buttons for each position row (quick close, more actions menu)
   - Props: `position`, `onOpenPosition`, `onClosePosition`, `onPartialClosePosition`

### Dialog Components

6. **OpenPositionDialog.tsx**
   - Dialog for opening new positions with all required parameters
   - Props: `open`, `onClose`, `onSubmit`, `initialSymbol`, `initialSide`, `initialPositionSide`

7. **ClosePositionDialog.tsx**
   - Confirmation dialog for closing entire positions
   - Props: `open`, `onClose`, `onSubmit`, `position`

8. **ClosePartialPositionDialog.tsx**
   - Dialog for closing partial positions with quantity selection
   - Props: `open`, `onClose`, `onSubmit`, `position`

### Utility Components

9. **TabPanel.tsx**
   - Generic tab panel component for tab content
   - Props: `children`, `index`, `value`

## Features Implemented

### Position Management
- ✅ **Open Position**: Full form with symbol, side, quantity, order type, price (for LIMIT), time in force
- ✅ **Close Position**: Confirmation dialog with position details
- ✅ **Close Partial Position**: Quantity selection with percentage shortcuts and preview
- ✅ **Quick Actions**: Action buttons on each position row
- ✅ **Floating Action Button**: Quick access to open new positions

### UI/UX Features
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Loading States**: Proper loading indicators for all async operations
- ✅ **Error Handling**: Error messages and validation
- ✅ **Notifications**: Success/error notifications for all operations
- ✅ **Form Validation**: Input validation for all dialogs
- ✅ **Preview**: Shows preview of actions before confirmation

### Trading Operations
- ✅ **Market Orders**: Immediate execution
- ✅ **Limit Orders**: With price specification
- ✅ **Position Sides**: LONG, SHORT, BOTH support
- ✅ **Time in Force**: GTC, IOC, FOK options
- ✅ **Partial Close**: Close specific quantity with percentage shortcuts

## API Integration

The components integrate with the following API endpoints:
- `POST /api/v1/trading-accounts/{id}/positions/open` - Open new position
- `POST /api/v1/trading-accounts/{id}/positions/close` - Close position
- `POST /api/v1/trading-accounts/{id}/positions/close-partial` - Close partial position

## Usage

```tsx
import { TradingAccountDetail } from './TradingAccountDetail';

// The main component automatically handles all position management operations
// Each sub-component can also be used independently if needed
```

## Dependencies

- Material-UI components
- React hooks (useState, useEffect, useCallback, memo)
- React Router (useNavigate, useParams)
- Custom hooks (useNotification)
- Trading service functions
- Trading types

## Future Enhancements

- Add more order types (Stop Loss, Take Profit)
- Implement position size calculator
- Add charts integration for technical analysis
- Implement bulk operations (close all positions)
- Add position alerts and notifications
- Implement advanced order management features
