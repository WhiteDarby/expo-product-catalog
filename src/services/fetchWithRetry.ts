const MAX_RETRIES = 3;

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

function isRetryableStatus(status: number) {
  return status >= 500 && status <= 599;
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  for (let retry = 0; retry <= MAX_RETRIES; retry += 1) {
    try {
      const response = await fetch(input, init);

      if (response.ok) return response;

      if (!isRetryableStatus(response.status) || retry === MAX_RETRIES) {
        throw new Error(`Request failed with status ${response.status}.`);
      }
    } catch (error) {
      if (retry === MAX_RETRIES) throw error;

      // Fetch failures are usually network errors; HTTP 4xx errors are thrown above
      // and should not be retried.
      if (error instanceof Error && error.message.startsWith('Request failed with status 4')) {
        throw error;
      }
    }

    await wait(1000 * 2 ** retry);
  }

  throw new Error('Request failed after retries.');
}
