/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReaderProvider } from './context/ReaderContext';
import { ReadingScreen } from './components/ReadingScreen';

export default function App() {
  return (
    <ReaderProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/:translation/:book/:chapter" element={<ReadingScreen />} />
          <Route path="/:translation/:book" element={<Navigate to="1" replace />} />
          <Route path="/:translation" element={<Navigate to="john/3" replace />} />
          <Route path="/" element={<Navigate to="/kjv/john/3" replace />} />
          <Route path="*" element={<Navigate to="/kjv/john/3" replace />} />
        </Routes>
      </BrowserRouter>
    </ReaderProvider>
  );
}
