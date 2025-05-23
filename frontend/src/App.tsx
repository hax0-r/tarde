import { Suspense, lazy } from 'react';
import './App.css';
import Loader from './Components/Loader';
import { ToastContainer } from 'react-toastify';

const Router = lazy(() => import('./Router/Router'));

function App() {
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Router />
        <ToastContainer limit={2} />
        {/* <TradingChat /> */}
      </Suspense>
    </>
  );
}

export default App;
