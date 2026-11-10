/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReaderProvider, useReader } from './context/ReaderContext';
import { ReadingScreen } from './components/ReadingScreen';

function RootRedirect() {
  const { primaryPlace } = useReader();
  const trans = primaryPlace?.translation || 'kjv';
  const book = primaryPlace?.book || 'john';
  const chapter = primaryPlace?.chapter || 3;
  return <Navigate to={`/${trans}/${book}/${chapter}`} replace />;
}

export default function App() {
  return (
    <ReaderProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/:translation/:book/:chapter" element={<ReadingScreen />} />
          <Route path="/:translation/:book" element={<Navigate to="1" replace />} />
          <Route path="/:translation" element={<RootRedirect />} />
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </ReaderProvider>
  );
}
