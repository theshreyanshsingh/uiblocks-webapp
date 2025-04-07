import { configureStore } from '@reduxjs/toolkit';
import projectOptions from './reducers/projectOptions';
import basicData from './reducers/basicData';
import projectFiles from './reducers/projectFiles';
import messagesProvider from './reducers/Mesages';
import notificaitonProvider from './reducers/NotificationModalReducer';

export const store = configureStore({
  reducer: {
    projectOptions: projectOptions,
    basicData: basicData,
    projectFiles: projectFiles,
    messagesprovider: messagesProvider,
    notificaitonprovider: notificaitonProvider, //notification modal
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
