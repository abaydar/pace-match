if (typeof (global as any).CustomEvent === "undefined") {
  (global as any).CustomEvent = class CustomEvent {
    type: string
    detail: any
    constructor(type: string, init?: { detail?: any }) {
      this.type = type
      this.detail = init?.detail ?? null
    }
  }
}
