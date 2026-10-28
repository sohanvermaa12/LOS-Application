'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import ApplicationModal from './ApplicationModal';

export default function NewApplicationButton() {
  const [open, setOpen] = useState(false);
  return <>
  
  {/* {<button className="primary-button" onClick={() => setOpen(true)}><Plus size={17} /> New application</button>}{open && <ApplicationModal onClose={() => setOpen(false)} />}
     */}
     
    </>;
}