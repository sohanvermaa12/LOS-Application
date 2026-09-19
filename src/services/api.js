export const api = {
  applications: [
    { id: 'APP-240618-0182', branch: 'Andheri West', customer: 'Rohan Mehta', customerId: 'CUS-2024-00841', product: 'Gold loan', amount: 'INR 2,50,000', updated: '12 min ago', status: 'In review' },
    { id: 'APP-240618-0179', branch: 'Koramangala', customer: 'Neha Iyer', customerId: 'CUS-2024-00798', product: 'Personal loan', amount: 'INR 4,00,000', updated: '34 min ago', status: 'Approved' },
    { id: 'APP-240617-0168', branch: 'Pimpri', customer: 'Vikram Singh', customerId: 'CUS-2024-00742', product: 'Gold loan', amount: 'INR 1,80,000', updated: '1 hr ago', status: 'Awaiting KYC' },
    { id: 'APP-240617-0161', branch: 'Salt Lake', customer: 'Ananya Das', customerId: 'CUS-2024-00691', product: 'Business loan', amount: 'INR 8,50,000', updated: '2 hrs ago', status: 'Returned' },
    { id: 'APP-240617-0156', branch: 'Indiranagar', customer: 'Arjun Rao', customerId: 'CUS-2024-00638', product: 'Gold loan', amount: 'INR 3,20,000', updated: '3 hrs ago', status: 'In review' },
    { id: 'APP-240616-0148', branch: 'Powai', customer: 'Meera Shah', customerId: 'CUS-2024-00594', product: 'Personal loan', amount: 'INR 5,00,000', updated: 'Yesterday', status: 'Draft' },
    { id: 'APP-240616-0142', branch: 'Banjara Hills', customer: 'Sanjay Kumar', customerId: 'CUS-2024-00571', product: 'Gold loan', amount: 'INR 1,25,000', updated: 'Yesterday', status: 'Approved' }
  ],
  customers: [
    { id: 'CUS-2024-00841', name: 'Rohan Mehta', initials: 'RM', type: 'Individual', phone: '+91 98••• 2148', kyc: 'Verified', activeLoans: 1 },
    { id: 'CUS-2024-00798', name: 'Neha Iyer', initials: 'NI', type: 'Individual', phone: '+91 97••• 6082', kyc: 'Verified', activeLoans: 2 },
    { id: 'CUS-2024-00742', name: 'Vikram Singh', initials: 'VS', type: 'Individual', phone: '+91 99••• 4510', kyc: 'Pending', activeLoans: 0 },
    { id: 'CUS-2024-00691', name: 'Ananya Das', initials: 'AD', type: 'Proprietorship', phone: '+91 90••• 8794', kyc: 'Verified', activeLoans: 1 }
  ],
  branches: [
    { name: 'Andheri West', code: 'BR-041', applications: 42, approved: 19, rate: '45.2%', tat: '1.8d', trend: 12 },
    { name: 'Koramangala', code: 'BR-017', applications: 38, approved: 17, rate: '44.7%', tat: '2.1d', trend: 8 },
    { name: 'Pimpri', code: 'BR-029', applications: 31, approved: 11, rate: '35.5%', tat: '2.8d', trend: -4 },
    { name: 'Salt Lake', code: 'BR-063', applications: 26, approved: 9, rate: '34.6%', tat: '3.2d', trend: -7 }
  ]
};