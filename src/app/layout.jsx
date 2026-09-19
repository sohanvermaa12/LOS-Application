import './globals.css';

export const metadata = {
  title: 'Northstar LOS | Operations Console',
  description: 'Loan origination operations workspace'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}