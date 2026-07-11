export enum DataState {
  LOADING = 'LOADING',
  LOADED  = 'LOADED',
  ERROR   = 'ERROR',
}

export interface AppState<T> {
  dataState: DataState;
  data?:     T;
  error?:    string;
}
