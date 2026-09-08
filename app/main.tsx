import React from 'react';
import { createRoot } from 'react-dom/client';
import Router from './Router';
import './globals.css';
import './platform.css';
import './liquid-glass.css';
document.body.classList.add('liquid-glass');
createRoot(document.getElementById('root')!).render(<Router />);
