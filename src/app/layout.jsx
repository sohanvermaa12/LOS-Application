import 'react-calendar/dist/Calendar.css';
import './globals.css';

export const metadata = {
  title: 'LOS - Loan Origination System',
  description: 'Loan origination operations workspace'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body suppressHydrationWarning>{children}</body></html>;
}