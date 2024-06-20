import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import * as serviceWorker from 'serviceWorker';
import App from 'App';
import { setupStore } from './store/store';
import 'assets/scss/style.scss';
import interceptors from './utils/axios';

// ==============================|| REACT DOM RENDER  ||============================== //

// ReactDOM.render(
//     <Provider store={setupStore()}>
//         <BrowserRouter>
//             <App />
//         </BrowserRouter>
//     </Provider>,
//     document.getElementById('root')
// );

const store = setupStore();
interceptors.setupInterceptors(store);

const rootElement = document.getElementById('root');

if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
