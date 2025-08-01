// SignupPages.tsx
import { Routes, Route } from 'react-router-dom';
import AgreementPage from './Signup/AgreementPage';
import CompletePage from './Signup/CompletePage';
import InfoPage from './Signup/InfoPage';

export default function SignupPages() {
  return (
    <Routes>
      <Route path="/" element={<AgreementPage />} />
      <Route path="/nickname" element={<InfoPage />} />
      <Route path="/complete" element={<CompletePage />} />
    </Routes>
  );
}
