import './globals.css';

export const metadata = {
  title: 'LOS - Loan Origination System',
  description: 'Loan origination operations workspace'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}