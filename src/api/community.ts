import { axiosInstance } from "./axiosInstance";
import type { AxiosRequestConfig } from "axios";

/** axios 옵션에 meta(passThrough)만 확장해서 쓰기 위한 지역 타입 */
type WithMeta<D = any> = AxiosRequestConfig<D> & {
  meta?: { passThrough?: boolean };
};

export type UpdateCategory =
  | "TIP"
  | "ITEM"
  | "SHOULD_I_BUY"
  | "CURIOUS";

export type UpdateCommunityRequest = {
  category: UpdateCategory;
  title: string;
  /** 에디터 원문(<!--EXTRA:{...}--> 포함 가능) */
  content: string;
  hashtags: string[];
};

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
  const err: any = new Error(
    typeof msg === "string" ? msg : JSON.stringify(msg)
  );
  err.status = res?.status;
  err.data = data;
  return err;
}

function stablePayload(req: UpdateCommunityRequest) {
  // 서버가 hashtags 또는 hashtagList 어느 쪽을 보더라도 수용되게 둘 다 실어 보냄
  const uniq = Array.from(
    new Set(
      (req.hashtags || [])
        .map((s) => String(s).trim())
        .filter(Boolean)
    )
  );
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
  const o = {
    jsonFieldName: "request",
    jsonAsString: false,
    imageFieldName: "images",
    ...(opt || {}),
  } as const;

  const fd = new FormData();
  const jsonObj = stablePayload(req);

  if (o.jsonAsString) {
    fd.append(o.jsonFieldName, JSON.stringify(jsonObj)); // text/plain
  } else {
    fd.append(
      o.jsonFieldName,
      new Blob([JSON.stringify(jsonObj)], { type: "application/json" })
    );
  }

  if (Array.isArray(files) && files.length > 0) {
    for (const f of files) fd.append(o.imageFieldName, f);
  }

  return fd;
}

/* -------------------- 상세 -------------------- */
export async function getCommunityDetail(params: {
  postId: number;
  page: number;
  size: number;
  sort: "BEST" | "LATEST";
}) {
  const { postId, page, size, sort } = params;
  const res = await axiosInstance.get(
    `/posts/communities/${postId}`,
    {
      params: { page, size, sort },
      validateStatus: () => true,
      meta: { passThrough: true }, // ← envelope 우회
    } as WithMeta
  );
  if (res.status >= 400) throw makeErr(res, `요청 실패(${res.status})`);
  return res.data?.result ?? res.data;
}

/* -------------------- 업데이트 (4단계 폴백) -------------------- */
export async function updateCommunityPost(
  postId: number,
  req: UpdateCommunityRequest,
  files?: File[]
) {
  console.log("=== updateCommunityPost 시작 ===");
  console.log("postId:", postId);
  console.log("req:", req);
  console.log("files:", files);
  console.log("files count:", files?.length ?? 0);

  // 1) request + Blob(JSON) + images
  console.log("시도 1: request + Blob(JSON) + images");
  const formData1 = buildFD(req, files, {
    jsonFieldName: "request",
    jsonAsString: false,
    imageFieldName: "images",
  });
  
  // FormData 내용 로깅
  console.log("FormData 1 내용:");
  for (let [key, value] of formData1.entries()) {
    if (typeof File !== 'undefined' && value instanceof File) {
      console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
    } else if (typeof Blob !== 'undefined' && value instanceof Blob) {
      console.log(`${key}: Blob(${value.size} bytes, ${value.type})`);
    } else {
      console.log(`${key}:`, String(value));
    }
  }

  let res = await axiosInstance.patch(
    `/posts/communities/${postId}`,
    formData1,
    { validateStatus: () => true, meta: { passThrough: true } } as WithMeta<FormData>
  );
  
  console.log("시도 1 응답:", {
    status: res.status,
    statusText: res.statusText,
    data: res.data,
  });
  
  if (res.status < 400) return res.data?.result ?? res.data;

  // 2) request + String(JSON) + images
  res = await axiosInstance.patch(
    `/posts/communities/${postId}`,
    buildFD(req, files, {
      jsonFieldName: "request",
      jsonAsString: true,
      imageFieldName: "images",
    }),
    { validateStatus: () => true, meta: { passThrough: true } } as WithMeta<FormData>
  );
  if (res.status < 400) return res.data?.result ?? res.data;

  // 3) updateRequest + Blob(JSON) + files
  res = await axiosInstance.patch(
    `/posts/communities/${postId}`,
    buildFD(req, files, {
      jsonFieldName: "updateRequest",
      jsonAsString: false,
      imageFieldName: "files",
    }),
    { validateStatus: () => true, meta: { passThrough: true } } as WithMeta<FormData>
  );
  if (res.status < 400) return res.data?.result ?? res.data;

  // 4) 파일이 없으면 application/json (기존 이미지 유지)
  if (!files || files.length === 0) {
    console.log("파일이 없음 - application/json으로 요청 (기존 이미지 유지)");
    const resJson = await axiosInstance.patch(
      `/posts/communities/${postId}`,
      stablePayload(req),
      {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
        meta: { passThrough: true },
      } as WithMeta
    );
    console.log("JSON 요청 응답:", {
      status: resJson.status,
      statusText: resJson.statusText,
      data: resJson.data,
    });
    if (resJson.status < 400) return resJson.data?.result ?? resJson.data;
    throw makeErr(resJson, "잘못된 요청입니다");
  }

  console.log("모든 multipart 시도 실패 - 에러 반환");
  throw makeErr(res, "잘못된 요청입니다");
}

/* -------------------- 삭제 -------------------- */
export async function deleteCommunityPost(postId: number) {
  const res = await axiosInstance.delete(
    `/posts/communities/${postId}`,
    { validateStatus: () => true, meta: { passThrough: true } } as WithMeta
  );
  if (res.status >= 400) throw makeErr(res, "삭제에 실패했습니다");
  return res.data?.result ?? res.data;
}