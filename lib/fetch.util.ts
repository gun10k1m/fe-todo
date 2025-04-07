const handleResponseError = async (response: Response) => {
  if (!response.ok) {
    let message = '';
    switch (response.status) {
      case 400:
        message = '잘못된 요청입니다.';
        break;
      case 401:
        message = '사용자가 인증되지 않았습니다.';
        break;
      case 404:
        message = 'Todo가 존재하지 않거나 접근 권한이 없습니다.';
        break;
      case 500:
        message = '서버 오류 입니다.';
        break;
      default:
        message = '알 수 없는 오류가 발생했습니다.';
    }
    throw new Error(message);
  }
};

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  const response = await fetch(url, mergedOptions);
  await handleResponseError(response);
  return response.json();
};
