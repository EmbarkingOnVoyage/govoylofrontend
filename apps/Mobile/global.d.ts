// @workspace/ui exports everything from one barrel (index.ts), so resolving
// its types here also resolves web-only files it re-exports (e.g. Layout.tsx,
// MenuBar.tsx) that import PNG/SVG assets. Metro never needed these — it
// doesn't type-check — but a standalone `tsc --noEmit` does, so mirror the
// same ambient declarations packages/ui/src/images.d.ts defines for Vite.
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}
