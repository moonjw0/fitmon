import instance from './axios';

interface ApiRequestProps<TRequest> {
  param: string;
  method?: 'get' | 'post' | 'patch' | 'delete' | 'put';
  requestData?: TRequest;
}

/**
 * API 요청을 보낼 때 사용되는 유틸리티 함수
 *
 * @template T - 보낼 데이터 또는 반환받을 데이터의 타입
 * @param {string} param - 요청에 사용할 endpoint (필수)
 * @param {'get' | 'post' | 'patch' | 'delete' | 'put'} [method='get'] - HTTP 메소드 (기본값: 'get')
 * @param {T} [requestData] - 요청 본문에 전송할 데이터 (옵셔널)
 * @returns {Promise<T>} - 서버 응답 데이터
 *
 * @example
 * // GET 요청 예시
 * const data = await apiRequest<{ id: number; title: string }>({
 *   param: '/example-endpoint',
 * });
 */

export default async function apiRequest<TResponse, TRequest = TResponse>({
  param,
  method = 'get',
  requestData,
}: ApiRequestProps<TRequest>): Promise<TResponse> {
  const response = await instance.request<TResponse>({
    url: param,
    method,
    data: requestData ?? null, // requestData가 없을 경우 null 전송
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}
