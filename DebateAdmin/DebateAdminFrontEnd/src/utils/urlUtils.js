/**
 * URL 유틸리티 함수
 *
 * URL 처리 관련 유틸리티 함수들을 제공합니다.
 */

// 프로덕션 서버 IP 주소와 도메인 매핑
const IP_TO_DOMAIN_MAP = {
  "13.209.254.24": "debate.me.kr",
  // 필요시 추가 IP 주소 매핑 가능
};

/**
 * IP 주소를 도메인으로 변환
 *
 * @param {string} url - 변환할 URL
 * @returns {string} 도메인으로 변환된 URL
 */
const convertIpToDomain = (url) => {
  if (!url || typeof url !== "string") {
    return url;
  }

  // IP 주소를 도메인으로 변환
  for (const [ip, domain] of Object.entries(IP_TO_DOMAIN_MAP)) {
    // http://IP 또는 https://IP 패턴 매칭
    const ipPattern = new RegExp(
      `(https?://)${ip.replace(/\./g, "\\.")}`,
      "gi"
    );
    if (ipPattern.test(url)) {
      return url.replace(ipPattern, `$1${domain}`);
    }
  }

  return url;
};

/**
 * HTTP URL을 HTTPS로 변환하고 IP 주소를 도메인으로 변환
 *
 * @param {string} url - 변환할 URL
 * @returns {string} HTTPS 도메인 URL로 변환된 URL
 */
export const ensureHttps = (url) => {
  if (!url || typeof url !== "string") {
    return url;
  }

  // 먼저 IP 주소를 도메인으로 변환
  let convertedUrl = convertIpToDomain(url);

  // HTTP로 시작하는 URL을 HTTPS로 변환
  if (convertedUrl.startsWith("http://")) {
    convertedUrl = convertedUrl.replace("http://", "https://");
  }

  return convertedUrl;
};

/**
 * 이미지 URL을 안전하게 처리
 * 상대 경로인 경우 절대 경로로 변환하고, HTTP인 경우 HTTPS로 변환
 *
 * @param {string} imageUrl - 처리할 이미지 URL
 * @returns {string} 처리된 이미지 URL
 */
export const processImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== "string") {
    return imageUrl;
  }

  // 이미 절대 URL인 경우 (http://, https://, data:)
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:")
  ) {
    // HTTP인 경우 HTTPS로 변환
    return ensureHttps(imageUrl);
  }

  // 상대 경로인 경우
  // 현재 페이지가 HTTPS인지 확인하고 HTTPS origin 사용
  const origin = window.location.origin;
  const httpsOrigin = origin.startsWith("http://")
    ? origin.replace("http://", "https://")
    : origin;

  return `${httpsOrigin}${
    imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl
  }`;
};

/**
 * HTML 콘텐츠 내의 모든 HTTP 이미지 URL을 HTTPS로 변환하고 IP 주소를 도메인으로 변환
 *
 * @param {string} html - 변환할 HTML 문자열
 * @returns {string} 변환된 HTML 문자열
 */
export const convertHttpImagesToHttps = (html) => {
  if (!html || typeof html !== "string") {
    return html;
  }

  // img 태그의 src 속성에서 HTTP URL을 HTTPS로 변환하고 IP 주소를 도메인으로 변환
  return html.replace(
    /<img([^>]*)\ssrc=["'](https?:\/\/[^"']+)["']([^>]*)>/gi,
    (match, before, url, after) => {
      // IP 주소를 도메인으로 변환하고 HTTP를 HTTPS로 변환
      const convertedUrl = ensureHttps(url);
      return `<img${before} src="${convertedUrl}"${after}>`;
    }
  );
};
