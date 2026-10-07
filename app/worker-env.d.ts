export {};

declare global {
  namespace Cloudflare {
    interface Env {
      ZAINAB_ADMIN_KEY?: string;
    }
  }
}
