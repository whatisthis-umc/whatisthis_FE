// FindAccountPage.tsx
import { Routes, Route } from 'react-router-dom';
import FindStartPage from './FindAccount/FindStartPage';
import FindIdResultPage from './FindAccount/FindIdResultPage';
import FindPasswordPage from './FindAccount/FindPasswordPage';
import FindPasswordResetPage from './FindAccount/FindPasswordResetPage';
import FindPasswordDonePage from './FindAccount/FindPasswordDonePage';



export default function FindAccountPages() {
  return (
    <Routes>
      <Route path="/" element={<FindStartPage />} />
      <Route path="/id-result" element={<FindIdResultPage />} />
      <Route path="/password" element={<FindPasswordPage />} />
      <Route path="/password-reset" element={<FindPasswordResetPage />} />
      <Route path="/password-done" element={<FindPasswordDonePage />} /> 

    </Routes>
  );
}


   