export interface BaseResponse<TSuccess> {
  status: 'OK' | 'ERROR';
  code?: number | string;
  data?: TSuccess;
  message?: string;
}

export interface OkResponse<T> extends BaseResponse<T> {}

export interface ErrorResponse<T> extends BaseResponse<T> {}

export const errorResponse = ({
  code,
  message,
}: {
  code: string;
  message: string;
}): ErrorResponse<string> => ({
  status: 'ERROR',
  code,
  message,
});

export const okResponse = <T>(data?: T): OkResponse<T> => {
  return {
    status: 'OK',
    data,
  };
};
