export const subCategoryEnumMap = {
    "조리/주방":      "COOK_TIP",
    "청소/분리수거":  "CLEAN_TIP",
    "욕실/청결":      "BATHROOM_TIP",
    "세탁/의류관리":  "CLOTH_TIP",
    "보관/유통기한":  "STORAGE_TIP",
    "자취 필수템":    "SELF_LIFE_ITEM",
    "주방템":        "KITCHEN_ITEM",
    "청소템":        "CLEAN_ITEM",
    "살림도구템":    "HOUSEHOLD_ITEM",
    "브랜드 꿀템":    "BRAND_ITEM",
  } as const;
  
  export type SubCategoryKey = keyof typeof subCategoryEnumMap;
  export type SubCategoryEnum = typeof subCategoryEnumMap[SubCategoryKey];
  