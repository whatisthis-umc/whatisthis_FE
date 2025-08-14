import { axiosInstance } from "./axiosInstance";

export type UpdateCategory = "LIFE_TIP" | "LIFE_ITEM" | "BUY_OR_NOT" | "CURIOUS";

export type UpdateCommunityRequest = {
  category: UpdateCategory;
  title: string;
  content: string;   // EXTRA 포함
  hashtags: string[];
};

export async function getCommunityDetail(params: {
  postId: number;
  page: number;
  size: number;
  sort: "BEST" | "LATEST";
}) {
  const { postId, page, size, sort } = params;
  const res = await axiosInstance.get(`/posts/communities/${postId}`, {
    params: { page, size, sort },
    validateStatus: () => true,
    meta: { passThrough: true }, // ← envelope 우회
  });
  if (res.status >= 400) throw makeErr(res, `요청 실패(${res.status})`);
  return res.data?.result ?? res.data;
}

/* -------------------- 공통 유틸 -------------------- */
function makeErr(res: any, fallback: string) {
  const data = res?.data;
  const msg =
    data?.message ??
    data?.error ??
    data?.errors?.[0]?.defaultMessage ??
    data?.errors?.[0]?.message ??
    data?.errors?.[0] ??
    fallback;
  const err: any = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  err.status = res?.status;
  err.data = data;
  return err;
}

function stablePayload(req: UpdateCommunityRequest) {
  // 서버가 hashtags 또는 hashtagList 어느 쪽을 보더라도 수용되게 둘 다 실어 보냄
  const uniq = Array.from(new Set((req.hashtags || []).map((s) => String(s).trim()).filter(Boolean)));
  const withAtLeastOne = uniq.length > 0 ? uniq : ["general"]; // 빈 배열 막는 서버 대비 안전값
  return {
    category: req.category,
    title: String(req.title ?? ""),
    content: String(req.content ?? ""),
    hashtags: withAtLeastOne,
    hashtagList: withAtLeastOne,
  };
}

function buildFD(
  req: UpdateCommunityRequest,
  files?: File[],
  opt?: {
    jsonFieldName?: "request" | "updateRequest";
    jsonAsString?: boolean;
    imageFieldName?: "images" | "files";
  }
) {
  const o = { jsonFieldName: "request", jsonAsString: false, imageFieldName: "images", ...(opt || {}) };
  const fd = new FormData();

  const jsonObj = stablePayload(req);

  if (o.jsonAsString) {
    fd.append(o.jsonFieldName, JSON.stringify(jsonObj)); // text/plain
  } else {
    fd.append(o.jsonFieldName, new Blob([JSON.stringify(jsonObj)], { type: "application/json" }));
  }

  if (Array.isArray(files) && files.length > 0) {
    for (const f of files) fd.append(o.imageFieldName, f);
  }

  // 개발 중 확인용 (원하면 주석 해제)
  // try {
  //   console.log("[update FD dump]", o, Array.from(fd.entries()).map(([k, v]) => [k, v instanceof File ? v.name : v]));
  // } catch {}

  return fd;
}

/* -------------------- 업데이트 (4단계 폴백) -------------------- */
export async function updateCommunityPost(
  postId: number,
  req: UpdateCommunityRequest,
  files?: File[]
) {
  // 1) request + Blob(JSON) + images
  let res = await axiosInstance.patch(
    `/posts/communities/${postId}`,
    buildFD(req, files, { jsonFieldName: "request", jsonAsString: false, imageFieldName: "images" }),
    { validateStatus: () => true, meta: { passThrough: true } }
  );
  if (res.status < 400) return res.data?.result ?? res.data;

  // 2) request + String(JSON) + images
  res = await axiosInstance.patch(
    `/posts/communities/${postId}`,
    buildFD(req, files, { jsonFieldName: "request", jsonAsString: true, imageFieldName: "images" }),
    { validateStatus: () => true, meta: { passThrough: true } }
  );
  if (res.status < 400) return res.data?.result ?? res.data;

  // 3) updateRequest + Blob(JSON) + files
  res = await axiosInstance.patch(
    `/posts/communities/${postId}`,
    buildFD(req, files, { jsonFieldName: "updateRequest", jsonAsString: false, imageFieldName: "files" }),
    { validateStatus: () => true, meta: { passThrough: true } }
  );
  if (res.status < 400) return res.data?.result ?? res.data;

  // 4) 파일이 없으면 application/json
  if (!files || files.length === 0) {
    const resJson = await axiosInstance.patch(
      `/posts/communities/${postId}`,
      stablePayload(req),
      {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
        meta: { passThrough: true },
      }
    );
    if (resJson.status < 400) return resJson.data?.result ?? resJson.data;
    throw makeErr(resJson, "잘못된 요청입니다");
  }

  throw makeErr(res, "잘못된 요청입니다");
}

/* -------------------- 삭제 -------------------- */
export async function deleteCommunityPost(postId: number) {
  const res = await axiosInstance.delete(`/posts/communities/${postId}`, {
    validateStatus: () => true,
    meta: { passThrough: true },
  });
  if (res.status >= 400) throw makeErr(res, "삭제에 실패했습니다");
  return res.data?.result ?? res.data;
}