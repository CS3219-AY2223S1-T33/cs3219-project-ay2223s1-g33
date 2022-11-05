export type Language = "javascript" | "java" | "python" | "go";
export interface Chat {
  from: string;
  message: string;
}

export interface CompletionConfig {
  colorScheme: string;
  badgeText: string;
  btnText: string;
}
