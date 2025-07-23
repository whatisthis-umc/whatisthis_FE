// SignupPages.tsx
import { Routes, Route } from 'react-router-dom';
import AgreementPage from './Signup/AgreementPage';
import NickNamePage from './Signup/NickNamePage';
import CompletePage from './Signup/CompletePage';

export default function SignupPages() {
  return (
    <Routes>
      <Route path="/" element={<AgreementPage />} />
      <Route path="/nickname" element={<NickNamePage />} />
      <Route path="/complete" element={<CompletePage />} />
    </Routes>
  );
}
