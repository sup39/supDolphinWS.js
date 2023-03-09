export type RequestAddress = number|number[];
export const normalizeRequestAddress = (addr: RequestAddress) =>
  typeof addr === 'number' ? [addr] : addr;
export const getRequestAddressPath = (addr: RequestAddress) =>
  normalizeRequestAddress(addr).map(x => x.toString(16)).join('/');

export const http = ({method, url, body, contentType, responseType=''}: {
  method: string
  url: string|URL
  body?: Parameters<XMLHttpRequest['send']>[0]
  contentType?: string
  responseType?: XMLHttpRequest['responseType']
}) => new Promise<XMLHttpRequest>((rsv, rjt) => {
  const xhr = new XMLHttpRequest();
  xhr.responseType = responseType;
  xhr.onload = () => rsv(xhr);
  xhr.onerror = err => rjt(err);
  xhr.open(method, url);
  if (contentType != null) xhr.setRequestHeader('Content-Type', contentType);
  xhr.send(body);
});
